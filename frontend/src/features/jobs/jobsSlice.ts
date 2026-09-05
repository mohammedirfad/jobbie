import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobApi } from '../../api/jobApi';
import { Job, JobFilters, Pagination } from '../../types';

interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  featuredJobs: Job[];
  pagination: Pagination | null;
  filters: JobFilters;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  featuredJobs: [],
  pagination: null,
  filters: { page: 1, limit: 10, sort_by: 'created_at', sort_order: 'desc' },
  loading: false,
  detailLoading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchAll',
  async (filters: JobFilters, { rejectWithValue }) => {
    try {
      const res = await jobApi.getJobs(filters);
      return { jobs: res.data.data!, pagination: res.data.pagination! };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await jobApi.getJobById(id);
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Job not found');
    }
  }
);

export const fetchFeaturedJobs = createAsyncThunk(
  'jobs/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const res = await jobApi.getFeaturedJobs();
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch featured jobs');
    }
  }
);

export const createJobThunk = createAsyncThunk(
  'jobs/create',
  async (data: Partial<Job>, { rejectWithValue }) => {
    try {
      const res = await jobApi.createJob(data);
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to create job');
    }
  }
);

export const updateJobThunk = createAsyncThunk(
  'jobs/update',
  async ({ id, data }: { id: string; data: Partial<Job> }, { rejectWithValue }) => {
    try {
      const res = await jobApi.updateJob(id, data);
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to update job');
    }
  }
);

export const deleteJobThunk = createAsyncThunk(
  'jobs/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await jobApi.deleteJob(id);
      return id;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to delete job');
    }
  }
);

export const toggleJobStatusThunk = createAsyncThunk(
  'jobs/toggleStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await jobApi.toggleJobStatus(id);
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to toggle job status');
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters: (state) => {
      state.filters = { page: 1, limit: 10, sort_by: 'created_at', sort_order: 'desc' };
    },
    clearCurrentJob: (state) => { state.currentJob = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJobById.pending, (state) => { state.detailLoading = true; state.error = null; })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFeaturedJobs.fulfilled, (state, action) => {
        state.featuredJobs = action.payload;
      })
      .addCase(createJobThunk.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      })
      .addCase(updateJobThunk.fulfilled, (state, action) => {
        const idx = state.jobs.findIndex(j => j.id === action.payload.id);
        if (idx !== -1) state.jobs[idx] = action.payload;
        if (state.currentJob?.id === action.payload.id) state.currentJob = action.payload;
      })
      .addCase(deleteJobThunk.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(j => j.id !== action.payload);
      })
      .addCase(toggleJobStatusThunk.fulfilled, (state, action) => {
        const idx = state.jobs.findIndex(j => j.id === action.payload.id);
        if (idx !== -1) state.jobs[idx].is_active = action.payload.is_active;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentJob, clearError } = jobsSlice.actions;
export default jobsSlice.reducer;
