import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getProfileThunk } from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);

  useEffect(() => {
    // Only fetch profile if:
    // 1. User claims to be authenticated (has token in localStorage)
    // 2. Profile has NOT been loaded yet (prevents re-fires)
    // 3. No user data yet
    // 4. Not already loading
    if (
      auth.isAuthenticated &&
      auth.accessToken &&
      !auth.user &&
      !auth.profileLoaded &&
      !auth.loading
    ) {
      dispatch(getProfileThunk());
    }
  }, [
    auth.isAuthenticated,
    auth.accessToken,
    auth.user,
    auth.profileLoaded,
    auth.loading,
    dispatch,
  ]);

  return auth;
};
