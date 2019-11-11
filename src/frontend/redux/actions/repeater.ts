import { RepeaterActionTypes } from 'frontend/types/repeater';
import { ADD_REPEATER_DATA, ADD_REPEATER_BULK_DATA, CLEAR_REPEATER_DATA, REMOVE_REPEATER_DATA } from 'frontend/redux/actionTypes';

export function addDataId(id: string): RepeaterActionTypes {
  return {
    type: ADD_REPEATER_DATA,
    id,
  };
};

export function addBulkDataIds(idList: string[]): RepeaterActionTypes {
  return {
    type: ADD_REPEATER_BULK_DATA,
    idList,
  };
};

export function removeData(id: string): RepeaterActionTypes {
  return {
    type: REMOVE_REPEATER_DATA,
    id,
  };
};

export function clearData(): RepeaterActionTypes {
  return {
    type: CLEAR_REPEATER_DATA,
  };
};
