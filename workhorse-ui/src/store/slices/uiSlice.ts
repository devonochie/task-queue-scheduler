import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  showAddForm: boolean;
  showFilters: boolean;
}

const initialState: UiState = {
  showAddForm: false,
  showFilters: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setShowAddForm: (state, action: PayloadAction<boolean>) => {
      state.showAddForm = action.payload;
    },
    setShowFilters: (state, action: PayloadAction<boolean>) => {
      state.showFilters = action.payload;
    },
  },
});

export const { setShowAddForm, setShowFilters } = uiSlice.actions;

export default uiSlice.reducer;