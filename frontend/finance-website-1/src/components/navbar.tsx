import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { useUser } from '@/context/UserContext';

const Navbar = () => {
  const { userName } = useUser();
  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <AccountBalance />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Bevolut
        </Typography>
        {userName && (
          <Typography variant="body1" sx={{ marginRight: 2 }}>
            Hi, {userName}!
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href="/" passHref>
            <Button color="inherit">Home</Button>
          </Link>
          <Link href="/transfer" passHref>
            <Button color="inherit">Transfer</Button>
          </Link>
          <Link href="/transfer" passHref>
            <Button color="inherit">Account</Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
