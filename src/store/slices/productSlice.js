import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productsApi } from "../../utils/api/products";

/**
 * Thunks asynchrones
 */

// Lister les produits
export const fetchProducts = createAsyncThunk(
    "products/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const result = await productsApi.listProducts();
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return result.data;
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors du chargement des produits");
        }
    }
);

const productSlice = createSlice({
    name: "products",
    initialState: {
        list: [],
        status: "idle",
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.list = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export default productSlice.reducer;
