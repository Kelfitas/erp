import { createStore } from 'redux';
import rootReducer from './reducers';

let initialState = {};
try {
  initialState = JSON.parse(localStorage.getItem('redux-state') || '');
} catch(err) {
  // pass
}

export default createStore(rootReducer, initialState);
