import React from 'react';
import ReactDOM from 'react-dom';
import App from 'frontend/components/App';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import theme from 'frontend/config/theme';
import throttle from 'lodash/throttle';

import store from 'frontend/redux/store';
import { Provider } from 'react-redux';

import 'typeface-roboto';

store.subscribe(throttle(() => {
  const state = store.getState();
  localStorage.setItem('redux-state', JSON.stringify(state));
}, 1000));

const AppWithTheme = props => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App {...props} />
    </ThemeProvider>
  </Provider>
);

ReactDOM.render(<AppWithTheme />, document.getElementById('root'));
