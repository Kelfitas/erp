import React from 'react';
import clsx from 'clsx';
import NavBar from './components/NavBar';
import Container from '@material-ui/core/Container';
import { useTheme } from '@material-ui/core/styles';
import { useStyles } from './styles';
import Dashboard from 'frontend/scenes/Dashboard';
import Repeater from 'frontend/scenes/Repeater';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

// const electron = window.require('electron');
// console.log(electron);

const App = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className="App">
      <Router>
        <NavBar
          classes={classes}
          open={open}
          setOpen={setOpen}
          handleDrawerClose={handleDrawerClose}
          handleDrawerOpen={handleDrawerOpen}
        />
        <main
          className={clsx(classes.content, {
            [classes.contentShift]: open,
          })}
        >
          <div className={classes.drawerHeader} />
          {/* <Container> */}
            <Switch>
              {/* <Route path="/repeater/:id" exact><Repeater /></Route> */}
              <Route path="/repeater/"><Repeater /></Route>
              <Route path="/" exact><Dashboard /></Route>
            </Switch>
          {/* </Container> */}
        </main>
      </Router>
    </div>
  );
}

export default App;
