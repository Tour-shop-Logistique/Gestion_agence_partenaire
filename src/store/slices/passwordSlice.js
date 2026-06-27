import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { passwordApi } from "../../utils/api/password";

/**
 * Thunks asynchrones pour la gestion des mots de passe
 */

// Demande de réinitialisation de mot de passe
export const forgotPassword = createAsyncThunk(
  "password/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const result = await passwordApi.forgotPassword(email);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return { email, data: result.data };
    } catch (error) {
      return rejectWithValue(
        error.message || "Erreur lors de l'envoi du code de réinitialisation"
      );
    }
  }
);

// Vérification du code de réinitialisation
export const verifyResetCode = createAsyncThunk(
  "password/verifyResetCode",
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const result = await passwordApi.verifyResetCode(email, code);
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return { email, code, data: result.data };
    } catch (error) {
      return rejectWithValue(error.message || "Code invalide ou expiré");
    }
  }
);

// Réinitialisation du mot de passe
export const resetPassword = createAsyncThunk(
  "password/resetPassword",
  async (
    { email, code, password, passwordConfirmation },
    { rejectWithValue }
  ) => {
    try {
      const result = await passwordApi.resetPassword(
        email,
        code,
        password,
        passwordConfirmation
      );
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Erreur lors de la réinitialisation du mot de passe"
      );
    }
  }
);

// Modification du mot de passe (utilisateur authentifié)
export const changePassword = createAsyncThunk(
  "password/changePassword",
  async (
    { currentPassword, newPassword, newPasswordConfirmation },
    { rejectWithValue }
  ) => {
    try {
      const result = await passwordApi.changePassword(
        currentPassword,
        newPassword,
        newPasswordConfirmation
      );
      if (!result.success) {
        return rejectWithValue(result.message);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Erreur lors de la modification du mot de passe"
      );
    }
  }
);

/**
 * Slice Redux pour la gestion des mots de passe
 */
const passwordSlice = createSlice({
  name: "password",
  initialState: {
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    message: null,
    forgotPasswordStep: "request", // 'request' | 'verify' | 'reset' | 'complete'
    resetEmail: null,
    resetCode: null,
  },
  reducers: {
    clearPasswordState: (state) => {
      state.status = "idle";
      state.error = null;
      state.message = null;
      state.forgotPasswordStep = "request";
      state.resetEmail = null;
      state.resetCode = null;
    },
    clearPasswordError: (state) => {
      state.error = null;
    },
    clearPasswordMessage: (state) => {
      state.message = null;
    },
    setPasswordStep: (state, action) => {
      state.forgotPasswordStep = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.resetEmail = action.payload.email;
        state.forgotPasswordStep = "verify";
        state.message = "Code de réinitialisation envoyé à votre email";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Verify Reset Code
      .addCase(verifyResetCode.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(verifyResetCode.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.resetCode = action.payload.code;
        state.forgotPasswordStep = "reset";
        state.message = "Code vérifié avec succès";
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.forgotPasswordStep = "complete";
        state.message = "Mot de passe réinitialisé avec succès";
        // Clear sensitive data
        state.resetCode = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.message = "Mot de passe modifié avec succès";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  clearPasswordState,
  clearPasswordError,
  clearPasswordMessage,
  setPasswordStep,
} = passwordSlice.actions;

// Sélecteurs
export const selectPasswordStatus = (state) => state.password.status;
export const selectPasswordError = (state) => state.password.error;
export const selectPasswordMessage = (state) => state.password.message;
export const selectForgotPasswordStep = (state) =>
  state.password.forgotPasswordStep;
export const selectResetEmail = (state) => state.password.resetEmail;
export const selectResetCode = (state) => state.password.resetCode;
export const selectIsPasswordLoading = (state) =>
  state.password.status === "loading";

export default passwordSlice.reducer;
