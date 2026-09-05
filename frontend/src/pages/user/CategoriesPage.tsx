import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import { Spinner } from '../../components/common/Loader';

export const CategoriesPage = () => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector(s => s.categories);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Browse by Category</h1>
        <p className="text-slate-500 text-lg">Find opportunities in your field of expertise</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/jobs?category=${cat.slug}`}
              className="card p-6 group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 mb-0.5">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{cat.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand-600">{cat.job_count ?? 0} jobs</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <div className="inline-flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-2xl px-6 py-4">
          <Search className="w-5 h-5 text-brand-600" />
          <span className="text-slate-700 font-medium">Can't find your category?</span>
          <Link to="/jobs" className="text-brand-600 font-semibold hover:underline">Browse all jobs →</Link>
        </div>
      </div>
    </div>
  );
};
