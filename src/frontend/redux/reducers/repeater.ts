import { ADD_REPEATER_DATA, CLEAR_REPEATER_DATA, ADD_REPEATER_BULK_DATA, REMOVE_REPEATER_DATA } from 'frontend/redux/actionTypes';
import { Data } from 'frontend/types/connection';

export type RepeaterState = {
  readonly ids: ReadonlyArray<string>;
};

export type RepeaterAction = {
  readonly type: string;
  readonly id: string;
  readonly idList: string[];
};

const initialState: RepeaterState = {
  ids: [],
};

export default function(
  state: RepeaterState = initialState,
  action: RepeaterAction
): RepeaterState {
  console.log(state, action);
  switch (action.type) {
    case ADD_REPEATER_DATA: {
      return {
        ...state,
        ids: [...state.ids, action.id],
      };
    }
    case ADD_REPEATER_BULK_DATA: {
      return {
        ...state,
        ids: [...state.ids, ...action.idList],
      };
    }
    case REMOVE_REPEATER_DATA: {
      return {
        ...state,
        ids: state.ids.filter(id => id !== action.id),
      };
    }
    case CLEAR_REPEATER_DATA: {
      return {
        ...initialState,
      };
    }
    default:
      return state;
  }
}

