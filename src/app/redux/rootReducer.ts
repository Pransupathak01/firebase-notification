import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './user';

const rootReducer = combineReducers({
  user: userReducer,
  // add other reducers here
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
