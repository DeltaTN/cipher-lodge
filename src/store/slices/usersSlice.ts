import { createSlice, createAsyncThunk, nanoid, PayloadAction } from "@reduxjs/toolkit";
import api from "@/services/axios";

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  login: string;
  password: string;
  createdAt: string;
}

interface UsersState {
  items: AppUser[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk("users/fetch", async () => {
  const { data } = await api.get<AppUser[]>("/mock/users.json");
  return data;
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: {
      reducer(state, action: PayloadAction<AppUser>) {
        state.items.unshift(action.payload);
      },
      prepare(user: Omit<AppUser, "id" | "createdAt">) {
        return { payload: { ...user, id: nanoid(), createdAt: new Date().toISOString() } };
      },
    },
    updateUser(state, action: PayloadAction<AppUser>) {
      state.items = state.items.map((u) => (u.id === action.payload.id ? action.payload : u));
    },
    deleteUser(state, action: PayloadAction<string>) {
      state.items = state.items.filter((u) => u.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erreur de chargement des utilisateurs";
      });
  },
});

export const { addUser, updateUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
