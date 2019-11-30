import {
  UPDATE_REPEATER_REQUEST,
  ADD_REPEATER_REQUEST,
  REMOVE_REPEATER_REQUEST,
  CLEAR_REPEATER_REQUESTS
} from 'frontend/redux/actionTypes';
import { Request } from 'frontend/redux/reducers/repeater';
import { Dispatch } from 'redux';

interface ClearRequestsAction {
  type: typeof CLEAR_REPEATER_REQUESTS;
};

interface AddRequestAction {
  type: typeof ADD_REPEATER_REQUEST;
  request: Request;
};

type AddRequestThunkAction = (dispatch: Dispatch<AddRequestAction>) => Promise<AddRequestAction | undefined>;

interface UpdateRequestAction {
  type: typeof UPDATE_REPEATER_REQUEST;
  index: number;
  request: Request;
};

interface RemoveRequestAction {
  type: typeof REMOVE_REPEATER_REQUEST;
  index: number;
};

export type RepeaterActionTypes = (
  ClearRequestsAction
  | AddRequestAction
  | UpdateRequestAction
  | RemoveRequestAction
);
