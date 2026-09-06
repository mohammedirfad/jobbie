import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Briefcase, TrendingUp, Users,
  Building2, Star, ChevronRight, Zap, MapPin,
  Code2, Palette, BarChart3, Heart, BookOpen,
  Scale, Settings, DollarSign, UserCheck, Megaphone,
  CheckCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchFeaturedJobs } from '../../features/jobs/jobsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { JobCard } from '../../components/jobs/JobCard';
import { CardSkeleton } from '../../components/common/Loader';

// ── Floating job cards data for CTA background ─────────────────────────────
const FLOATING_JOBS = [
  { title: 'React Developer', company: 'TechCorp', salary: '$120K', icon: <Code2 className="w-4 h-4" />, color: 'from-blue-500 to-cyan-400' },
  { title: 'UI/UX Designer', company: 'PixelStudio', salary: '$95K', icon: <Palette className="w-4 h-4" />, color: 'from-pink-500 to-rose-400' },
  { title: 'Product Manager', company: 'StartupX', salary: '$140K', icon: <BarChart3 className="w-4 h-4" />, color: 'from-violet-500 to-purple-400' },
  { title: 'Data Scientist', company: 'AI Labs', salary: '$160K', icon: <TrendingUp className="w-4 h-4" />, color: 'from-emerald-500 to-green-400' },
  { title: 'DevOps Engineer', company: 'CloudBase', salary: '$135K', icon: <Settings className="w-4 h-4" />, color: 'from-amber-500 to-orange-400' },
  { title: 'Marketing Lead', company: 'GrowthCo', salary: '$90K', icon: <Megaphone className="w-4 h-4" />, color: 'from-red-500 to-pink-400' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'technology':      <Code2 className="w-5 h-5" />,
  'design':          <Palette className="w-5 h-5" />,
  'marketing':       <Megaphone className="w-5 h-5" />,
  'finance':         <DollarSign className="w-5 h-5" />,
  'healthcare':      <Heart className="w-5 h-5" />,
  'education':       <BookOpen className="w-5 h-5" />,
  'sales':           <BarChart3 className="w-5 h-5" />,
  'operations':      <Settings className="w-5 h-5" />,
  'legal':           <Scale className="w-5 h-5" />,
  'human-resources': <UserCheck className="w-5 h-5" />,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  'technology':      'from-blue-500 to-cyan-400',
  'design':          'from-pink-500 to-rose-400',
  'marketing':       'from-orange-500 to-amber-400',
  'finance':         'from-emerald-500 to-green-400',
  'healthcare':      'from-red-500 to-pink-400',
  'education':       'from-violet-500 to-purple-400',
  'sales':           'from-sky-500 to-blue-400',
  'operations':      'from-slate-500 to-slate-400',
  'legal':           'from-amber-600 to-yellow-400',
  'human-resources': 'from-teal-500 to-emerald-400',
};

const stats = [
  { icon: <Briefcase className="w-5 h-5" />, value: '10K+',  label: 'Active Jobs' },
  { icon: <Building2 className="w-5 h-5" />, value: '2.5K+', label: 'Companies' },
  { icon: <Users className="w-5 h-5" />,     value: '500K+', label: 'Job Seekers' },
  { icon: <TrendingUp className="w-5 h-5" />,value: '85%',   label: 'Hire Rate' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Profile', desc: 'Sign up free and build your professional profile in minutes.', icon: <UserCheck className="w-6 h-6" /> },
  { step: '02', title: 'Browse & Filter', desc: 'Explore thousands of jobs filtered by role, location and experience.', icon: <Search className="w-6 h-6" /> },
  { step: '03', title: 'Apply Instantly', desc: 'One-click apply with your cover letter and resume link.', icon: <CheckCircle className="w-6 h-6" /> },
];

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { featuredJobs, loading } = useAppSelector(s => s.jobs);
  const { categories }            = useAppSelector(s => s.categories);

  useEffect(() => {
    dispatch(fetchFeaturedJobs());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div className="overflow-hidden">

      {/* ─────────────────────────────── HERO ────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
        {/* Animated bg blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
          {/* Dot grid */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center w-full">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/25 rounded-full px-4 py-1.5 mb-7 animate-fade-in">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-sm text-brand-300 font-medium">Trusted by 500,000+ professionals</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-none tracking-tight mb-6 animate-slide-up">
            Land Your
            <span className="block bg-gradient-to-r from-brand-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Dream Job
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.15s' }}>
            Connect with world-class companies hiring right now.
            From startups to Fortune 500 — your next opportunity is one search away.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl p-2 gap-2 shadow-2xl focus-within:border-brand-500/50 transition-all">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Job title, company, or skill…"
                  className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-sm"
                />
              </div>
              <button type="submit" className="btn-primary px-7 py-3 rounded-xl text-sm">
                Search Jobs
              </button>
            </div>
          </form>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-14 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="text-slate-500 text-xs">Trending:</span>
            {['React Developer', 'Product Manager', 'UI Designer', 'Data Scientist', 'DevOps'].map(t => (
              <button
                key={t}
                onClick={() => navigate(`/jobs?search=${encodeURIComponent(t)}`)}
                className="text-xs text-slate-400 hover:text-brand-300 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-full transition-all"
              >
                {t}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.35s' }}>
            {stats.map(s => (
              <div key={s.label} className="bg-white/5 backdrop-blur border border-white/8 rounded-2xl p-4 hover:bg-white/10 hover:border-white/15 transition-all">
                <div className="text-brand-400 mb-2 flex justify-center">{s.icon}</div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────── FEATURED JOBS ───────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Featured Roles</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900">Hot Opportunities</h2>
              <p className="text-slate-500 mt-1 text-sm">Handpicked by our team from top-tier companies</p>
            </div>
            <Link
              to="/jobs"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              View all jobs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No featured jobs yet</p>
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

      {/* ─────────────────────────────── CATEGORIES ─────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Browse by Category</h2>
            <p className="text-slate-500">Find your next role in the field you love</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 10).map(cat => {
              const gradient = CATEGORY_GRADIENTS[cat.slug] ?? 'from-brand-500 to-emerald-400';
              const icon = CATEGORY_ICONS[cat.slug] ?? <Briefcase className="w-5 h-5" />;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/jobs?category=${cat.slug}`)}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 p-5 text-center w-full"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 text-white group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    {icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-0.5 group-hover:text-brand-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs font-semibold text-brand-600">{cat.job_count ?? 0} jobs</p>
                </button>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link to="/categories" className="btn-secondary gap-2">
              All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────── HOW IT WORKS ───────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 mb-2">How HireNest Works</h2>
            <p className="text-slate-500">Land your next job in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative text-center group">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px border-t-2 border-dashed border-slate-200" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-500 flex items-center justify-center text-white mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <div className="text-xs font-black text-brand-500 mb-1 tracking-widest">{step.step}</div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────── CTA ────────────────────────────────── */}
      <section className="relative py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating job cards */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FLOATING_JOBS.map((fj, i) => {
            const positions = [
              'top-8 left-[5%]',
              'top-16 right-[8%]',
              'top-1/2 left-[2%] -translate-y-1/2',
              'top-1/2 right-[3%] -translate-y-1/2',
              'bottom-10 left-[10%]',
              'bottom-8 right-[12%]',
            ];
            const delays = ['0s', '0.8s', '1.6s', '2.4s', '3.2s', '4s'];
            return (
              <div
                key={i}
                className={`absolute ${positions[i]} hidden lg:block animate-float opacity-60 hover:opacity-90`}
                style={{ animationDelay: delays[i], animationDuration: `${4 + i * 0.5}s` }}
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 min-w-[180px] shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${fj.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {fj.icon}
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold leading-tight">{fj.title}</p>
                      <p className="text-slate-400 text-xs">{fj.company}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <span className="text-brand-400 text-xs font-bold">{fj.salary}</span>
                    <span className="text-slate-500 text-xs"> / year</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA content */}
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/25 rounded-full px-4 py-1.5 mb-7">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-brand-300 text-sm font-medium">Join 500K+ professionals</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Ready to ignite your
            <span className="block bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
              career?
            </span>
          </h2>

          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Thousands of professionals found their dream job on HireNest last month.
            Your turn starts right here.
          </p>

          {/* Feature bullets */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-10">
            {['Free to sign up', 'No spam, ever', 'Apply in 60 seconds', 'Real jobs, verified companies'].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-emerald-500 text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 hover:scale-105 transition-all shadow-glow text-sm"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all text-sm"
            >
              <Search className="w-4 h-4" /> Browse Jobs
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {['bg-pink-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-purple-400'].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold`}>
                  {['A', 'B', 'C', 'D', 'E'][i]}
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-400">
              <span className="text-white font-bold">2,400+</span> people joined this week
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────── LOCATION STRIP ─────────────────────── */}
      <div className="bg-white border-t border-slate-100 py-6 overflow-hidden">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-2 px-4">
          <MapPin className="w-3.5 h-3.5" />
          <span className="font-medium">Hiring across top cities</span>
        </div>
        <div className="flex gap-3 px-4 flex-wrap">
          {['San Francisco', 'New York', 'Austin', 'Seattle', 'Boston', 'Chicago', 'Remote', 'London', 'Toronto', 'Berlin'].map(city => (
            <button
              key={city}
              onClick={() => navigate(`/jobs?location=${encodeURIComponent(city)}`)}
              className="text-xs text-slate-500 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 px-3 py-1.5 rounded-full transition-all font-medium"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
