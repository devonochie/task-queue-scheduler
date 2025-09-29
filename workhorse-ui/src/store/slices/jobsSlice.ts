import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateJobRequest, Job, JobStatus } from '@/types/dashboard';
import { apiService } from '@/services/apiService';

interface JobsState {
  jobs: Job[];
  selectedJobId: string | null;
  searchTerm: string;
  statusFilter: JobStatus | "all";
  loading: boolean
  error: string | null
}

const initialState: JobsState = {
  jobs: [] as Job[],
  selectedJobId: null,
  searchTerm: "",
  statusFilter: "all",
  loading: false,
  error: null
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async(filter: {
    type?: string,
    status?: JobStatus | 'all',
    page?: number,
    startDate?: string,
    endDate?: string
  }) => {
    const response = await apiService.getJobs(filter)
    return response
  }
)

export const createJob = createAsyncThunk(
  'job/createJob',
  async(jobData: CreateJobRequest ) => {
    const response = await apiService.createJob(jobData)
    return response
  }
)

export const retryJobThunk = createAsyncThunk(
  'jobs/retryJob',
  async (jobId: string) => {
    const response = await apiService.retryJob(jobId);
    return response;
  }
);

export const deleteJobThunk = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId: string) => {
    const response = await apiService.deleteJobs(jobId)
    return response;
  }
);

export const cancelJobThunk = createAsyncThunk(
  'jobs/cancelJob',
  async (jobId: string) => {
    const response = await apiService.cancelJob(jobId);
    return response;
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    addJob: (state, action: PayloadAction<Omit<Job, "id" | "createdAt" | "updatedAt">>) => {
      const newJob: Job = {
        ...action.payload,
        id: `job-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.jobs.unshift(newJob);
    },
    retryJob: (state, action: PayloadAction<string>) => {
      const job = state.jobs.find(j => j.id === action.payload);
      if (job) {
        job.status = "pending";
        job.retryCount += 1;
        job.updatedAt = new Date().toISOString();
      }
    },
    cancelJob: (state, action: PayloadAction<string>) => {
      const job = state.jobs.find(j => j.id === action.payload);
      if (job) {
        job.status = "failed";
        job.updatedAt = new Date().toISOString();
      }
    },
    deleteJob: (state, action: PayloadAction<string>) => {
      state.jobs = state.jobs.filter(job => job.id !== action.payload);
      if (state.selectedJobId === action.payload) {
        state.selectedJobId = null;
      }
    },
    selectJob: (state, action: PayloadAction<string | null>) => {
      state.selectedJobId = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<JobStatus | "all">) => {
      state.statusFilter = action.payload;
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers(builder) {
      builder
        .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch jobs';
      })
      // Create job
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create job';
      })
      // Retry job
      .addCase(retryJobThunk.fulfilled, (state, action) => {
        const job = state.jobs.find(j => j.id === action.payload.id);
        if (job) {
          job.status = "pending";
          job.retryCount += 1;
          job.updatedAt = new Date().toISOString();
        }
      })
      // Cancel job
      .addCase(cancelJobThunk.fulfilled, (state, action) => {
        const job = state.jobs.find(j => j.id === action.payload.id);
        if (job) {
          job.status = "failed";
          job.updatedAt = new Date().toISOString();
        }
        })

      .addCase(deleteJobThunk.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(job => job.id !== action.payload);
        if (state.selectedJobId === action.payload) {
          state.selectedJobId = null;
        }
      });
  },
});

export const {
  addJob,
  retryJob,
  cancelJob,
  deleteJob,
  selectJob,
  setSearchTerm,
  setStatusFilter,
  clearError
} = jobsSlice.actions;

export default jobsSlice.reducer;