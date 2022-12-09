import {createSlice} from '@reduxjs/toolkit';

// initial state
const initialState = {
  locked: false,
};

// our slice
const lockedSlice = createSlice({
  name: 'lock',
  initialState: initialState,
  reducers: {
    lock: state => {
      state.locked = true;
    },
    unlock: state => {
      state.locked = false;
    },
  },
});

// export the actions
export const {lock, unlock} = lockedSlice.actions;

//Declare state selector
export const controlLock = state => state.lockedState;

// export the default reducer
export default lockedSlice.reducer;
