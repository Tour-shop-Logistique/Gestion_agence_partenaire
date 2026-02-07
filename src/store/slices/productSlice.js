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

// Lister les catégories
export const fetchCategories = createAsyncThunk(
    "products/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            const result = await productsApi.listCategories();
            if (!result.success) {
                return rejectWithValue(result.message);
            }
            return result.data;
        } catch (error) {
            return rejectWithValue(error.message || "Erreur lors du chargement des catégories");
        }
    }
);

const productSlice = createSlice({
    name: "products",
    initialState: {
        list: [],
        categories: [],
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
            })
            .addCase(fetchCategories.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export default productSlice.reducer;
