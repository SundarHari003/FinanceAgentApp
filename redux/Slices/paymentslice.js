import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { customFetch } from "../../Utils/customFetch";

const IntialState = {
    isLoadingPayment: false,
    Allpaymenthistory: [],
    paymenterror: null,
    hasMore: true,
    totalPayments: 0,
    singlerepaymentdetails: {}
}

export const getallpayment = createAsyncThunk(
    "getall/paymenthistory",
    async (data, { rejectWithValue }) => {
        try {
            const response = await customFetch.get(
                `repayments?page=${data.page}&limit=20&status=${data.status}&loan_id=${data.loanid}&due_date_from=${data.dueDatestart || ''}&due_date_to=${data.dueDateend || ''}`
            );
            return response;

        } catch (error) {
            return rejectWithValue(error.message || 'API call failed');
        }
    }
);

export const getsinglepaymentdetailapi = createAsyncThunk(
    "getsingle/paymentdetails",
    async (id, { rejectWithValue }) => {
        try {
            const response = await customFetch.get(``)
        } catch (error) {
            return rejectWithValue(error.message || 'API call failed');
        }
    }
)

const payment = createSlice({
    name: "payment",
    initialState: IntialState,
    reducers: {
        getsinglepaymentreducer: (state, action) => {
            state.singlerepaymentdetails = action.payload;
        },
        clearsinglepaymentdetails: (state) => {
            state.singlerepaymentdetails = {};
        },
        clearPaymentError: (state) => {
            state.paymenterror = null;
        },
        clearAllPayment: (state) => {
            state.Allpaymenthistory = [];
            state.hasMore = true;
            state.totalPayments = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getallpayment.pending, (state) => {
                state.isLoadingPayment = true;
                state.paymenterror = null;
            })
            .addCase(getallpayment.fulfilled, (state, action) => {
                state.isLoadingPayment = false;
                state.paymenterror = null;
                // Check if we're refreshing (limit === 10) or loading more
                if (action.payload.pagination.page === 1) {
                    state.Allpaymenthistory = action.payload.data;
                } else {
                    // Loading more - append new data
                    state.Allpaymenthistory = [...state.Allpaymenthistory, ...action.payload.data];
                }
                state.totalPayments = action.payload.pagination.total;
                state.hasMore = action.payload.pagination.page != action.payload.pagination.total_pages;

            })
            .addCase(getallpayment.rejected, (state, action) => {
                state.isLoadingPayment = false;
                state.paymenterror = action.payload
            })
    }
})
export const { clearsinglepaymentdetails, getsinglepaymentreducer, clearPaymentError, clearAllPayment } = payment.actions;
export default payment.reducer;