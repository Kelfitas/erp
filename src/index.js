import React from 'react';
import ReactDOM from 'react-dom';
import 'frontend/index.css';
import App from 'frontend/components/App';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import theme from 'frontend/config/theme';

const AppWithTheme = props => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App {...props} />
  </ThemeProvider>
);

ReactDOM.render(<AppWithTheme />, document.getElementById('root'));
