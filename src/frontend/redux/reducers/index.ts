import { combineReducers } from 'redux';
import repeater, { RepeaterState } from './repeater';

export type State = {
  repeater: RepeaterState;
}

export default combineReducers<State>({
  repeater
});

