import { createStore, applyMiddleware } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import rootReducer, { State } from './reducers';
import ActionTypes from 'frontend/types/actions';

let initialState = {};
try {
  initialState = JSON.parse(localStorage.getItem('redux-state') || '');
} catch(err) {
  // pass
}

const store = createStore(
  rootReducer,
  initialState as State,
  applyMiddleware(thunk as ThunkMiddleware<State, ActionTypes>)
);

// export default createStore(rootReducer, initialState);
export default store;
