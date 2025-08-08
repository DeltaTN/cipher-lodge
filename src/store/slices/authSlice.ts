import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/services/auth";
import { login as apiLogin } from "@/services/auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { login: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await apiLogin(payload.login, payload.password);
      return res;
    } catch (e: any) {
      return rejectWithValue(e.message || "Erreur de connexion");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
          state.loading = false;
          state.token = action.payload.token;
          state.user = action.payload.user;
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Erreur de connexion";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
