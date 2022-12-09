import {createSlice} from '@reduxjs/toolkit';
import axios from 'axios';

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

// set up axios - simple json-server prototype config here
const api = axios.create({
  baseURL: 'http://lock-screen-backend.overflowhosting.tech/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// fetch all items
export function loginRequest(email, password) {
  return async dispatch => {
    api
      .post('/api/users/login', {email: email, password: password})
      .then(response => {
        dispatch(fulfilled(response.data));
      })
      .catch(error => {
        dispatch(rejected());
      });
  };
}
