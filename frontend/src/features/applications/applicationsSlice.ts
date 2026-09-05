import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applicationApi } from '../../api/applicationApi';
import { Application, Pagination } from '../../types';

interface ApplicationsState {
  myApplications: Application[];
  allApplications: Application[];
  jobApplications: Application[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  myApplications: [],
  allApplications: [],
  jobApplications: [],
  pagination: null,
  loading: false,
  error: null,
};

export const applyForJobThunk = createAsyncThunk(
  'applications/apply',
  async ({ jobId, data }: { jobId: string; data: { cover_letter?: string; resume_url?: string } }, { rejectWithValue }) => {
    try {
      const res = await applicationApi.applyForJob(jobId, data);
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to apply');
    }
  }
);

export const fetchMyApplications = createAsyncThunk(
  'applications/fetchMy',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const res = await applicationApi.getMyApplications(params);
      return { apps: res.data.data!, pagination: res.data.pagination! };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch applications');
    }
  }
);

export const fetchAllApplications = createAsyncThunk(
  'applications/fetchAll',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const res = await applicationApi.getAllApplications(params);
      return { apps: res.data.data!, pagination: res.data.pagination! };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch applications');
    }
  }
);

export const fetchJobApplications = createAsyncThunk(
  'applications/fetchForJob',
  async ({ jobId, params }: { jobId: string; params?: object }, { rejectWithValue }) => {
    try {
      const res = await applicationApi.getJobApplications(jobId, params);
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch applications');
    }
  }
);

export const updateApplicationStatusThunk = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status, notes }: { id: string; status: string; notes?: string }, { rejectWithValue }) => {
    try {
      const res = await applicationApi.updateApplicationStatus(id, status, notes);
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to update status');
    }
  }
);

export const withdrawApplicationThunk = createAsyncThunk(
  'applications/withdraw',
  async (id: string, { rejectWithValue }) => {
    try {
      await applicationApi.withdrawApplication(id);
      return id;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Failed to withdraw');
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyForJobThunk.fulfilled, (state, action) => {
        state.myApplications.unshift(action.payload);
      })
      .addCase(fetchMyApplications.pending, (state) => { state.loading = true; })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.myApplications = action.payload.apps;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAllApplications.pending, (state) => { state.loading = true; })
      .addCase(fetchAllApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.allApplications = action.payload.apps;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.jobApplications = action.payload;
      })
      .addCase(updateApplicationStatusThunk.fulfilled, (state, action) => {
        const update = (arr: Application[]) => {
          const idx = arr.findIndex(a => a.id === action.payload.id);
          if (idx !== -1) arr[idx] = action.payload;
        };
        update(state.myApplications);
        update(state.allApplications);
        update(state.jobApplications);
      })
      .addCase(withdrawApplicationThunk.fulfilled, (state, action) => {
        state.myApplications = state.myApplications.filter(a => a.id !== action.payload);
      });
  },
});

export const { clearError } = applicationsSlice.actions;
export default applicationsSlice.reducer;
