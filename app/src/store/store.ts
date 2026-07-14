import { productsReducer } from "@/modules/coffee/store/products.slice";
import { presignedReducer } from "@/modules/presigned/store/presigned.slice";
import { transactionReducer } from "@/modules/transaction/store/transaction.slice";
import { secureStorage } from "@/store/secure-storage";
import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";

const transactionPersistConfig = {
  key: "transaction",
  storage: secureStorage,
  whitelist: ["init", "result"],
};

const persistedTransactionReducer = persistReducer(
  transactionPersistConfig,
  transactionReducer,
);

export const store = configureStore({
  reducer: {
    products: productsReducer,
    presigned: presignedReducer,
    transaction: persistedTransactionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
