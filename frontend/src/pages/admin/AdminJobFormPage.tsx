import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createJobThunk, updateJobThunk, fetchJobById, clearCurrentJob } from '../../features/jobs/jobsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { useToast } from '../../components/common/Toast';
import { Spinner } from '../../components/common/Loader';
import { cn } from '../../utils';

const schema = z.object({
  title:            z.string().trim().min(3, 'Title must be at least 3 characters').max(255),
  company:          z.string().trim().min(2, 'Company name is required'),
  company_logo:     z.string().url('Must be a valid URL (https://...)').optional().or(z.literal('')),
  location:         z.string().trim().min(2, 'Location is required'),
  job_type:         z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  // category_id: non-empty string (uuid check done on server), allow any non-empty string here
  category_id:      z.string().min(1, 'Please select a category'),
  description:      z.string().trim().min(50, 'Description must be at least 50 characters'),
  requirements:     z.array(z.string()),
  responsibilities: z.array(z.string()),
  skills:           z.array(z.string()),
  salary_min:       z.coerce.number().min(0, 'Must be ≥ 0').optional().or(z.literal('')),
  salary_max:       z.coerce.number().min(0, 'Must be ≥ 0').optional().or(z.literal('')),
  salary_currency:  z.string().default('USD'),
  is_featured:      z.boolean().default(false),
  deadline:         z.string().optional(),
});
type FormData = z.infer<typeof schema>;

// ── Array field component ──────────────────────────────────────────────────
const ArrayField = ({
  label, value, onChange, placeholder, hint,
}: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder: string; hint?: string }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="input-field"
        />
        <button type="button" onClick={add}
          className="btn-secondary flex-shrink-0 px-3 py-2.5">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 text-xs px-2.5 py-1 rounded-lg font-medium">
              {item}
              <button type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="hover:text-red-500 transition-colors ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">Nothing added yet — type above and press Enter or click +</p>
      )}
    </div>
  );
};

// ── Inline error message ───────────────────────────────────────────────────
const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" /> {message}
    </p>
  ) : null;

export const AdminJobFormPage = () => {
  const { id }   = useParams<{ id?: string }>();
  const isEdit   = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast    = useToast();

  const { categories }           = useAppSelector(s => s.categories);
  const { currentJob, detailLoading } = useAppSelector(s => s.jobs);
  const [submitting, setSubmitting]   = useState(false);

  const {
    register, handleSubmit, control, reset, watch,
    formState: { errors, isSubmitted },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      requirements: [], responsibilities: [], skills: [],
      job_type: 'full-time', experience_level: 'mid',
      salary_currency: 'USD', is_featured: false,
      category_id: '',
    },
  });

  useEffect(() => {
    dispatch(fetchCategories());
    if (!isEdit) dispatch(clearCurrentJob());
  }, [dispatch, isEdit]);

  useEffect(() => {
    if (isEdit && id) dispatch(fetchJobById(id));
    return () => { dispatch(clearCurrentJob()); };
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && currentJob) {
      reset({
        title:            currentJob.title,
        company:          currentJob.company,
        company_logo:     currentJob.company_logo || '',
        location:         currentJob.location,
        job_type:         currentJob.job_type,
        experience_level: currentJob.experience_level,
        category_id:      currentJob.category_id || '',
        description:      currentJob.description,
        requirements:     currentJob.requirements     || [],
        responsibilities: currentJob.responsibilities || [],
        skills:           currentJob.skills           || [],
        salary_min:       currentJob.salary_min   ?? '',
        salary_max:       currentJob.salary_max   ?? '',
        salary_currency:  currentJob.salary_currency  || 'USD',
        is_featured:      currentJob.is_featured,
        deadline:         currentJob.deadline
          ? new Date(currentJob.deadline).toISOString().split('T')[0]
          : '',
      });
    }
  }, [currentJob, isEdit, reset]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        salary_min: data.salary_min === '' ? undefined : Number(data.salary_min),
        salary_max: data.salary_max === '' ? undefined : Number(data.salary_max),
      };

      if (isEdit && id) {
        await dispatch(updateJobThunk({ id, data: payload })).unwrap();
        toast.success('Job updated successfully');
      } else {
        await dispatch(createJobThunk(payload)).unwrap();
        toast.success('Job posted successfully!');
      }
      navigate('/admin/jobs');
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : 'Failed to save job. Please check all required fields.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Show a summary of errors at the top when the form is submitted with errors
  const errorCount = Object.keys(errors).length;

  if (detailLoading) return (
    <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Job' : 'Post New Job'}</h2>
          <p className="text-sm text-slate-500 mt-0.5">Fields marked <span className="text-red-500">*</span> are required</p>
        </div>
      </div>

      {/* Error summary banner */}
      {isSubmitted && errorCount > 0 && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Please fix {errorCount} error{errorCount > 1 ? 's' : ''} before saving:</p>
            <ul className="mt-1 space-y-0.5">
              {Object.entries(errors).map(([field, err]) => (
                <li key={field} className="text-xs text-red-600 flex items-center gap-1">
                  <span className="capitalize font-medium">{field.replace(/_/g, ' ')}:</span>
                  {(err as { message?: string })?.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

        {/* ── Basic Info ── */}
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-brand-600 pb-1 border-b border-slate-100">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Job Title <span className="text-red-500">*</span></label>
              <input
                {...register('title')}
                placeholder="e.g. Senior React Developer"
                className={cn('input-field', errors.title && 'input-error')}
              />
              <FieldError message={errors.title?.message} />
            </div>
            <div>
              <label className="label">Company <span className="text-red-500">*</span></label>
              <input
                {...register('company')}
                placeholder="Company name"
                className={cn('input-field', errors.company && 'input-error')}
              />
              <FieldError message={errors.company?.message} />
            </div>
          </div>

          <div>
            <label className="label">Company Logo URL <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              {...register('company_logo')}
              placeholder="https://company.com/logo.png"
              className={cn('input-field', errors.company_logo && 'input-error')}
            />
            <FieldError message={errors.company_logo?.message} />
          </div>

          <div>
            <label className="label">Location <span className="text-red-500">*</span></label>
            <input
              {...register('location')}
              placeholder="e.g. San Francisco, CA or Remote"
              className={cn('input-field', errors.location && 'input-error')}
            />
            <FieldError message={errors.location?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Job Type <span className="text-red-500">*</span></label>
              <select {...register('job_type')} className="input-field">
                {(['full-time', 'part-time', 'contract', 'internship', 'remote'] as const).map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Experience Level <span className="text-red-500">*</span></label>
              <select {...register('experience_level')} className="input-field">
                {(['entry', 'mid', 'senior', 'lead', 'executive'] as const).map(l => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Category <span className="text-red-500">*</span></label>
              <select
                {...register('category_id')}
                className={cn('input-field', errors.category_id && 'input-error')}
                defaultValue=""
              >
                <option value="" disabled>— Select a category —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <FieldError message={errors.category_id?.message} />
            </div>
          </div>
        </div>

        {/* ── Job Details ── */}
        <div className="card p-6 space-y-5">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-brand-600 pb-1 border-b border-slate-100">
            Job Details
          </h3>

          <div>
            <label className="label">
              Description <span className="text-red-500">*</span>
              <span className="text-slate-400 font-normal ml-1">(min 50 characters)</span>
            </label>
            <textarea
              {...register('description')}
              rows={6}
              placeholder="Describe the role, team, and what makes this opportunity exciting…"
              className={cn('input-field resize-none', errors.description && 'input-error')}
            />
            <div className="flex items-center justify-between mt-1">
              <FieldError message={errors.description?.message} />
              <span className="text-xs text-slate-400 ml-auto">
                {(watch('description') || '').length} chars
              </span>
            </div>
          </div>

          <Controller name="requirements" control={control} render={({ field }) => (
            <ArrayField
              label="Requirements"
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Type a requirement and press Enter"
              hint="e.g. 3+ years of React experience"
            />
          )} />

          <Controller name="responsibilities" control={control} render={({ field }) => (
            <ArrayField
              label="Responsibilities"
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Type a responsibility and press Enter"
              hint="e.g. Build and maintain React applications"
            />
          )} />

          <Controller name="skills" control={control} render={({ field }) => (
            <ArrayField
              label="Skills / Technologies"
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="e.g. React, TypeScript"
              hint="Add individual skills — press Enter after each"
            />
          )} />
        </div>

        {/* ── Salary & Options ── */}
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-brand-600 pb-1 border-b border-slate-100">
            Salary & Options
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Min Salary <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                {...register('salary_min')}
                type="number"
                min={0}
                placeholder="e.g. 80000"
                className={cn('input-field', errors.salary_min && 'input-error')}
              />
              <FieldError message={errors.salary_min?.message as string | undefined} />
            </div>
            <div>
              <label className="label">Max Salary <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                {...register('salary_max')}
                type="number"
                min={0}
                placeholder="e.g. 120000"
                className={cn('input-field', errors.salary_max && 'input-error')}
              />
              <FieldError message={errors.salary_max?.message as string | undefined} />
            </div>
            <div>
              <label className="label">Currency</label>
              <select {...register('salary_currency')} className="input-field">
                {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Application Deadline <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                {...register('deadline')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" className="sr-only" {...register('is_featured')} id="is_featured" />
                  <div
                    onClick={() => {}}
                    className={cn(
                      'w-11 h-6 rounded-full transition-colors cursor-pointer',
                      watch('is_featured') ? 'bg-brand-600' : 'bg-slate-200'
                    )}
                  />
                  <div className={cn(
                    'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform pointer-events-none',
                    watch('is_featured') ? 'translate-x-5' : ''
                  )} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-700">Featured Job</span>
                  <p className="text-xs text-slate-400">Show on homepage & mark with star</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary px-8">
            {submitting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> {isEdit ? 'Save Changes' : 'Post Job'}</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};
