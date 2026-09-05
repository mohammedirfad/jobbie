import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, FileText, Tag, LogOut, Briefcase as Logo, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutThunk } from '../../features/auth/authSlice';
import { useToast } from '../common/Toast';
import { cn, getInitials } from '../../utils';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/admin/dashboard',    icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/admin/jobs',         icon: <Briefcase className="w-5 h-5" />,       label: 'Jobs' },
  { to: '/admin/applications', icon: <FileText className="w-5 h-5" />,        label: 'Applications' },
  { to: '/admin/users',        icon: <Users className="w-5 h-5" />,           label: 'Users' },
  { to: '/admin/categories',   icon: <Tag className="w-5 h-5" />,             label: 'Categories' },
];

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className={cn(
      'hidden lg:flex flex-col bg-dark-900 text-white transition-all duration-300 h-screen sticky top-0',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center border-b border-dark-700 px-4 h-16', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-emerald-400 flex items-center justify-center">
              <Logo className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg">Job<span className="text-brand-400">Spark</span></span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors">
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
              isActive
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-400 hover:bg-dark-700 hover:text-white',
              collapsed && 'justify-center'
            )}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-dark-700 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
