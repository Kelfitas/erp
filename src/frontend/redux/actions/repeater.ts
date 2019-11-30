import { RepeaterActionTypes } from 'frontend/types/repeater';
import {
  ADD_REPEATER_REQUEST,
  UPDATE_REPEATER_REQUEST,
  REMOVE_REPEATER_REQUEST,
  CLEAR_REPEATER_REQUESTS,
} from 'frontend/redux/actionTypes';
import { Request } from 'frontend/redux/reducers/repeater';
import { Dispatch } from 'redux';
import api from 'frontend/lib/api';
import { ThunkDispatch } from 'redux-thunk';

export const addRequestId = (id: string) => async (dispatch: Dispatch) => {
  try {
    const res = await api.getHistoryItem(id);
    const { requestBuffer } = res.data.connection;
    const value = Buffer.from(requestBuffer.data).toString();

    return dispatch({
      type: ADD_REPEATER_REQUEST,
      request: {
        id, value,
      } as Request,
    });
  } catch (e) {
    alert(JSON.stringify(e));
  }
  // return dispatch({
  //   type: ADD_REPEATER_REQUEST,
  //   request: {
  //     id, value,
  //   } as Request,
  // });
};

export const addBulkRequestIds = (idList: string[]) => (dispatch: ThunkDispatch<any, any, any>) => {
  for (let i = 0; i < idList.length; i++) {
    dispatch(addRequestId(idList[i]));
  }
};

export function clearRequests(): RepeaterActionTypes {
  return {
    type: CLEAR_REPEATER_REQUESTS,
  };
};

export function addRequest(id: string, value: string): RepeaterActionTypes {
  return {
    type: ADD_REPEATER_REQUEST,
    request: {
      id, value,
    } as Request
  };
};

export function updateRequest(index: number, value: string): RepeaterActionTypes {
  return {
    type: UPDATE_REPEATER_REQUEST,
    index,
    request: {
      value,
    } as Request
  };
};

export function removeRequest(index: number): RepeaterActionTypes {
  return {
    type: REMOVE_REPEATER_REQUEST,
    index,
  };
};
