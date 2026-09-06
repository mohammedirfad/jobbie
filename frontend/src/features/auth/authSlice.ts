import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginPayload, RegisterPayload } from '../../api/authApi';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  profileLoaded: boolean; // ← prevents useAuth re-firing indefinitely
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  profileLoaded: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload);
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      // Surface the actual server message, not a generic fallback
      return rejectWithValue(
        e.response?.data?.message || 'Invalid email or password'
      );
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.register(payload);
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        e.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try { await authApi.logout(); } catch { /* silent */ }
});

export const getProfileThunk = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.getProfile();
      return res.data.data!;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Session expired');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.profileLoaded = false;
      state.error = null;
      localStorage.removeItem('accessToken');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // ── Login ──────────────────────────────────────────────────────────────
    builder.addCase(loginThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.profileLoaded = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      // Clear any stale token on login failure
      state.accessToken = null;
      state.isAuthenticated = false;
      state.profileLoaded = false;
      localStorage.removeItem('accessToken');
    });

    // ── Register ───────────────────────────────────────────────────────────
    builder.addCase(registerThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.profileLoaded = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
    });
    builder.addCase(registerThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ── Logout ─────────────────────────────────────────────────────────────
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.profileLoaded = false;
      localStorage.removeItem('accessToken');
    });

    // ── Get Profile ────────────────────────────────────────────────────────
    builder.addCase(getProfileThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getProfileThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.profileLoaded = true;
    });
    builder.addCase(getProfileThunk.rejected, (state) => {
      state.loading = false;
      state.profileLoaded = true; // ← CRITICAL: mark as loaded even on failure
      // If profile fails (expired token), clear auth state
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
    });
  },
});

export const { setCredentials, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
