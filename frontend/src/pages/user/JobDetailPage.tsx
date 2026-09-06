import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Banknote, Eye, Star, ArrowLeft,
  CheckCircle, Send, AlertCircle, Building2,
  Briefcase, Share2, Bookmark, Calendar,
  User, Mail, Phone, FileText, Upload, X,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchJobById, clearCurrentJob } from '../../features/jobs/jobsSlice';
import { applicationApi } from '../../api/applicationApi';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import { formatSalary, timeAgo, jobTypeBadgeColor, experienceBadgeColor, capitalize, cn } from '../../utils';

// ── File validation ──────────────────────────────────────────────────────────
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const applySchema = z.object({
  applicant_name:  z.string().trim().min(2, 'Full name is required').max(255),
  applicant_email: z.string().trim().email('Enter a valid email address'),
  applicant_phone: z.string().trim().min(7, 'Phone number is required').max(50),
  cover_letter:    z.string().max(2000, 'Max 2000 characters').optional(),
});
type ApplyFormData = z.infer<typeof applySchema>;

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast    = useToast();

  const { currentJob: job, detailLoading, error } = useAppSelector(s => s.jobs);
  const { isAuthenticated, user } = useAppSelector(s => s.auth);

  const [applyModal,   setApplyModal]   = useState(false);
  const [hasApplied,   setHasApplied]   = useState(false);
  const [checkingApp,  setCheckingApp]  = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [saved,        setSaved]        = useState(false);

  // Resume file state
  const [resumeFile,   setResumeFile]   = useState<File | null>(null);
  const [fileError,    setFileError]    = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      applicant_name:  user?.name  || '',
      applicant_email: user?.email || '',
      applicant_phone: user?.phone || '',
    },
  });

  // Clear stale job, fetch fresh
  useEffect(() => {
    dispatch(clearCurrentJob());
    if (id) dispatch(fetchJobById(id));
    return () => { dispatch(clearCurrentJob()); };
  }, [id, dispatch]);

  // Pre-fill form when user profile loads
  useEffect(() => {
    if (user) {
      reset(prev => ({
        ...prev,
        applicant_name:  user.name  || '',
        applicant_email: user.email || '',
        applicant_phone: user.phone || '',
      }));
    }
  }, [user, reset]);

  // Check if already applied
  useEffect(() => {
    if (id && isAuthenticated) {
      setCheckingApp(true);
      setHasApplied(false);
      applicationApi.checkApplication(id)
        .then(res => setHasApplied(res.data.data?.hasApplied ?? false))
        .catch(() => {})
        .finally(() => setCheckingApp(false));
    }
  }, [id, isAuthenticated]);

  // ── File handler ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) { setResumeFile(null); return; }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Only PDF, DOC, or DOCX files are accepted');
      setResumeFile(null);
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size must be under 5 MB');
      setResumeFile(null);
      e.target.value = '';
      return;
    }
    setResumeFile(file);
  };

  const removeFile = () => {
    setResumeFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onApply = async (data: ApplyFormData) => {
    if (!id) return;

    // Resume is required
    if (!resumeFile) {
      setFileError('Please upload your resume (PDF, DOC, or DOCX)');
      return;
    }

    setSubmitting(true);
    try {
      // In a real app you'd upload to S3/Cloudinary first.
      // Here we store the filename and a simulated URL.
      const simulatedUrl = `resumes/${Date.now()}_${resumeFile.name.replace(/\s+/g, '_')}`;

      await applicationApi.applyForJob(id, {
        applicant_name:  data.applicant_name,
        applicant_email: data.applicant_email,
        applicant_phone: data.applicant_phone,
        cover_letter:    data.cover_letter,
        resume_url:      simulatedUrl,
        resume_filename: resumeFile.name,
      });

      setHasApplied(true);
      setApplyModal(false);
      reset();
      setResumeFile(null);
      toast.success('Application submitted! We\'ll be in touch soon.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const openApply = () => {
    // Reset form to current user values each time modal opens
    reset({
      applicant_name:  user?.name  || '',
      applicant_email: user?.email || '',
      applicant_phone: user?.phone || '',
      cover_letter:    '',
    });
    setResumeFile(null);
    setFileError('');
    setApplyModal(true);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (detailLoading || (!job && !error)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-slate-500 text-sm">Loading job details…</p>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!job || error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Job not found</h2>
          <p className="text-slate-500 text-sm mb-6">This job may have been removed or the link is incorrect.</p>
          <Link to="/jobs" className="btn-primary">Browse all jobs</Link>
        </div>
      </div>
    );
  }

  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Breadcrumb bar ── */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="btn-ghost text-xs gap-1.5 py-1.5 px-3">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={cn('btn-ghost text-xs gap-1.5 py-1.5 px-3', saved && 'text-brand-600')}
            >
              <Bookmark className={cn('w-3.5 h-3.5', saved && 'fill-brand-600')} />
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero */}
            <div className={cn(
              'bg-white rounded-2xl border p-6 shadow-card',
              job.is_featured ? 'border-brand-200 bg-gradient-to-br from-brand-50/40 to-white' : 'border-slate-100'
            )}>
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                  {job.company_logo
                    ? <img src={job.company_logo} alt={job.company} className="w-14 h-14 object-contain p-1" />
                    : <Building2 className="w-7 h-7 text-slate-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 leading-tight">{job.title}</h1>
                      <p className="text-brand-600 font-semibold mt-0.5">{job.company}</p>
                    </div>
                    {job.is_featured && (
                      <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                <span className={cn('badge text-xs', jobTypeBadgeColor(job.job_type))}>{capitalize(job.job_type)}</span>
                <span className={cn('badge text-xs', experienceBadgeColor(job.experience_level))}>{capitalize(job.experience_level)} level</span>
                {job.category_name && <span className="badge bg-slate-100 text-slate-600 text-xs">{job.category_name}</span>}
                {!job.is_active && <span className="badge bg-red-100 text-red-600 text-xs">Closed</span>}
                {isExpired && <span className="badge bg-orange-100 text-orange-600 text-xs">Deadline passed</span>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: <MapPin className="w-4 h-4 text-brand-500" />,   label: 'Location', text: job.location },
                  { icon: <Clock className="w-4 h-4 text-emerald-500" />,  label: 'Posted',   text: timeAgo(job.created_at) },
                  { icon: <Eye className="w-4 h-4 text-blue-500" />,       label: 'Views',    text: `${job.view_count ?? 0}` },
                  { icon: <Banknote className="w-4 h-4 text-purple-500" />,label: 'Salary',   text: formatSalary(job.salary_min, job.salary_max, job.salary_currency) },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-1">{item.icon}<span className="text-xs text-slate-400 font-medium">{item.label}</span></div>
                    <p className="text-xs font-semibold text-slate-800 truncate">{item.text}</p>
                  </div>
                ))}
              </div>

              {job.deadline && (
                <div className={cn('mt-4 flex items-center gap-2 text-xs px-3 py-2 rounded-xl',
                  isExpired ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700')}>
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  {isExpired ? 'Application deadline has passed'
                    : `Apply before ${new Date(job.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                </div>
              )}
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-brand-500 rounded-full" /> About this role
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-emerald-500 rounded-full" /> Requirements
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full" /> Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-purple-500 rounded-full" /> Skills & Technologies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(s => (
                    <span key={s} className="px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-xl text-xs font-semibold text-brand-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Apply card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card sticky top-28">
              {hasApplied ? (
                <div className="text-center py-2">
                  <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-brand-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-lg">Applied!</h3>
                  <p className="text-sm text-slate-500 mb-5">Your application is under review.</p>
                  <Link to="/my-applications" className="btn-secondary w-full text-center block">
                    Track Application
                  </Link>
                </div>
              ) : (
                <>
                  {(job.salary_min || job.salary_max) && (
                    <div className="mb-5 pb-5 border-b border-slate-100 text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Salary Range</p>
                      <p className="text-2xl font-black text-brand-600">
                        {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">per year</p>
                    </div>
                  )}

                  {!isAuthenticated ? (
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto">
                        <Briefcase className="w-6 h-6 text-brand-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Sign in to apply</p>
                        <p className="text-xs text-slate-500 mt-0.5">Create a free account to apply for jobs</p>
                      </div>
                      <Link to="/login" state={{ from: { pathname: `/jobs/${id}` } }} className="btn-primary w-full justify-center">
                        Sign In to Apply
                      </Link>
                      <p className="text-xs text-slate-400">
                        No account?{' '}
                        <Link to="/register" className="text-brand-600 font-medium hover:underline">Register free</Link>
                      </p>
                    </div>
                  ) : !job.is_active || isExpired ? (
                    <div className="text-center py-2">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">Not accepting applications</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {isExpired ? 'The application deadline has passed.' : 'This position is currently closed.'}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={openApply}
                      disabled={checkingApp}
                      className="btn-primary w-full justify-center text-base py-3"
                    >
                      {checkingApp
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking…</>
                        : <><Send className="w-4 h-4" /> Apply Now</>
                      }
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Company */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
              <h3 className="font-bold text-slate-900 mb-3 text-sm">About the company</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  {job.company_logo
                    ? <img src={job.company_logo} alt="" className="w-10 h-10 object-contain" />
                    : <Building2 className="w-6 h-6 text-slate-400" />
                  }
                </div>
                <div>
                  <p className="font-bold text-slate-900">{job.company}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {job.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Similar jobs */}
            {job.category_slug && (
              <Link
                to={`/jobs?category=${job.category_slug}`}
                className="block bg-gradient-to-br from-brand-50 to-emerald-50 border border-brand-100 rounded-2xl p-5 hover:shadow-md transition-all group"
              >
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">Explore More</p>
                <p className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                  More {job.category_name} jobs →
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Apply Modal ── */}
      <Modal
        isOpen={applyModal}
        onClose={() => { setApplyModal(false); setResumeFile(null); setFileError(''); }}
        title="Submit Your Application"
        size="lg"
      >
        <form onSubmit={handleSubmit(onApply)} className="p-6 space-y-4">

          {/* Job summary */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand-50 to-emerald-50 rounded-xl border border-brand-100">
            <div className="w-10 h-10 rounded-xl bg-white border border-brand-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {job.company_logo
                ? <img src={job.company_logo} alt="" className="w-8 h-8 object-contain" />
                : <Building2 className="w-5 h-5 text-slate-400" />
              }
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{job.title}</p>
              <p className="text-xs text-slate-500">{job.company} · {job.location}</p>
            </div>
          </div>

          {/* Mandatory applicant info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full name */}
            <div>
              <label className="label flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('applicant_name')}
                placeholder="John Doe"
                className={cn('input-field', errors.applicant_name && 'input-error')}
              />
              {errors.applicant_name && <p className="mt-1 text-xs text-red-500">{errors.applicant_name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="label flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('applicant_phone')}
                type="tel"
                placeholder="+1 555 000 0000"
                className={cn('input-field', errors.applicant_phone && 'input-error')}
              />
              {errors.applicant_phone && <p className="mt-1 text-xs text-red-500">{errors.applicant_phone.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('applicant_email')}
              type="email"
              placeholder="you@example.com"
              className={cn('input-field', errors.applicant_email && 'input-error')}
            />
            {errors.applicant_email && <p className="mt-1 text-xs text-red-500">{errors.applicant_email.message}</p>}
          </div>

          {/* Resume upload */}
          <div>
            <label className="label flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Resume / CV <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
            />

            {resumeFile ? (
              <div className="flex items-center gap-3 p-3 bg-brand-50 border border-brand-200 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-800 truncate">{resumeFile.name}</p>
                  <p className="text-xs text-brand-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={removeFile} className="text-brand-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="resume-upload"
                className={cn(
                  'flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all',
                  fileError
                    ? 'border-red-300 bg-red-50 hover:border-red-400'
                    : 'border-slate-200 bg-slate-50 hover:border-brand-400 hover:bg-brand-50'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">Click to upload your resume</p>
                  <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, or DOCX — max 5 MB</p>
                </div>
              </label>
            )}
            {fileError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{fileError}</p>}
          </div>

          {/* Cover letter */}
          <div>
            <label className="label flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Cover Letter
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              {...register('cover_letter')}
              rows={4}
              placeholder="Tell the hiring team why you're the perfect fit…"
              className="input-field resize-none"
            />
            <div className="flex justify-between mt-1">
              {errors.cover_letter
                ? <p className="text-xs text-red-500">{errors.cover_letter.message}</p>
                : <span />
              }
              <p className="text-xs text-slate-400">{(watch('cover_letter') || '').length}/2000</p>
            </div>
          </div>

          {/* Required note */}
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span className="text-red-500 font-bold">*</span> Required fields
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setApplyModal(false); setResumeFile(null); setFileError(''); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                : <><Send className="w-4 h-4" /> Submit Application</>
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
