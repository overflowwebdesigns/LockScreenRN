import {createSlice} from '@reduxjs/toolkit';
import SecureHttpClient from '../src/services/SecureHttpClient';

// initial state
const initialState = {
  loading: false,
  error: null,
  userInfo: {
    name: null,
    email: null,
    token: null,
    _id: null,
  },
};

// our slice
const loginSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    logout: state => {
      state.loading = false;
      state.userInfo._id = null;
      state.userInfo.name = null;
      state.userInfo.email = null;
      state.userInfo.token = null;
      state.error = null;
    },
    pending: (state, action) => {
      state.loading = true;
    },
    fulfilled: (state, action) => {
      state.userInfo = action.payload;
      state.loading = false;
    },
    rejected: (state, action) => {
      state.loading = false;
      state.error = 'Login Failed!';
    },
    clear: state => {
      state.error = null;
    },
  },
});

// export the actions
export const {logout, pending, fulfilled, rejected, clear} = loginSlice.actions;

//Declare state selector
export const selectUser = state => state.userLogin;

// export the default reducer
export default loginSlice.reducer;

// Login request using secure HTTP client with certificate pinning
export function loginRequest(email, password) {
  return async dispatch => {
    try {
      dispatch(pending());
      
      const response = await SecureHttpClient.post('/api/users/login', {
        email: email,
        password: password,
      });
      
      dispatch(fulfilled(response));
    } catch (error) {
      console.error('Login request failed:', error);
      
      // Handle certificate pinning failures
      if (error.message && error.message.includes('Certificate validation failed')) {
        dispatch(rejected('Security error: Connection may be compromised'));
      } else {
        dispatch(rejected());
      }
    }
  };
}
