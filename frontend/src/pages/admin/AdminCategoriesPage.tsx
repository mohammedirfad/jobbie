import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCategories, createCategoryThunk, deleteCategoryThunk } from '../../features/categories/categoriesSlice';
import { ConfirmModal, Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { Spinner } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  icon: z.string().optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export const AdminCategoriesPage = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { categories, loading } = useAppSelector(s => s.categories);

  const [createModal, setCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await dispatch(createCategoryThunk(data)).unwrap();
      toast.success('Category created');
      setCreateModal(false);
      reset();
    } catch (err: unknown) {
      toast.error(typeof err === 'string' ? err : 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteCategoryThunk(deleteId)).unwrap();
      toast.success('Category deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">{categories.length} categories</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : categories.length === 0 ? (
        <EmptyState title="No categories" description="Add your first job category"
          action={<button onClick={() => setCreateModal(true)} className="btn-primary">Add Category</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="card p-4 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-3xl flex-shrink-0">{cat.icon}</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{cat.name}</h3>
                    <p className="text-xs text-slate-500 font-mono truncate">{cat.slug}</p>
                    <p className="text-sm font-semibold text-brand-600 mt-0.5">{cat.job_count ?? 0} jobs</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteId(cat.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {cat.description && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{cat.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => { setCreateModal(false); reset(); }} title="Add Category" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Category Name *</label>
            <input {...register('name')} placeholder="e.g. Technology" className={`input-field ${errors.name ? 'input-error' : ''}`} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Slug *</label>
            <input {...register('slug')} placeholder="e.g. technology" className={`input-field font-mono ${errors.slug ? 'input-error' : ''}`} />
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="label">Icon (Emoji)</label>
            <input {...register('icon')} placeholder="e.g. 💻" className="input-field" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={2} placeholder="Brief description" className="input-field resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setCreateModal(false); reset(); }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Deleting this category will un-assign all jobs under it. This cannot be undone."
        confirmText="Delete Category"
        danger
        loading={deleteLoading}
      />
    </div>
  );
};
