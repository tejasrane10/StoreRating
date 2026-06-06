import { createSlice } from '@reduxjs/toolkit';

const storedAuth = (() => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem('auth'));
  } catch {
    return null;
  }
})();

const initialState = {
  user: storedAuth?.user || null,
  token: storedAuth?.token || null,
  isAuthenticated: Boolean(storedAuth?.token),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify({
          user: state.user,
          token: state.token,
        }));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
