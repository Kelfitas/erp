import React from 'react';
import clsx from 'clsx';
import NavBar from './components/NavBar';
import { useStyles } from './styles';
import Dashboard from 'frontend/scenes/Dashboard';
import Repeater from 'frontend/scenes/Repeater';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

// const electron = window.require('electron');
// console.log(electron);

const App = () => {
  const classes = useStyles();
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
            <Switch>
              <Route path="/repeater/"><Repeater /></Route>
              <Route path="/" exact><Dashboard /></Route>
            </Switch>
        </main>
      </Router>
    </div>
  );
}

export default App;
