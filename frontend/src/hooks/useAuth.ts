import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getProfileThunk } from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);

  useEffect(() => {
    if (auth.isAuthenticated && !auth.user && auth.accessToken) {
      dispatch(getProfileThunk());
    }
  }, [auth.isAuthenticated, auth.user, auth.accessToken, dispatch]);

  return auth;
};
