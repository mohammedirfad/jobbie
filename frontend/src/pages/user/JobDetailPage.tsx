import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Briefcase, Banknote, Users, Eye, Star, ArrowLeft,
  CheckCircle, Send, AlertCircle, Building2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchJobById } from '../../features/jobs/jobsSlice';
import { applyForJobThunk } from '../../features/applications/applicationsSlice';
import { applicationApi } from '../../api/applicationApi';
import { Modal } from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import { formatSalary, timeAgo, jobTypeBadgeColor, experienceBadgeColor, capitalize, cn } from '../../utils';

const applySchema = z.object({
  cover_letter: z.string().max(2000).optional(),
  resume_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});
type ApplyFormData = z.infer<typeof applySchema>;

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const { currentJob: job, detailLoading } = useAppSelector(s => s.jobs);
  const { isAuthenticated, user } = useAppSelector(s => s.auth);

  const [applyModal, setApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApp, setCheckingApp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (id && isAuthenticated) {
      setCheckingApp(true);
      applicationApi.checkApplication(id)
        .then(res => setHasApplied(res.data.data?.hasApplied ?? false))
        .catch(() => {})
        .finally(() => setCheckingApp(false));
    }
  }, [id, isAuthenticated]);

  const onApply = async (data: ApplyFormData) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await dispatch(applyForJobThunk({ jobId: id, data })).unwrap();
      setHasApplied(true);
      setApplyModal(false);
      reset();
      toast.success('Application submitted successfully!');
    } catch (err: unknown) {
      toast.error(typeof err === 'string' ? err : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (detailLoading) return <PageLoader />;
  if (!job) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Job not found</h2>
        <Link to="/jobs" className="btn-primary">Browse all jobs</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header Card */}
          <div className={cn(
            'card p-6',
            job.is_featured && 'ring-1 ring-brand-200 bg-gradient-to-br from-brand-50/30 to-white'
          )}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {job.company_logo
                  ? <img src={job.company_logo} alt={job.company} className="w-12 h-12 object-contain" />
                  : <Building2 className="w-8 h-8 text-slate-400" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                    <p className="text-slate-600 font-medium mt-0.5">{job.company}</p>
                  </div>
                  {job.is_featured && (
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-medium text-amber-700">Featured</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={cn('badge', jobTypeBadgeColor(job.job_type))}>{capitalize(job.job_type)}</span>
              <span className={cn('badge', experienceBadgeColor(job.experience_level))}>{capitalize(job.experience_level)}</span>
              {job.category_name && (
                <span className="badge bg-slate-100 text-slate-600">{job.category_icon} {job.category_name}</span>
              )}
            </div>

            {/* Info row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <MapPin className="w-4 h-4 text-brand-500" />, text: job.location },
                { icon: <Clock className="w-4 h-4 text-brand-500" />, text: timeAgo(job.created_at) },
                { icon: <Eye className="w-4 h-4 text-brand-500" />, text: `${job.view_count ?? 0} views` },
                { icon: <Banknote className="w-4 h-4 text-brand-500" />, text: formatSalary(job.salary_min, job.salary_max, job.salary_currency) },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  {item.icon}
                  <span className="text-xs text-slate-600 font-medium truncate">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">About this role</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Requirements</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0 mt-2" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Apply card */}
          <div className="card p-6 sticky top-24">
            {hasApplied ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-brand-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Applied!</h3>
                <p className="text-sm text-slate-500 mb-4">Your application is under review.</p>
                <Link to="/my-applications" className="btn-secondary w-full text-center">
                  View My Applications
                </Link>
              </div>
            ) : (
              <>
                {(job.salary_min || job.salary_max) && (
                  <div className="mb-4 text-center pb-4 border-b border-slate-100">
                    <p className="text-xs text-slate-500 mb-0.5">Salary Range</p>
                    <p className="text-xl font-bold text-brand-600">
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                    </p>
                  </div>
                )}
                {!isAuthenticated ? (
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-4">Sign in to apply for this job</p>
                    <Link to="/login" state={{ from: { pathname: `/jobs/${id}` } }} className="btn-primary w-full text-center">
                      Sign In to Apply
                    </Link>
                    <p className="text-xs text-slate-400 mt-3">
                      No account?{' '}
                      <Link to="/register" className="text-brand-600 hover:underline">Register free</Link>
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setApplyModal(true)}
                    disabled={!job.is_active || checkingApp}
                    className="btn-primary w-full"
                  >
                    <Send className="w-4 h-4" />
                    {checkingApp ? 'Checking…' : 'Apply Now'}
                  </button>
                )}
                {job.deadline && (
                  <p className="text-xs text-center text-slate-400 mt-3">
                    Deadline: {new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3 text-sm">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(s => (
                  <span key={s} className="px-3 py-1 bg-brand-50 border border-brand-100 rounded-lg text-xs font-medium text-brand-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Company info */}
          <div className="card p-5">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">About {job.company}</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                {job.company_logo
                  ? <img src={job.company_logo} alt="" className="w-8 h-8 object-contain" />
                  : <Building2 className="w-5 h-5 text-slate-400" />
                }
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{job.company}</p>
                <p className="text-xs text-slate-500">{job.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={applyModal} onClose={() => { setApplyModal(false); reset(); }} title="Apply for this Job" size="lg">
        <form onSubmit={handleSubmit(onApply)} className="p-6 space-y-5">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <Briefcase className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">{job.title}</p>
              <p className="text-sm text-slate-500">{job.company} · {job.location}</p>
            </div>
          </div>

          <div>
            <label className="label">Cover Letter <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              {...register('cover_letter')}
              rows={5}
              placeholder="Tell us why you're a great fit for this role…"
              className="input-field resize-none"
            />
            {errors.cover_letter && <p className="mt-1 text-xs text-red-500">{errors.cover_letter.message}</p>}
          </div>

          <div>
            <label className="label">Resume URL <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              {...register('resume_url')}
              type="url"
              placeholder="https://drive.google.com/your-resume"
              className="input-field"
            />
            {errors.resume_url && <p className="mt-1 text-xs text-red-500">{errors.resume_url.message}</p>}
            {user?.resume_url && !errors.resume_url && (
              <p className="text-xs text-slate-400 mt-1">
                Leave blank to use your profile resume URL
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setApplyModal(false); reset(); }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Send className="w-4 h-4" /> Submit Application</>
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
