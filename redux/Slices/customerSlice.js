import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { customFetch } from "../../Utils/customFetch";

const initialState = {
    isloadingcustomer: false,
    CustomerByagent: [],
    totalCustomer: 0,
    hasMorecutomer: true,
    customerError: null,
    getsinglecustomerdetailsData: {}
}

export const getallcustomer = createAsyncThunk(
    "getall/customerdata",
    async (data, { rejectWithValue }) => {
        try {
            const response = await customFetch.get(`customers?page=${data.page}&limit=20&search=${data.search}&place_name=&district=&created_by=`);
            console.log(response, "newa");

            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const createCustomer = createAsyncThunk(
    "create/customer",
    async (data, { rejectWithValue }) => {
        try {
            const response = await customFetch.post("customers", data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const getsingleCustomerdetails = createAsyncThunk(
    "getsingle/cutomer",
    async (id, { rejectWithValue }) => {
        try {
            const response = await customFetch.get(`customers/${id}`);
            console.log(response,"getsingle");
            
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const updateCustomer = createAsyncThunk(
    "update/customer",
    async (data, { rejectWithValue }) => {
        try {
            const response = await customFetch.put(`customers/${data.id}`, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const customerSlice = createSlice({
    name: "customer",
    initialState: initialState,
    reducers: {
        clearsinglecustomerdetails: (state) => {
            state.getsinglecustomerdetailsData = {};
        },
        clearError:(state)=>{
            state.customerError=null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getallcustomer.pending, (state) => {
                state.isloadingcustomer = true;
                state.customerError = null;
            })
            .addCase(getallcustomer.fulfilled, (state, action) => {
                state.isloadingcustomer = false;
                state.customerError = null;
                // Check if we're refreshing (limit === 10) or loading more
                if (action.payload.pagination.page === 1) {
                    state.CustomerByagent = action.payload.data;
                } else {
                    // Loading more - append new data
                    state.CustomerByagent = [...state.CustomerByagent, ...action.payload.data];
                }
                if (action.payload.data.length > 0) {
                    state.totalCustomer = action.payload.pagination.total;
                }
                state.hasMorecutomer = action.payload.pagination.page < action.payload.pagination.total_pages;
            })
            .addCase(getallcustomer.rejected, (state, action) => {
                state.isloadingcustomer = false;
                state.customerError = action.error;
            })
            .addCase(createCustomer.pending, (state) => {
                state.isloadingcustomer = true;
            })
            .addCase(createCustomer.fulfilled, (state) => {
                state.isloadingcustomer = false;
            })
            .addCase(createCustomer.rejected, (state) => {
                state.isloadingcustomer = false;
            })
             .addCase(getsingleCustomerdetails.pending, (state) => {
                state.isloadingcustomer = true;
                state.getsinglecustomerdetailsData={};
            })
            .addCase(getsingleCustomerdetails.fulfilled, (state,action) => {
                state.isloadingcustomer = false;
                state.getsinglecustomerdetailsData=action.payload;
            })
            .addCase(getsingleCustomerdetails.rejected, (state,action) => {
                state.isloadingcustomer = false;
                state.customerError=action.error;
            })
            .addCase(updateCustomer.pending, (state) => {
                state.isloadingcustomer = true;
            })
            .addCase(updateCustomer.fulfilled, (state) => {
                state.isloadingcustomer = false;
            })
            .addCase(updateCustomer.rejected, (state) => {
                state.isloadingcustomer = false;
            })
    }
})
export const { clearsinglecustomerdetails } = customerSlice.actions;
export default customerSlice.reducer;