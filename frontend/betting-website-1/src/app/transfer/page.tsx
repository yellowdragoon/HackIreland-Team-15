'use client'

import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert, AppBar } from '@mui/material';
import Navbar from '@/components/navbar';

const TransferPage = () => {
  // Example initial balance
  const [balance, setBalance] = useState<number>(1000);
  const [recipient, setRecipient] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate that transfer amount is positive and doesn't exceed available balance
    if (transferAmount <= 0) {
      setMessage('Transfer amount must be greater than zero.');
      return;
    }
    if (transferAmount > balance) {
      setMessage('Insufficient funds.');
      return;
    }

    const formData = new FormData();

    // Process the transfer (update balance and display a success message)
    setBalance(prevBalance => prevBalance - transferAmount);
    setMessage(`Successfully sent $${transferAmount.toFixed(2)} to ${recipient}.`);

    // Clear the form inputs
    setRecipient('');
    setTransferAmount(0);
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
    </Container>
    </>
  );
};

export default TransferPage;