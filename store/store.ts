import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import authStore from './auth'
import progressStore from './progress'
import notificationsStore from './notifications'

const rootReducer = combineReducers({
    auth: authStore,
    progress: progressStore,
    notifications: notificationsStore,
})

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['progress', 'auth', 'notifications'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: {
            // Ignore redux-persist action types that contain non-serializable values
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch