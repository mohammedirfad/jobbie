import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginThunk, clearError } from '../../features/auth/authSlice';
import { useToast } from '../../components/common/Toast';

const schema = z.object({
  // trim() applied by Zod so whitespace around email/password is stripped automatically
  email:    z.string().trim().email('Enter a valid email address'),
  password: z.string().trim().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const [showPw, setShowPw] = useState(false);
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const toast     = useToast();
  const { loading, error, isAuthenticated, user } = useAppSelector(s => s.auth);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Clear any stale error when the page mounts
  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  // Navigate after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : from, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const onSubmit = (data: FormData) => {
    // data.email and data.password are already trimmed by Zod
    dispatch(loginThunk({ email: data.email, password: data.password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">
              Hire<span className="bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">Nest</span>
            </span>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* ── Server error banner ── */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm ${
                    errors.email ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 hover:border-white/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm ${
                    errors.password ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 hover:border-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-emerald-500 text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-glow mt-2"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Sign In'
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              Create account
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-5 p-3.5 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-slate-400 font-semibold mb-2">Demo credentials:</p>
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500">
                Admin:{' '}
                <button
                  type="button"
                  className="text-slate-300 hover:text-white transition-colors font-mono text-xs"
                  onClick={() => {}}
                >
                  admin@hirenest.io
                </button>
                {' '}/{' '}
                <span className="text-slate-300 font-mono text-xs">Admin@123</span>
              </p>
              <p className="text-xs text-slate-500">
                User:{' '}
                <span className="text-slate-300 font-mono text-xs">john@example.com</span>
                {' '}/{' '}
                <span className="text-slate-300 font-mono text-xs">User@123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
