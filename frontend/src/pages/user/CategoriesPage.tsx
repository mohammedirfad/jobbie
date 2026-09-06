import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { Spinner } from '../../components/common/Loader';

// Lucide icon names + gradient pairs per category slug
const CATEGORY_META: Record<string, { gradient: string; bg: string; text: string; symbol: string }> = {
  'technology':      { gradient: 'from-blue-500 to-cyan-400',    bg: 'bg-blue-50',   text: 'text-blue-600',   symbol: '⌨️' },
  'design':          { gradient: 'from-pink-500 to-rose-400',    bg: 'bg-pink-50',   text: 'text-pink-600',   symbol: '🎨' },
  'marketing':       { gradient: 'from-orange-500 to-amber-400', bg: 'bg-orange-50', text: 'text-orange-600', symbol: '📢' },
  'finance':         { gradient: 'from-emerald-500 to-green-400',bg: 'bg-emerald-50',text: 'text-emerald-600',symbol: '💹' },
  'healthcare':      { gradient: 'from-red-500 to-pink-400',     bg: 'bg-red-50',    text: 'text-red-600',    symbol: '⚕️' },
  'education':       { gradient: 'from-violet-500 to-purple-400',bg: 'bg-violet-50', text: 'text-violet-600', symbol: '📖' },
  'sales':           { gradient: 'from-sky-500 to-blue-400',     bg: 'bg-sky-50',    text: 'text-sky-600',    symbol: '📊' },
  'operations':      { gradient: 'from-slate-600 to-slate-400',  bg: 'bg-slate-100', text: 'text-slate-600',  symbol: '⚙️' },
  'legal':           { gradient: 'from-amber-600 to-yellow-400', bg: 'bg-amber-50',  text: 'text-amber-700',  symbol: '⚖️' },
  'human-resources': { gradient: 'from-teal-500 to-emerald-400', bg: 'bg-teal-50',   text: 'text-teal-600',   symbol: '🤝' },
};

const DEFAULT_META = { gradient: 'from-brand-500 to-emerald-400', bg: 'bg-brand-50', text: 'text-brand-600', symbol: '💼' };

export const CategoriesPage = () => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { categories, loading } = useAppSelector(s => s.categories);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  const handleCategoryClick = (slug: string) => {
    // Navigate to jobs page with category filter pre-applied
    navigate(`/jobs?category=${slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-sm text-brand-300 font-medium">10 industry categories</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Find Jobs by <span className="bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">Category</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Explore opportunities in the field that matches your passion and expertise.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {categories.map((cat) => {
                const meta = CATEGORY_META[cat.slug] ?? DEFAULT_META;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 p-6 text-left w-full"
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl" role="img" aria-label={cat.name}>
                          {meta.symbol}
                        </span>
                      </div>
                      <div className={`${meta.bg} ${meta.text} text-xs font-bold px-2.5 py-1 rounded-full`}>
                        {cat.job_count ?? 0} jobs
                      </div>
                    </div>

                    {/* Text */}
                    <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-brand-700 transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {cat.description}
                      </p>
                    )}

                    {/* CTA row */}
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${meta.text} mt-auto`}>
                      Browse {cat.name} jobs
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white border border-slate-200 rounded-2xl px-8 py-6 shadow-card">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6 text-brand-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-bold text-slate-900">Can't find your category?</p>
                  <p className="text-sm text-slate-500">Search across all jobs by title, skill, or company</p>
                </div>
                <button
                  onClick={() => navigate('/jobs')}
                  className="btn-primary flex-shrink-0"
                >
                  Browse All Jobs
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
