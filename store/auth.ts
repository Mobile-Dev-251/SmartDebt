import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist';

interface AuthInfo {
    user: any;
    token: string | null;
    isLoading: boolean;
}

const initialState: AuthInfo = {
    user: null,
    token: null,
    isLoading: true
}

const authSlice = createSlice({
    name: 'authen',
    initialState,
    reducers: {
        logIn: (state, action: PayloadAction<{user: any; token: string}>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isLoading = false;
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
            state.isLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(REHYDRATE, (state, action: any) => {        console.log('REHYDRATE auth:', action.payload);        state.isLoading = false;
    
        // Data recovered succcessfully
        if (action.payload && action.payload.auth) {
            state.user = action.payload.auth.user;
            state.token = action.payload.auth.token;
        }
    });
  },
})

export const {logIn, logOut} = authSlice.actions
export default authSlice.reducer