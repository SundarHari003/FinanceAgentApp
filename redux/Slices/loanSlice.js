import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { customFetch } from "../../Utils/customFetch";

const initialState = {
    isLoadingLoan: false,
    calculating:false,
    CalualteRepaymentData: [],
    Allloanhistory: [],
    loanerror: null,
    newError: null,
    hasMore: true,
    totalLoans: 0,
    singlerepaymentdetails: {},
    SingleLoanrepaymentsData: {},
    OneLoanDetails: {}
}

export const calculateloanrepayments = createAsyncThunk(
    "calculate/repayment",
    async (data, { rejectWithValue }) => {
        try {
            const response = await customFetch.post(`loans/preview`, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }

)

export const createLoanforcustomer = createAsyncThunk(
    "create/loanforcustomer",
    async (data, { rejectWithValue }) => {
        try {
            const response = await customFetch.post(`loans`, data);
            console.log(response, "lohtf");

            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
export const singleLoanRepaymentsAPI = createAsyncThunk(
    "getsingle/loanrepayment",
    async (id, { rejectWithValue }) => {
        try {
            const response = await customFetch.get(`loans/${id}/schedule`);
            console.log(response, "loanrepayments");
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const gellloandataapi = createAsyncThunk(
    "getall/loanhistory",
    async (data, { rejectWithValue }) => {
        try {
            const response = await customFetch.get(`loans?page=${data.page}&limit=20&customer_id=${data.customer_id || ''}&status=${data.status}&payment_frequency=${data.paymentfrequency}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const getsingleloanapi = createAsyncThunk(
    "getsingle/loan",
    async (id, { rejectWithValue }) => {
        try {
            const response = await customFetch.get(`loans/${id}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
const loanSlice = createSlice({
    name: "loan",
    initialState,
    reducers: {
        clearsingleloadnrepayments: (state) => {
            state.SingleLoanrepaymentsData = {}
        },
        clearsingleloan: (state) => {
            state.OneLoanDetails = {}
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createLoanforcustomer.pending, (state) => {
                state.isLoadingLoan = true
                state.newError = null
            })
            .addCase(createLoanforcustomer.fulfilled, (state, action) => {
                state.isLoadingLoan = false
                state.newError = null
            })
            .addCase(createLoanforcustomer.rejected, (state, action) => {
                state.isLoadingLoan = false
                state.newError = action.error
            })
            .addCase(singleLoanRepaymentsAPI.pending, (state) => {
                state.isLoadingLoan = true
                state.newError = null
            })
            .addCase(singleLoanRepaymentsAPI.fulfilled, (state, action) => {
                state.isLoadingLoan = false
                state.newError = null
                state.SingleLoanrepaymentsData = action.payload
            })
            .addCase(singleLoanRepaymentsAPI.rejected, (state, action) => {
                state.isLoadingLoan = false
                state.newError = action.error
            })
            .addCase(gellloandataapi.pending, (state) => {
                state.isLoadingLoan = true
                state.loanerror = null
            })
            .addCase(gellloandataapi.fulfilled, (state, action) => {
                state.isLoadingLoan = false
                state.loanerror = null
                if (action.payload.pagination.page === 1) {
                    state.Allloanhistory = action.payload.data;
                } else {
                    // Loading more - append new data
                    state.Allloanhistory = [...state.Allloanhistory, ...action.payload.data];
                }
                state.totalLoans = action.payload.pagination.total;
                state.hasMore = action.payload.pagination.page < action.payload.pagination.total_pages;
            })
            .addCase(gellloandataapi.rejected, (state, action) => {
                state.isLoadingLoan = false
                state.loanerror = action.error
            })
            .addCase(getsingleloanapi.pending, (state) => {
                state.isLoadingLoan = true
                state.newError = null
            })
            .addCase(getsingleloanapi.fulfilled, (state, action) => {
                state.isLoadingLoan = false
                state.newError = null
                state.OneLoanDetails = action.payload?.data
            })
            .addCase(getsingleloanapi.rejected, (state, action) => {
                state.isLoadingLoan = false
                state.newError = action.error
            })
            .addCase(calculateloanrepayments.pending,(state)=>{
                state.calculating=true;
                state.newError=null;
            })
             .addCase(calculateloanrepayments.fulfilled, (state, action) => {
                state.calculating = false
                state.newError = null
                state.CalualteRepaymentData=action.payload;
            })
            .addCase(calculateloanrepayments.rejected, (state, action) => {
                state.calculating = false
                state.newError = action.error
            })
    }
})
export const { clearsingleloadnrepayments, clearsingleloan } = loanSlice.actions
export default loanSlice.reducer;