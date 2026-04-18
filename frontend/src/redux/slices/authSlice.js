import { createSlice } from '@reduxjs/toolkit';

// Get user from localStorage
const storedUser = localStorage.getItem('user');
let user = null;
if (storedUser) {
  try {
    user = JSON.parse(storedUser);
    // Ensure user has name and userName properties
    if (user && !user.name) {
      user.name = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.firstName || user.email?.split('@')[0] || 'User';
    }
    if (user && !user.userName) {
      user.userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.firstName || user.email?.split('@')[0] || 'User';
    }
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
    user = null;
  }
}

const initialState = {
  user: user || null,
  isAuthenticated: !!user,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      if (action.payload) {
        // Enhance user object with full name and ensure photo is included
        const userData = {
          ...action.payload,
          name: action.payload.firstName && action.payload.lastName 
            ? `${action.payload.firstName} ${action.payload.lastName}`.trim()
            : action.payload.firstName || action.payload.email?.split('@')[0] || 'User',
          userName: action.payload.firstName && action.payload.lastName 
            ? `${action.payload.firstName} ${action.payload.lastName}`.trim()
            : action.payload.firstName || action.payload.email?.split('@')[0] || 'User'
        };
        state.user = userData;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('user');
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
  },
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;

export default authSlice.reducer;