import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import themeReducer from './features/themeSlice';
import authReducer from './AuthSlice/authslice'
import paymentreducer from './Slices/paymentslice'
import customerReducer from './Slices/customerSlice'
import loanReducer from './Slices/loanSlice'
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

//persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['theme', 'auth'],
}

const rootReducer = combineReducers({
  theme: themeReducer,
  auth: authReducer,
  payment: paymentreducer,
  customer: customerReducer,
  loanstore:loanReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store); // In this case, persistor is the store itself since we're not using redux-persist's PersistStore