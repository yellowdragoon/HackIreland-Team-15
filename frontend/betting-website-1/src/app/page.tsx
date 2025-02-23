'use client'

import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button } from '@mui/material';
import Navbar from '@/components/navbar';
import { useUser } from '@/context/UserContext';
import hashFile from '@/lib/hash';
import { redirect } from 'next/navigation';

export default function Home() {
  const [name, setName] = useState('');
  const [passportPhoto, setPassportPhoto] = useState<File>(null);
  const { setUserName, setUserPassport } = useUser();

  const handleFileChange = (e) => {
    setPassportPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Name:', name);
    console.log('Passport Photo:', passportPhoto);

    console.log(await hashFile(passportPhoto));

    try{
      const photoHash = await hashFile(passportPhoto);
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({'name': name, 'passport_string': photoHash}),
      });

      if (!response.ok) {
        throw new Error('Failed to sign up');
      }

      console.log(response);
      console.log(response.body);

      const data = await response.json();
      console.log('Success:', data);

      setUserName(name);
      setUserPassport(photoHash);

    } catch (err) {
      console.error('Error:', err);
    }

    redirect('/transfer');
  };
  return (
    <>
    <Navbar />
    <Container maxWidth="sm" sx={{marginTop: "75px"}}>
    <Typography variant="h4" align="center" gutterBottom>
      Sign Up
    </Typography>
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 3,
      }}
    >
      <TextField
        label="Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Button variant="contained" component="label">
        Upload Passport Photo
        <input
          type="file"
          hidden
          onChange={handleFileChange}
          accept="image/*"
        />
      </Button>
      {passportPhoto && (
        <Typography variant="body2">
          Selected file: {passportPhoto.name}
        </Typography>
      )}
      <Button type="submit" variant="contained" color="primary">
        Complete Sign Up
      </Button>
    </Box>
    </Container>
  </>
  );
}
