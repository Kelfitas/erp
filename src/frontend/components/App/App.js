import React from 'react';
import './App.css';
import NavBar from './components/NavBar';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import { useTheme } from '@material-ui/core/styles';
import { useStyles } from './styles';

const electron = window.require('electron');

console.log(electron);

const App = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className="App">
      <NavBar classes={classes} open={open} setOpen={setOpen} />
      <Container maxWidth="sm">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create React App v4-beta example
          </Typography>
        </Box>
      </Container>
    </div>
  );
}

export default App;
