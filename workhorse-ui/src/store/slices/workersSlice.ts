import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Worker, WorkerStatus } from '@/types/dashboard';
import { apiService } from '@/services/apiService';

interface WorkersState {
  workers: Worker[];
  loading: boolean
  error: string | null
}

const initialState: WorkersState = {
  workers: [] as Worker[],
  loading: false,
  error: null
};

export const fetchWorkers = createAsyncThunk(
  'workers/fetchWorkers',
  async () => {
    const response = await apiService.listWorkers()
    return response
  }
)

export const registerWorkers = createAsyncThunk(
  'workers/registerWorkers',
  async () => {
    const response = await apiService.registerWorker()
    return response
  }
)

export const updateWorkerStatus = createAsyncThunk(
  'workers/updateWorkers',
  async ({id, status}: {id: string; status: WorkerStatus}) => {
    const response = await apiService.updateWorkerStatus(id, status)
    return response
  }
)

const workersSlice = createSlice({
  name: 'workers',
  initialState,
  reducers: {
    // Add worker actions here if needed in the future
    clearError: (state, action) => {
      state.error = null
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchWorkers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkers.fulfilled, (state, action) => {
        state.loading = false;
        state.workers = action.payload;
      })
      .addCase(fetchWorkers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch workers';
      })
      .addCase(updateWorkerStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.workers = action.payload;
      })
      
    },
});

export const { clearError } = workersSlice.actions
export default workersSlice.reducer;