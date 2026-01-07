import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
    id: string | string[] | null;
    userName: string | null;
    type: string | null;
}

type AppProgress = {
    currentRoute: string | null;
    user: UserProfile | null;
    prevRoute: string | null;
    pageProgress: Record<string, Record<string, any>>;
}

const initialProgress: AppProgress = {
    currentRoute: null,
    user: {id: null, userName: null, type: null},
    prevRoute: null,
    pageProgress: {}
}

const session = createSlice({
    name: 'session',
    initialState: initialProgress,
    reducers: {
        setCurrentRoute(state, action: PayloadAction<{pageId: string | null; user?: UserProfile | null}>) {
            const mainTabs = ['home', 'recent', 'saved', 'group', 'statistic', 'profile'];
            const isMainTab = action.payload.pageId && mainTabs.includes(action.payload.pageId);
            
            if (isMainTab && state.currentRoute !== action.payload.pageId) {
                state.prevRoute = state.currentRoute;
                state.currentRoute = action.payload.pageId;
            } else if (!isMainTab) {
                // Nếu không phải main tab, chỉ cập nhật prevRoute
                state.prevRoute = state.currentRoute;
                // Không cập nhật currentRoute
            }
            state.user = action.payload.user ?? null;
        },
        updatePageProgress(state, action: PayloadAction<{ pageId: string; data: Record<string, any> }>) {
            const { pageId, data } = action.payload;
            state.pageProgress[pageId] = { ...(state.pageProgress[pageId] || {}), ...data };
        },
        clearPageProgress(state, action: PayloadAction<string>) {
            delete state.pageProgress[action.payload];
        },
        clearSession(state) {
            state.currentRoute = null;
            state.prevRoute = null;
            state.user = null;
            state.pageProgress = {};
        },
        validateCurrentRoute(state) {
            const mainTabs = ['home', 'recent', 'saved', 'group', 'statistic', 'profile'];
            if (!state.currentRoute || !mainTabs.includes(state.currentRoute)) {
                state.currentRoute = 'home';
            }
        }
    }
 })

export const { setCurrentRoute, updatePageProgress, clearPageProgress, clearSession, validateCurrentRoute } = session.actions;
export default session.reducer;