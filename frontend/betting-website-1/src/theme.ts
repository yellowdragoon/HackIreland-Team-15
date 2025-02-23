'use client';
import { purple } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {main: purple[600]},
  },
});

export default theme;
