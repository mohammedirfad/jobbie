import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Filter, X, SlidersHorizontal, ChevronDown,
  MapPin, Briefcase, GraduationCap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchJobs, setFilters, clearFilters } from '../../features/jobs/jobsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { JobCard } from '../../components/jobs/JobCard';
import { Pagination } from '../../components/common/Pagination';
import { CardSkeleton } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { cn, capitalize } from '../../utils';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXP_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];

const SORT_OPTIONS = [
  { value: 'created_at|desc', label: 'Newest First' },
  { value: 'created_at|asc',  label: 'Oldest First' },
  { value: 'salary_min|desc', label: 'Highest Salary' },
  { value: 'title|asc',       label: 'A–Z Title' },
];

export const JobListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { jobs, loading, pagination } = useAppSelector(s => s.jobs);
  const { categories } = useAppSelector(s => s.categories);

  // ── Local filter state — seeded directly from URL on mount ──────────────
  const [search,      setSearch]      = useState(searchParams.get('search')    || '');
  const [category,    setCategory]    = useState(searchParams.get('category')  || '');
  const [expLevel,    setExpLevel]    = useState(searchParams.get('experience_level') || '');
  const [jobType,     setJobType]     = useState(searchParams.get('job_type')  || '');
  const [location,    setLocation]    = useState(searchParams.get('location')  || '');
  const [sortVal,     setSortVal]     = useState('created_at|desc');
  const [page,        setPage]        = useState(1);
  const [showFilters, setShowFilters] = useState(
    !!(searchParams.get('category') || searchParams.get('experience_level') || searchParams.get('job_type'))
  );

  const debouncedSearch   = useDebounce(search,   400);
  const debouncedLocation = useDebounce(location, 400);

  // Track whether the initial URL-seeded fetch has fired
  const initialFired = useRef(false);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  // ── Single source-of-truth fetch ─────────────────────────────────────────
  const doFetch = (pg = page) => {
    const [sort_by, sort_order] = sortVal.split('|') as [string, 'asc' | 'desc'];
    dispatch(fetchJobs({
      search:           debouncedSearch   || undefined,
      category:         category          || undefined,
      experience_level: expLevel          || undefined,
      job_type:         jobType           || undefined,
      location:         debouncedLocation || undefined,
      sort_by,
      sort_order,
      page: pg,
      limit: 9,
    }));
    // sync URL params
    const params: Record<string, string> = {};
    if (debouncedSearch)   params.search   = debouncedSearch;
    if (category)          params.category = category;
    if (expLevel)          params.experience_level = expLevel;
    if (jobType)           params.job_type = jobType;
    if (debouncedLocation) params.location = debouncedLocation;
    setSearchParams(params, { replace: true });
  };

  // Fire when debounced text or any filter changes
  useEffect(() => {
    if (!initialFired.current) { initialFired.current = true; }
    setPage(1);
    doFetch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedLocation, category, expLevel, jobType, sortVal]);

  const handlePage = (p: number) => {
    setPage(p);
    doFetch(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAll = () => {
    setSearch('');
    setCategory('');
    setExpLevel('');
    setJobType('');
    setLocation('');
    setSortVal('created_at|desc');
    setPage(1);
    dispatch(clearFilters());
    dispatch(fetchJobs({ page: 1, limit: 9 }));
    setSearchParams({}, { replace: true });
  };

  const hasFilters = !!(category || expLevel || jobType || search || location);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-slate-900 mb-1">Browse Jobs</h1>
          <p className="text-slate-500">
            {pagination
              ? `${pagination.total.toLocaleString()} opportunities available`
              : 'Explore opportunities'}
          </p>

          {/* ── Search bar ── */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Job title, company, or keyword…"
                className="input-field pl-11 h-11"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location…"
                className="input-field pl-10 h-11 w-full sm:w-44"
              />
              {location && (
                <button onClick={() => setLocation('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'btn-secondary h-11 gap-2 flex-shrink-0',
                showFilters && 'bg-brand-50 border-brand-300 text-brand-700'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                  {[category, expLevel, jobType, search, location].filter(Boolean).length}
                </span>
              )}
            </button>

            <div className="relative flex-shrink-0">
              <select
                value={sortVal}
                onChange={e => setSortVal(e.target.value)}
                className="input-field h-11 pr-8 appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Filter panel ── */}
        {showFilters && (
          <div className="card p-5 mb-6 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4 text-brand-600" /> Advanced Filters
              </h3>
              {hasFilters && (
                <button onClick={handleClearAll}
                  className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Category */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="input-field appearance-none cursor-pointer pr-8"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Experience Level
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EXP_LEVELS.map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setExpLevel(expLevel === l ? '' : l)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                        expLevel === l
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Job Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {JOB_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setJobType(jobType === t ? '' : t)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                        jobType === t
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                {category && (
                  <span className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    {categories.find(c => c.slug === category)?.name || category}
                    <button onClick={() => setCategory('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {expLevel && (
                  <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">
                    {expLevel}
                    <button onClick={() => setExpLevel('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {jobType && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">
                    {jobType}
                    <button onClick={() => setJobType('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    "{search}"
                    <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    📍 {location}
                    <button onClick={() => setLocation('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Results ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<Search className="w-8 h-8" />}
            title="No jobs found"
            description="Try different keywords, location or remove some filters."
            action={
              <button onClick={handleClearAll} className="btn-primary">
                Clear All Filters
              </button>
            }
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
    </div>
  );
};
