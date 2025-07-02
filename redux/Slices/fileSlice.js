import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { customFetch } from "../../Utils/customFetch";
import API_URL from "../BaseUrl/baseurl";

export const customeruploadFiles = createAsyncThunk(
    "upload/file",
    async (formData, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.accessToken;
            console.log(formData, "formdata");
            
            const response = await fetch(`${API_URL}files/customers/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                return rejectWithValue(result.message || "Upload failed");
            }

            return result;
        } catch (error) {
            return rejectWithValue(error.message || "Unexpected error");
        }
    }
);

export const getCustomerFiles = createAsyncThunk(
    "getcustomerdata/file",
    async (data, { rejectWithValue }) => {
        try {
            const response = await customFetch.get(`files/customers?customer_id=${data.id}&file_type=${data.file_type}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const getsinglefileDownlaod = createAsyncThunk(
    "getsinglefileDownlaod/file",
    async (id, { rejectWithValue }) => {
        try {
            const response = await customFetch.get(`files/download?file_id=${id}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const deleteCustomerFile = createAsyncThunk(
    "delete/file",
    async (id, { rejectWithValue }) => {
        try {
            const response = await customFetch.delete(`files?file_id=${id}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const fileSliece = createSlice({
    name: 'file',
    initialState: {
        file: null,
        isCustomerfileloading: false,
        customerfiles: [],
        customerfileerror: null,
        uploadLoading: false,
        uploadingErrors: null,
        getsinglefileDownlaodloading: false,
        getsinglefileDownlaoderror: null,
        getsinglefile: {}
    },
    reducers: {
        clearSingleFile: (state) => {
            state.getsinglefile = null;
            state.getsinglefileDownlaoderror = null;
        }
    },
    extraReducers: ((builder) => {
        builder
            .addCase(customeruploadFiles.pending, (state) => {
                state.uploadLoading = true;
                state.uploadingErrors = null;
            })
            .addCase(customeruploadFiles.fulfilled, (state, action) => {
                state.uploadLoading = false;
                state.uploadingErrors = null;
            })
            .addCase(customeruploadFiles.rejected, (state, action) => {
                state.uploadLoading = false;
                state.uploadingErrors = action.error;
            })
            .addCase(getCustomerFiles.pending, (state) => {
                state.isCustomerfileloading = true;
                state.customerfileerror = null;
            })
            .addCase(getCustomerFiles.fulfilled, (state, action) => {
                state.isCustomerfileloading = false;
                state.customerfileerror = null;
                state.customerfiles = action.payload.data;
            })
            .addCase(getCustomerFiles.rejected, (state, action) => {
                state.isCustomerfileloading = false;
                state.customerfileerror = action.error;
            })
            .addCase(deleteCustomerFile.pending, (state) => {
                state.getsinglefileDownlaodloading = true;
                state.getsinglefileDownlaoderror = null;
            })
            .addCase(deleteCustomerFile.fulfilled, (state, action) => {
                state.getsinglefileDownlaodloading = false;
                state.getsinglefileDownlaoderror = null;
            })
            .addCase(deleteCustomerFile.rejected, (state, action) => {
                state.getsinglefileDownlaodloading = false;
                state.getsinglefileDownlaoderror = action.error;
            })
            .addCase(getsinglefileDownlaod.pending, (state) => {
                state.getsinglefileDownlaodloading = true;
                state.getsinglefileDownlaoderror = null;
            })
            .addCase(getsinglefileDownlaod.fulfilled, (state, action) => {
                state.getsinglefileDownlaodloading = false;
                state.getsinglefile = action.payload;
                state.getsinglefileDownlaoderror = null;
            })
            .addCase(getsinglefileDownlaod.rejected, (state, action) => {
                state.getsinglefileDownlaodloading = false;
                state.getsinglefileDownlaoderror = action.error;
            })
    })
});
export const { clearSingleFile } = fileSliece.actions
export default fileSliece.reducer