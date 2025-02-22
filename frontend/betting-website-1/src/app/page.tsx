'use client'

import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, Button } from '@mui/material';
import Navbar from '@/components/navbar';
// import { headers } from 'next/headers'  

export default function Home() {
  const [name, setName] = useState('');
  const [passportPhoto, setPassportPhoto] = useState<File>(null);
  const [ip, setIp] = useState<string>("");

  // useEffect(() => {
  //   async function fetchData() {
  //     const header = await headers();
  //     const headerIp = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
  //     setIp(headerIp);
  //   }
  //   fetchData();
  // }, []);

  const handleFileChange = (e) => {
    setPassportPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Name:', name);
    console.log('Passport Photo:', passportPhoto);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('passportPhoto', "testString");
    // formData.append('ip', ip);
    console.log(formData);
    try{
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any other necessary headers
        },
        body: JSON.stringify({'name': name, 'passportPhoto': 'testString'}),
      });

      if (!response.ok) {
        throw new Error('Failed to sign up');
      }

      console.log(response);
      console.log(response.body);

      const data = await response.json();
      console.log('Success:', data);

    } catch (err) {
      console.error('Error:', err);
    }
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
