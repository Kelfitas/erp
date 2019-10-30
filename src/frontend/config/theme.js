import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#556cd6',
      dark: '#333',
    },
    secondary: {
      main: '#19857b',
      dark: '#424242',
    },
    error: {
      main: red.A400,
    },
    background: {
      main: '#fff',
      dark: '#212121',
    },
    type: 'dark',
  },
});

export default theme;
