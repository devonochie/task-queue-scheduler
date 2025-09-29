import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './slices/jobsSlice';
import workersReducer from './slices/workersSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    workers: workersReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;