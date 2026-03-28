import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disabling serializable check for potentially complex user data or navigation/firebase objects
    }),
});

export type AppDispatch = typeof store.dispatch;
export default store;
