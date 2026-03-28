import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserProfile, performLogin, performRegister } from './userActions';

interface UserState {
  data: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  data: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
  },
  // Using extraReducers keyword as requested
  extraReducers: (builder) => {
    // Handling fetchUserProfile thunk actions
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Handling performLogin thunk actions
    builder
      .addCase(performLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(performLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Handling performRegister thunk actions
    builder
      .addCase(performRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(performRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setToken } = userSlice.actions;
export default userSlice.reducer;
