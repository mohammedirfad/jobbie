import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Mail, Phone, Lock, Save, FileText,
  Briefcase, CheckCircle, Clock, XCircle,
  TrendingUp, Edit3, Camera, ArrowRight, Shield,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getProfileThunk } from '../../features/auth/authSlice';
import { fetchMyApplications } from '../../features/applications/applicationsSlice';
import { authApi } from '../../api/authApi';
import { useToast } from '../../components/common/Toast';
import { Spinner } from '../../components/common/Loader';
import { cn, statusBadgeColor, capitalize, timeAgo, getInitials } from '../../utils';

const profileSchema = z.object({
  name:  z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().trim().optional(),
  avatar_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  resume_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileForm   = z.infer<typeof profileSchema>;
type PasswordForm  = z.infer<typeof passwordSchema>;

const STATUS_STATS = [
  { key: 'pending',     label: 'Pending',     icon: <Clock className="w-4 h-4" />,     color: 'text-amber-600',  bg: 'bg-amber-50'  },
  { key: 'shortlisted', label: 'Shortlisted', icon: <TrendingUp className="w-4 h-4" />, color: 'text-emerald-600',bg: 'bg-emerald-50'},
  { key: 'rejected',    label: 'Rejected',    icon: <XCircle className="w-4 h-4" />,    color: 'text-red-600',    bg: 'bg-red-50'    },
  { key: 'hired',       label: 'Hired',       icon: <CheckCircle className="w-4 h-4" />,color: 'text-brand-600',  bg: 'bg-brand-50'  },
];

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const toast    = useToast();
  const { user, loading: authLoading } = useAppSelector(s => s.auth);
  const { myApplications, pagination }  = useAppSelector(s => s.applications);

  const [activeTab,      setActiveTab]      = useState<'profile' | 'applications' | 'security'>('profile');
  const [savingProfile,  setSavingProfile]  = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '', avatar_url: '', resume_url: '' },
  });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    dispatch(getProfileThunk());
    dispatch(fetchMyApplications({ limit: 50 }));
  }, [dispatch]);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name:       user.name       || '',
        phone:      user.phone      || '',
        avatar_url: user.avatar_url || '',
        resume_url: user.resume_url || '',
      });
    }
  }, [user, profileForm]);

  const onSaveProfile = async (data: ProfileForm) => {
    setSavingProfile(true);
    try {
      await authApi.updateProfile(data);
      await dispatch(getProfileThunk());
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully!');
      passwordForm.reset();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Application stats
  const statusCounts = STATUS_STATS.reduce((acc, s) => {
    acc[s.key] = myApplications.filter(a => a.status === s.key).length;
    return acc;
  }, {} as Record<string, number>);

  if (authLoading && !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }
  if (!user) return null;

  const tabs = [
    { key: 'profile',      label: 'Profile',      icon: <User className="w-4 h-4" /> },
    { key: 'applications', label: 'Applications', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'security',     label: 'Security',     icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Profile hero ── */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white text-3xl font-black shadow-glow">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.name} className="w-24 h-24 rounded-3xl object-cover" />
                  : getInitials(user.name)
                }
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors border border-slate-100">
                <Camera className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-black text-white">{user.name}</h1>
                <span className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-full capitalize',
                  user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-brand-500/20 text-brand-300'
                )}>
                  {user.role}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
              {user.phone && <p className="text-slate-400 text-sm">{user.phone}</p>}
            </div>

            {/* Stats row */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{pagination?.total ?? myApplications.length}</div>
                <div className="text-xs text-slate-400">Applied</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-400">
                  {myApplications.filter(a => a.status === 'shortlisted' || a.status === 'hired').length}
                </div>
                <div className="text-xs text-slate-400">Shortlisted</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 mb-7 w-fit shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                activeTab === tab.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Profile tab ── */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Edit3 className="w-5 h-5 text-brand-600" />
                  <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
                </div>

                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Full Name *
                      </label>
                      <input
                        {...profileForm.register('name')}
                        className={cn('input-field', profileForm.formState.errors.name && 'input-error')}
                        placeholder="John Doe"
                      />
                      {profileForm.formState.errors.name && (
                        <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                      </label>
                      <input
                        {...profileForm.register('phone')}
                        type="tel"
                        className="input-field"
                        placeholder="+1 555 000 0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                    </label>
                    <input
                      value={user.email}
                      disabled
                      className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="label flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-slate-400" /> Avatar URL
                    </label>
                    <input
                      {...profileForm.register('avatar_url')}
                      type="url"
                      className={cn('input-field', profileForm.formState.errors.avatar_url && 'input-error')}
                      placeholder="https://example.com/photo.jpg"
                    />
                    {profileForm.formState.errors.avatar_url && (
                      <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.avatar_url.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> Resume / Portfolio URL
                    </label>
                    <input
                      {...profileForm.register('resume_url')}
                      type="url"
                      className={cn('input-field', profileForm.formState.errors.resume_url && 'input-error')}
                      placeholder="https://drive.google.com/your-resume"
                    />
                    {profileForm.formState.errors.resume_url && (
                      <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.resume_url.message}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">Stored as default for job applications</p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={savingProfile} className="btn-primary">
                      {savingProfile
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                        : <><Save className="w-4 h-4" /> Save Changes</>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right — quick stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                <h3 className="font-bold text-slate-900 mb-4 text-sm">Application Overview</h3>
                <div className="space-y-3">
                  {STATUS_STATS.map(s => (
                    <div key={s.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', s.bg, s.color)}>
                          {s.icon}
                        </div>
                        <span className="text-sm text-slate-600">{s.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{statusCounts[s.key] ?? 0}</span>
                    </div>
                  ))}
                </div>
                <Link to="/my-applications" className="btn-secondary w-full text-center mt-4 text-xs gap-1.5">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {user.resume_url && (
                <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <h3 className="font-bold text-brand-900 text-sm">Resume on file</h3>
                  </div>
                  <a href={user.resume_url} target="_blank" rel="noreferrer"
                    className="text-xs text-brand-600 hover:underline break-all">
                    {user.resume_url}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Applications tab ── */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">My Applications</h2>
              <span className="text-sm text-slate-500">{pagination?.total ?? myApplications.length} total</span>
            </div>

            {myApplications.length === 0 ? (
              <div className="py-16 text-center">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No applications yet</p>
                <p className="text-slate-400 text-sm mb-5">Start applying to jobs and track them here</p>
                <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myApplications.map(app => (
                  <div key={app.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{app.job_title}</p>
                      <p className="text-xs text-slate-500 truncate">{app.company} · Applied {timeAgo(app.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={cn('badge capitalize text-xs', statusBadgeColor(app.status))}>{app.status}</span>
                      <Link to={`/jobs/${app.job_id}`} className="text-brand-600 hover:text-brand-700 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Security tab ── */}
        {activeTab === 'security' && (
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
              </div>

              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <div>
                  <label className="label">Current Password *</label>
                  <input
                    {...passwordForm.register('currentPassword')}
                    type="password"
                    className={cn('input-field', passwordForm.formState.errors.currentPassword && 'input-error')}
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">New Password *</label>
                  <input
                    {...passwordForm.register('newPassword')}
                    type="password"
                    className={cn('input-field', passwordForm.formState.errors.newPassword && 'input-error')}
                    placeholder="Min 8 chars, upper, lower, number"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Confirm New Password *</label>
                  <input
                    {...passwordForm.register('confirmPassword')}
                    type="password"
                    className={cn('input-field', passwordForm.formState.errors.confirmPassword && 'input-error')}
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={savingPassword} className="btn-primary">
                    {savingPassword
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</>
                      : <><Lock className="w-4 h-4" /> Update Password</>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
