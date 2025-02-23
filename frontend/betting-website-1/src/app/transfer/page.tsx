'use client'

import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert } from '@mui/material';
import Navbar from '@/components/navbar';
import { useUser } from '@/context/UserContext';

const TransferPage = () => {
  const [balance, setBalance] = useState<number>(100000);
  const [recipient, setRecipient] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const { userName, userPassport } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (transferAmount <= 0) {
      setMessage('Transfer amount must be greater than zero.');
      return;
    }
    if (transferAmount > balance) {
      setMessage('Insufficient funds.');
      return;
    }

    try{
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({'name': userName, 'passport_string': userPassport, 'amount': transferAmount}),
      });

      if (!response.ok) {
        throw new Error('Failed to sign up');
      }

      console.log(response);
      console.log(response.body);

      const { ref_score } = await response.json();
      console.log('Success:', ref_score);

      if(parseInt(ref_score) > 0){
        console.log("FRAUD ALERT");
        throw new Error("FRAUDSTER DETECTED");
      }

      setBalance(prevBalance => prevBalance - transferAmount);
      setMessage(`Successfully sent $${transferAmount.toFixed(2)} to ${recipient}.`);

    } catch (err) {
      console.error('Error:', err);
    }

    setRecipient('');
    setTransferAmount(0);
  };

  const handleCommitFraud = async () => {
    console.log('Commit fraud button clicked');

    try{
      const response = await fetch('/api/breach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({'user_id': userName, 'company_id': 'Stripe', 'breach_type_id': '123', 'description': 'Credit fraud', 'severity': 10}),
      });

      if (!response.ok) {
        throw new Error('Failed to sign up');
      }

      console.log(response);
      console.log(response.body);

      const { ref_score } = await response.json();
      console.log('Success:', ref_score);
    } catch(err){

    }
    setMessage('Fraud committed. Please contact support for further actions.');
  };

  return (
    <>
    <Navbar />
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Transfer Money
      </Typography>
      <Typography variant="h6" align="center" gutterBottom>
        Current Balance: ${balance.toFixed(2)}
      </Typography>
      {message && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <TextField
          label="Recipient Name"
          variant="outlined"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          required
        />
        <TextField
          label="Transfer Amount"
          variant="outlined"
          type="number"
          value={transferAmount}
          onChange={(e) => setTransferAmount(parseFloat(e.target.value))}
          required
          inputProps={{ min: '0', step: '0.01' }}
        />
        <Button type="submit" variant="contained" color="primary">
          Send Money
        </Button>
      </Box>
       {/* Fraud button */}
       <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="error" onClick={handleCommitFraud}>
            Commit Fraud
          </Button>
        </Box>
    </Container>
    </>
  );
};

export default TransferPage;