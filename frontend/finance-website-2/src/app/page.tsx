'use client'

import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Card, Paper } from '@mui/material';
import Navbar from '@/components/navbar';
import { useUser } from '@/context/UserContext';
import hashFile from '@/lib/hash';
import { redirect } from 'next/navigation';
import { responsiveProperty } from '@mui/material/styles/cssUtils';
import { blueGrey, orange, pink } from '@mui/material/colors';

export default function Home() {
  const [name, setName] = useState('');
  const [passportPhoto, setPassportPhoto] = useState<File>(null);
  const { setUserName, setUserPassport, setUserId } = useUser();

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

      // const j = await response.json();
      // console.log(j);

      const { _id } = await response.json();
      console.log('Success:', _id);
      setUserId(_id);
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
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Box
          sx={{
            flex: 1,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Sign Up
          </Typography>
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
        </Box>

        <Box
          sx={{
            flex: 1,
            position: 'relative',
            backgroundColor: blueGrey[600],
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            overflow: 'hidden',
          }}
        >
          <Typography variant="h3" align="center" sx={{ zIndex: 1, px: 2 }}>
            Think Stripe, but for butchers.
          </Typography>
        </Box>
      </Box>
  </>
  );
}
