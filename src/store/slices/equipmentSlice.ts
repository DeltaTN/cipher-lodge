import { createSlice, createAsyncThunk, nanoid, PayloadAction } from "@reduxjs/toolkit";
import api from "@/services/axios";

export type EquipmentType =
  | "ordinateur"
  | "serveur"
  | "routeur"
  | "switch"
  | "point_d_acces"
  | "imprimante"
  | "camera_ip"
  | "autre";

export interface Equipment {
  id: string;
  name: string;
  description?: string;
  type: EquipmentType;
  ipAddress?: string;
  location?: string;
  purchaseDate?: string;
  createdAt: string;
  username?: string;
  password?: string;
}

interface EquipmentState {
  items: Equipment[];
  loading: boolean;
  error: string | null;
}

const initialState: EquipmentState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchEquipments = createAsyncThunk("equipment/fetch", async () => {
  const { data } = await api.get<Equipment[]>("/mock/equipments.json");
  return data;
});

const equipmentSlice = createSlice({
  name: "equipment",
  initialState,
  reducers: {
    addEquipment: {
      reducer(state, action: PayloadAction<Equipment>) {
        state.items.unshift(action.payload);
      },
      prepare(item: Omit<Equipment, "id" | "createdAt">) {
        return {
          payload: { ...item, id: nanoid(), createdAt: new Date().toISOString() },
        };
      },
    },
    updateEquipment(state, action: PayloadAction<Equipment>) {
      state.items = state.items.map((i) => (i.id === action.payload.id ? action.payload : i));
    },
    deleteEquipment(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEquipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Erreur de chargement des équipements";
      });
  },
});

export const { addEquipment, updateEquipment, deleteEquipment } = equipmentSlice.actions;
export default equipmentSlice.reducer;
