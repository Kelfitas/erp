import {
  ADD_REPEATER_REQUEST,
  UPDATE_REPEATER_REQUEST,
  REMOVE_REPEATER_REQUEST,
  CLEAR_REPEATER_REQUESTS,
} from 'frontend/redux/actionTypes';

export type Request = {
  readonly id: string;
  readonly value: string;
};

export type RepeaterState = {
  readonly requests: ReadonlyArray<Request>;
};

export type RepeaterAction = {
  readonly type: string;
  readonly id: string;
  readonly idList: string[];
  readonly index: number;
  readonly request: Request;
};

const initialState: RepeaterState = {
  requests: [],
};

export default function(
  state: RepeaterState = initialState,
  action: RepeaterAction
): RepeaterState {
  switch (action.type) {
    case CLEAR_REPEATER_REQUESTS: {
      return {
        ...initialState,
      };
    }
    case ADD_REPEATER_REQUEST:
      return {
        ...state,
        requests: [...state.requests, action.request],
      };
    case UPDATE_REPEATER_REQUEST:
      const items = [...state.requests];
      items[action.index] = {
        ...items[action.index],
        ...action.request,
      };

      return {
        ...state,
        requests: items,
      };
    case REMOVE_REPEATER_REQUEST:
      return {
        ...state,
        requests: [
          ...state.requests.slice(0, action.index),
          ...state.requests.slice(action.index + 1),
        ]
      };
    default:
      return state;
  }
}

