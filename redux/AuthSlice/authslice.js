import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { customFetch } from '../../Utils/customFetch';
const IntialState = {
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refershToken: null,
    isLoading: false,
    error: null,
};

export const loginAPi = createAsyncThunk(
    "auth/login",
    async (Data, { rejectWithValue }) => {
        try {
            const response = customFetch.post('auth/login', Data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const logoutAPI = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            const response = customFetch.post('auth/logout');
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const getAgentuserData = createAsyncThunk(
    "getuserdata/fieldagent",
    async (id, { rejectWithValue }) => {
        try {
            const response = customFetch.get(`users/${id}`);
            return response;
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)

export const updateAgentuserData = createAsyncThunk(
    "update/agentdata",
    async (data, { rejectWithValue }) => {
        try {
            const response = customFetch.put(`users/${data.id}`, data.payloads);
            console.log(response, "check re");
            return response;
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)
const authSlice = createSlice({
    name: 'auth',
    initialState: IntialState,
    reducers: {
        setTokens: (state, action) => {
            state.accessToken = action.payload.accessToken;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginAPi.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAPi.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.accessToken = action.payload.data.access_token;
                state.refershToken = action.payload.data.refresh_token;
            })
            .addCase(loginAPi.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(getAgentuserData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAgentuserData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(getAgentuserData.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.error.message
            })
            .addCase(updateAgentuserData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateAgentuserData.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(updateAgentuserData.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.error.message
            })
    }
});

export const { setTokens } = authSlice.actions;
export default authSlice.reducer;