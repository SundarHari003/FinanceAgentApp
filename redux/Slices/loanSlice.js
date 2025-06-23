import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { customFetch } from "../../Utils/customFetch";

const initialState = {
    isLoadingLoan: false,
    Allloanhistory: [],
    loanerror: null,
    hasMore: true,
    totalLoans: 0,
    singlerepaymentdetails: {},
    SingleLoanrepaymentsData: {}
}

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

const loanSlice = createSlice({
    name: "loan",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createLoanforcustomer.pending, (state) => {
                state.isLoadingLoan = true
                state.loanerror = null
            })
            .addCase(createLoanforcustomer.fulfilled, (state, action) => {
                state.isLoadingLoan = false
                state.loanerror = null
            })
            .addCase(createLoanforcustomer.rejected, (state, action) => {
                state.isLoadingLoan = false
                state.loanerror = action.error
            })
            .addCase(singleLoanRepaymentsAPI.pending, (state) => {
                state.isLoadingLoan = true
                state.loanerror = null
            })
            .addCase(singleLoanRepaymentsAPI.fulfilled, (state, action) => {
                state.isLoadingLoan = false
                state.loanerror = null
                state.SingleLoanrepaymentsData = action.payload
            })
            .addCase(singleLoanRepaymentsAPI.rejected, (state, action) => {
                state.isLoadingLoan = false
                state.loanerror = action.error
            })
    }
})

export default loanSlice.reducer;