import { ADD_REPEATER_DATA, CLEAR_REPEATER_DATA, ADD_REPEATER_BULK_DATA, REMOVE_REPEATER_DATA } from 'frontend/redux/actionTypes';

interface AddDataAction {
  type: typeof ADD_REPEATER_DATA;
  id: string;
};

interface AddBulkDataAction {
  type: typeof ADD_REPEATER_BULK_DATA;
  idList: string[];
};

interface RemoveDataAction {
  type: typeof REMOVE_REPEATER_DATA;
  id: string;
};

interface ClearDataAction {
  type: typeof CLEAR_REPEATER_DATA;
};

export type RepeaterActionTypes = ClearDataAction | RemoveDataAction | AddBulkDataAction | AddDataAction;
