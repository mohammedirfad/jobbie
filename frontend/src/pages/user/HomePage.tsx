import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Briefcase, TrendingUp, Users, Building2, Star, ChevronRight, Zap } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchFeaturedJobs } from '../../features/jobs/jobsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { JobCard } from '../../components/jobs/JobCard';
import { CardSkeleton } from '../../components/common/Loader';

const stats = [
  { icon: <Briefcase className="w-6 h-6" />, value: '10,000+', label: 'Active Jobs' },
  { icon: <Building2 className="w-6 h-6" />, value: '2,500+', label: 'Companies' },
  { icon: <Users className="w-6 h-6" />, value: '500K+', label: 'Job Seekers' },
  { icon: <TrendingUp className="w-6 h-6" />, value: '85%', label: 'Hire Rate' },
];

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { featuredJobs, loading } = useAppSelector(s => s.jobs);
  const { categories } = useAppSelector(s => s.categories);

  useEffect(() => {
    dispatch(fetchFeaturedJobs());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-slate-900 via-dark-800 to-slate-900 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-sm text-brand-300 font-medium">The #1 Job Portal for Tech Professionals</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 animate-slide-up">
            Find Your{' '}
            <span className="bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
              Dream Career
            </span>
            <br />
            <span className="text-4xl sm:text-5xl lg:text-6xl font-bold">Today</span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Connect with thousands of companies hiring right now. From startups to Fortune 500 — your next opportunity is one search away.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-2 gap-2 shadow-2xl">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Job title, company, or keyword…"
                  className="flex-1 bg-transparent text-white placeholder:text-slate-400 focus:outline-none text-sm"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-3 rounded-xl">
                Search Jobs
              </button>
            </div>
          </form>

          <p className="text-slate-400 text-sm mb-12">
            Popular:{' '}
            {['React Developer', 'Product Manager', 'UI Designer', 'Data Scientist'].map((t, i) => (
              <Link key={t} to={`/jobs?search=${t}`}
                className="inline-block text-brand-300 hover:text-brand-100 mx-1.5 underline underline-offset-2 transition-colors">
                {t}{i < 3 ? ',' : ''}
              </Link>
            ))}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {stats.map(s => (
              <div key={s.label} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all">
                <div className="text-brand-400 mb-1.5 flex justify-center">{s.icon}</div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Featured</span>
              </div>
              <h2 className="section-title">Hot Opportunities</h2>
              <p className="text-slate-500 mt-1">Handpicked roles from top companies</p>
            </div>
            <Link to="/jobs?is_featured=true" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredJobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/jobs" className="btn-primary px-8 py-3">
              Browse All Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-2">Browse by Category</h2>
            <p className="text-slate-500">Find your next role in the field you love</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 10).map(cat => (
              <Link
                key={cat.id}
                to={`/jobs?category=${cat.slug}`}
                className="group card p-5 text-center hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{cat.name}</h3>
                <p className="text-xs text-brand-600 font-medium">{cat.job_count ?? 0} jobs</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/categories" className="btn-secondary">
              All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to spark your career?</h2>
          <p className="text-brand-100 text-lg mb-8">Join thousands of professionals who found their dream job on HireNest.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-brand-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-all inline-flex items-center gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/jobs" className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all">
              Explore Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
