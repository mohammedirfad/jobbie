import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, ArrowLeft, Save } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createJobThunk, updateJobThunk, fetchJobById } from '../../features/jobs/jobsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { useToast } from '../../components/common/Toast';
import { Spinner } from '../../components/common/Loader';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  company: z.string().min(2, 'Company is required'),
  company_logo: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required'),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  category_id: z.string().uuid('Select a valid category'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  skills: z.array(z.string()),
  salary_min: z.coerce.number().min(0).optional(),
  salary_max: z.coerce.number().min(0).optional(),
  salary_currency: z.string().default('USD'),
  is_featured: z.boolean().default(false),
  deadline: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const ArrayField = ({
  label, value, onChange, placeholder,
}: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder: string }) => {
  const [input, setInput] = useState('');
  const add = () => {
    if (input.trim()) { onChange([...value, input.trim()]); setInput(''); }
  };
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2 mb-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder} className="input-field" />
        <button type="button" onClick={add} className="btn-secondary flex-shrink-0 px-3">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 text-xs px-2.5 py-1 rounded-lg">
            {item}
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="hover:text-red-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export const AdminJobFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { categories } = useAppSelector(s => s.categories);
  const { currentJob, detailLoading } = useAppSelector(s => s.jobs);
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      requirements: [], responsibilities: [], skills: [],
      job_type: 'full-time', experience_level: 'mid',
      salary_currency: 'USD', is_featured: false,
    },
  });

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    if (isEdit && id) dispatch(fetchJobById(id));
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && currentJob) {
      reset({
        title: currentJob.title,
        company: currentJob.company,
        company_logo: currentJob.company_logo || '',
        location: currentJob.location,
        job_type: currentJob.job_type,
        experience_level: currentJob.experience_level,
        category_id: currentJob.category_id,
        description: currentJob.description,
        requirements: currentJob.requirements || [],
        responsibilities: currentJob.responsibilities || [],
        skills: currentJob.skills || [],
        salary_min: currentJob.salary_min ?? undefined,
        salary_max: currentJob.salary_max ?? undefined,
        salary_currency: currentJob.salary_currency || 'USD',
        is_featured: currentJob.is_featured,
        deadline: currentJob.deadline ? new Date(currentJob.deadline).toISOString().split('T')[0] : '',
      });
    }
  }, [currentJob, isEdit, reset]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await dispatch(updateJobThunk({ id, data })).unwrap();
        toast.success('Job updated successfully');
      } else {
        await dispatch(createJobThunk(data)).unwrap();
        toast.success('Job created successfully');
      }
      navigate('/admin/jobs');
    } catch (err: unknown) {
      toast.error(typeof err === 'string' ? err : 'Failed to save job');
    } finally {
      setSubmitting(false);
    }
  };

  if (detailLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost -ml-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Job' : 'Post New Job'}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit as unknown as Parameters<typeof handleSubmit>[0])} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-brand-600">Basic Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Job Title *</label>
              <input {...register('title')} placeholder="e.g. Senior React Developer" className={`input-field ${errors.title ? 'input-error' : ''}`} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Company *</label>
              <input {...register('company')} placeholder="Company name" className={`input-field ${errors.company ? 'input-error' : ''}`} />
              {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Company Logo URL</label>
            <input {...register('company_logo')} placeholder="https://company.com/logo.png" className="input-field" />
            {errors.company_logo && <p className="mt-1 text-xs text-red-500">{errors.company_logo.message}</p>}
          </div>

          <div>
            <label className="label">Location *</label>
            <input {...register('location')} placeholder="e.g. San Francisco, CA or Remote" className={`input-field ${errors.location ? 'input-error' : ''}`} />
            {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Job Type *</label>
              <select {...register('job_type')} className="input-field">
                {['full-time', 'part-time', 'contract', 'internship', 'remote'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Experience Level *</label>
              <select {...register('experience_level')} className="input-field">
                {['entry', 'mid', 'senior', 'lead', 'executive'].map(l => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Category *</label>
              <select {...register('category_id')} className={`input-field ${errors.category_id ? 'input-error' : ''}`}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-brand-600">Job Details</h3>
          <div>
            <label className="label">Description * <span className="text-slate-400 font-normal">(min 50 chars)</span></label>
            <textarea {...register('description')} rows={6} placeholder="Describe the role, team, and what makes it exciting…"
              className={`input-field resize-none ${errors.description ? 'input-error' : ''}`} />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <Controller name="requirements" control={control} render={({ field }) => (
            <ArrayField label="Requirements" value={field.value} onChange={field.onChange} placeholder="Add a requirement and press Enter" />
          )} />
          <Controller name="responsibilities" control={control} render={({ field }) => (
            <ArrayField label="Responsibilities" value={field.value} onChange={field.onChange} placeholder="Add a responsibility and press Enter" />
          )} />
          <Controller name="skills" control={control} render={({ field }) => (
            <ArrayField label="Skills / Technologies" value={field.value} onChange={field.onChange} placeholder="e.g. React, TypeScript" />
          )} />
        </div>

        {/* Salary & Options */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-brand-600">Salary & Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Min Salary</label>
              <input {...register('salary_min')} type="number" placeholder="e.g. 80000" className="input-field" />
            </div>
            <div>
              <label className="label">Max Salary</label>
              <input {...register('salary_max')} type="number" placeholder="e.g. 120000" className="input-field" />
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
              <label className="label">Application Deadline</label>
              <input {...register('deadline')} type="date"
                min={new Date().toISOString().split('T')[0]}
                className="input-field" />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" {...register('is_featured')} />
                  <div className={`w-11 h-6 rounded-full transition-colors ${watch('is_featured') ? 'bg-brand-600' : 'bg-slate-200'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${watch('is_featured') ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">Featured Job</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Save className="w-4 h-4" /> {isEdit ? 'Save Changes' : 'Post Job'}</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};
