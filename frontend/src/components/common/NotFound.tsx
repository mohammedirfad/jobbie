import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const NotFound = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md mx-auto animate-fade-in">
      {/* Big 404 */}
      <div className="relative mb-8">
        <div className="text-[10rem] font-black text-slate-100 leading-none select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center shadow-glow animate-float">
            <Search className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-3">Page not found</h1>
      <p className="text-slate-500 mb-8 leading-relaxed">
        Looks like this page took a career break. Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary">
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <button onClick={() => window.history.back()} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  </div>
);
