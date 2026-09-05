import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Briefcase, ChevronDown, User, LogOut, LayoutDashboard, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutThunk } from '../../features/auth/authSlice';
import { useToast } from '../common/Toast';
import { cn, getInitials } from '../../utils';

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    toast.success('Logged out successfully');
    navigate('/');
    setDropdownOpen(false);
  };

  const navLinks = [
    { to: '/jobs', label: 'Find Jobs' },
    { to: '/categories', label: 'Categories' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 inset-x-0 z-40 transition-all duration-300',
      scrolled ? 'glass shadow-sm border-b border-slate-200/60' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">
              Job<span className="text-gradient">Spark</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                    {user.avatar_url
                      ? <img src={user.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                      : getInitials(user.name)
                    }
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-scale-in">
                      {user.role === 'admin' ? (
                        <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                          <LayoutDashboard className="w-4 h-4 text-brand-600" /> Admin Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link to="/profile" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                            <User className="w-4 h-4 text-slate-500" /> My Profile
                          </Link>
                          <Link to="/my-applications" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                            <FileText className="w-4 h-4 text-slate-500" /> My Applications
                          </Link>
                        </>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-slate-600">Sign In</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 animate-slide-down shadow-lg">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                'block px-4 py-2.5 rounded-xl text-sm font-medium',
                isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'
              )}>
              {l.label}
            </NavLink>
          ))}
          <div className="border-t border-slate-100 pt-3 mt-2 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="btn-secondary w-full text-center">
                    Admin Dashboard
                  </Link>
                )}
                <Link to="/my-applications" onClick={() => setOpen(false)} className="btn-ghost w-full">My Applications</Link>
                <button onClick={handleLogout} className="btn-danger w-full">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary w-full text-center">Sign In</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
