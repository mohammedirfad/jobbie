import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, Star, ChevronDown, Filter } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchJobs, deleteJobThunk, toggleJobStatusThunk } from '../../features/jobs/jobsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { ConfirmModal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { TableRowSkeleton } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { cn, jobTypeBadgeColor, experienceBadgeColor, capitalize, timeAgo } from '../../utils';
import { useDebounce } from '../../hooks/useDebounce';

export const AdminJobsPage = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { jobs, loading, pagination } = useAppSelector(s => s.jobs);
  const { categories } = useAppSelector(s => s.categories);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    dispatch(fetchJobs({
      search: debouncedSearch || undefined,
      category: categoryFilter || undefined,
      experience_level: expFilter || undefined,
      page,
      limit: 10,
      is_active: undefined,
    }));
  }, [debouncedSearch, categoryFilter, expFilter, page, dispatch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteJobThunk(deleteId)).unwrap();
      toast.success('Job deleted successfully');
      setDeleteId(null);
    } catch (err: unknown) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete job');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await dispatch(toggleJobStatusThunk(id)).unwrap();
      toast.success(`Job ${res.is_active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to toggle job status');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Job Listings</h2>
          <p className="text-sm text-slate-500">{pagination?.total ?? 0} total jobs</p>
        </div>
        <Link to="/admin/jobs/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search jobs…" className="input-field pl-10" />
          </div>
          <div className="relative">
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              className="input-field pr-8 appearance-none cursor-pointer min-w-[150px]">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={expFilter} onChange={e => { setExpFilter(e.target.value); setPage(1); }}
              className="input-field pr-8 appearance-none cursor-pointer min-w-[150px]">
              <option value="">All Levels</option>
              {['entry', 'mid', 'senior', 'lead', 'executive'].map(l => (
                <option key={l} value={l}>{capitalize(l)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Job', 'Type', 'Experience', 'Category', 'Status', 'Posted', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                : jobs.length === 0
                  ? (
                    <tr><td colSpan={7}>
                      <EmptyState icon={<Filter className="w-6 h-6" />} title="No jobs found"
                        description="Try adjusting your filters" />
                    </td></tr>
                  )
                  : jobs.map(job => (
                    <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {job.is_featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[200px]">{job.title}</p>
                            <p className="text-xs text-slate-500 truncate">{job.company} · {job.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('badge', jobTypeBadgeColor(job.job_type))}>{capitalize(job.job_type)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('badge', experienceBadgeColor(job.experience_level))}>{capitalize(job.experience_level)}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{job.category_name || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(job.id)} className="flex items-center gap-1.5 group">
                          {job.is_active
                            ? <ToggleRight className="w-5 h-5 text-brand-600" />
                            : <ToggleLeft className="w-5 h-5 text-slate-400" />
                          }
                          <span className={cn('text-xs font-medium', job.is_active ? 'text-brand-600' : 'text-slate-400')}>
                            {job.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{timeAgo(job.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/admin/jobs/${job.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => setDeleteId(job.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {pagination && !loading && (
          <div className="px-4 border-t border-slate-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={p => setPage(p)}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Job"
        message="Are you sure you want to delete this job? This will also delete all associated applications and cannot be undone."
        confirmText="Delete Job"
        danger
        loading={deleteLoading}
      />
    </div>
  );
};
