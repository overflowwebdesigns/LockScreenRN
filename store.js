import {createStore, applyMiddleware, combineReducers, compose} from 'redux';
import thunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly';
import {persistStore, persistReducer} from 'redux-persist';
import EncryptedStorage from 'react-native-encrypted-storage';

//Bring in components
import loginSlice from './Reducers/loginSlice';
import lockSlice from './Reducers/lockSlice';

const persistConfig = {
  key: 'root',
  storage: EncryptedStorage,
};

const reducer = combineReducers({
  userLogin: loginSlice,
  lockedState: lockSlice,
});

const persistedReducer = persistReducer(persistConfig, reducer);

const middleware = [thunk];

const store = createStore(
  persistedReducer,
  composeWithDevTools(applyMiddleware(...middleware)),
);

export const persistor = persistStore(store);
export default store;
