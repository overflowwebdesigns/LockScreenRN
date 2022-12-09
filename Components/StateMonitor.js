import React, {useState, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {AppState, Text} from 'react-native';
import {lock, unlock} from '../Reducers/lockSlice';

const StateMonitor = () => {
  const dispatch = useDispatch();

  const appState = useRef(AppState.currentState);

  const lockedState = useSelector(state => state.lockedState);
  const {locked} = lockedState;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        dispatch(lock());
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return;
};

export default StateMonitor;
