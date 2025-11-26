import { configureStore } from '@reduxjs/toolkit';
import rolePermissionReducer from './slices/rolePermissionSlice';

export const store = configureStore({
  reducer: {
    rolePermission: rolePermissionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

