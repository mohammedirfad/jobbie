import { Outlet, Link, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Bell, Settings, Briefcase, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { getInitials } from '../../utils';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Tag } from 'lucide-react';
import { cn } from '../../utils';
import { useAppDispatch } from '../../app/hooks';
import { logoutThunk } from '../../features/auth/authSlice';
import { useToast } from '../common/Toast';
import { useNavigate } from 'react-router-dom';

const mobileNavItems = [
  { to: '/admin/dashboard',    icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/admin/jobs',         icon: <Briefcase className="w-5 h-5" />,       label: 'Jobs' },
  { to: '/admin/applications', icon: <FileText className="w-5 h-5" />,        label: 'Apps' },
  { to: '/admin/users',        icon: <Users className="w-5 h-5" />,           label: 'Users' },
  { to: '/admin/categories',   icon: <Tag className="w-5 h-5" />,             label: 'Categories' },
];

export const AdminLayout = () => {
  const { user } = useAppSelector(s => s.auth);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const pageTitle = location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900 capitalize">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="View Site">
              <Briefcase className="w-5 h-5" />
            </Link>
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(user.name)}
                </div>
                <span className="hidden sm:block text-sm font-medium text-slate-700">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex items-center border-t border-slate-200 bg-white">
          {mobileNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'text-brand-600' : 'text-slate-400'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};
