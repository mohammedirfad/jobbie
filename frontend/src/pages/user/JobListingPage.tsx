import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchJobs, setFilters, clearFilters } from '../../features/jobs/jobsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { JobCard } from '../../components/jobs/JobCard';
import { Pagination } from '../../components/common/Pagination';
import { CardSkeleton } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../utils';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];
const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest First' },
  { value: 'created_at_asc', label: 'Oldest First' },
  { value: 'salary_min_desc', label: 'Highest Salary' },
  { value: 'title_asc', label: 'A–Z Title' },
];

export const JobListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const dispatch = useAppDispatch();
  const { jobs, loading, pagination, filters } = useAppSelector(s => s.jobs);
  const { categories } = useAppSelector(s => s.categories);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    setSearchParams(params, { replace: true });

    dispatch(fetchJobs({
      ...filters,
      search: debouncedSearch || undefined,
      page: 1,
    }));
    dispatch(setFilters({ search: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch]);

  const applyFilter = useCallback((key: string, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    dispatch(setFilters(newFilters));
    dispatch(fetchJobs(newFilters));
  }, [filters, dispatch]);

  const handlePage = (page: number) => {
    dispatch(setFilters({ page }));
    dispatch(fetchJobs({ ...filters, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (val: string) => {
    const [sort_by, sort_order] = val.split('_').reduce<[string, string]>((acc, part, idx, arr) => {
      if (idx < arr.length - 1) { acc[0] = acc[0] ? acc[0] + '_' + part : part; }
      else acc[1] = part;
      return acc;
    }, ['', '']);
    applyFilter('sort_by', sort_by);
    dispatch(setFilters({ sort_order: sort_order as 'asc' | 'desc' }));
    dispatch(fetchJobs({ ...filters, sort_by, sort_order: sort_order as 'asc' | 'desc', page: 1 }));
  };

  const handleClearAll = () => {
    setSearch('');
    dispatch(clearFilters());
    dispatch(fetchJobs({ page: 1, limit: 10 }));
  };

  const hasActiveFilters = filters.category || filters.experience_level || filters.job_type || filters.search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-1">Browse Jobs</h1>
        <p className="text-slate-500">
          {pagination ? `${pagination.total.toLocaleString()} opportunities available` : 'Explore opportunities'}
        </p>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs, companies, skills…"
            className="input-field pl-11"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn('btn-secondary gap-2', showFilters && 'bg-brand-50 border-brand-200 text-brand-600')}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 bg-brand-600 rounded-full" />}
        </button>
        <div className="relative">
          <select
            onChange={e => handleSort(e.target.value)}
            className="input-field pr-8 appearance-none cursor-pointer"
            defaultValue="created_at_desc"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </h3>
            {hasActiveFilters && (
              <button onClick={handleClearAll} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Category */}
            <div>
              <label className="label">Category</label>
              <select
                value={filters.category || ''}
                onChange={e => applyFilter('category', e.target.value || undefined)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            {/* Experience */}
            <div>
              <label className="label">Experience Level</label>
              <div className="flex flex-wrap gap-1.5">
                {EXP_LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => applyFilter('experience_level', filters.experience_level === l ? undefined : l)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                      filters.experience_level === l
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {/* Job Type */}
            <div>
              <label className="label">Job Type</label>
              <div className="flex flex-wrap gap-1.5">
                {JOB_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => applyFilter('job_type', filters.job_type === t ? undefined : t)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                      filters.job_type === t
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="No jobs found"
          description="Try adjusting your search or filters to find more results."
          action={<button onClick={handleClearAll} className="btn-primary">Clear Filters</button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePage}
            />
          )}
        </>
      )}
    </div>
  );
};
