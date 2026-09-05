import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, FileText, TrendingUp, ArrowUpRight, Clock,
  CheckCircle, AlertCircle, Star, Building2,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { useState } from 'react';
import { DashboardStats } from '../../types';
import { Spinner } from '../../components/common/Loader';
import { cn, statusBadgeColor, capitalize, timeAgo } from '../../utils';

const StatCard = ({ title, value, icon, color, trend, linkTo }: {
  title: string; value: number | string; icon: React.ReactNode;
  color: string; trend?: string; linkTo?: string;
}) => (
  <Link to={linkTo || '#'} className="card p-5 block group hover:-translate-y-0.5 transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
        {icon}
      </div>
      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
    </div>
    <p className="text-2xl font-black text-slate-900 mb-0.5">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    <p className="text-sm text-slate-500">{title}</p>
    {trend && <p className="text-xs text-brand-600 mt-1 font-medium">{trend}</p>}
  </Link>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(res => setStats(res.data.data!))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  );

  if (!stats) return null;

  const { overview, recentApplications, applicationsByStatus, jobsByCategory, recentJobs, topJobs, monthlyApplications } = stats;

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Jobs" value={overview.totalJobs} linkTo="/admin/jobs"
          icon={<Briefcase className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50" trend={`${overview.activeJobs} active`} />
        <StatCard title="Active Jobs" value={overview.activeJobs} linkTo="/admin/jobs"
          icon={<TrendingUp className="w-5 h-5 text-brand-600" />}
          color="bg-brand-50" />
        <StatCard title="Job Seekers" value={overview.totalUsers} linkTo="/admin/users"
          icon={<Users className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50" />
        <StatCard title="Applications" value={overview.totalApplications} linkTo="/admin/applications"
          icon={<FileText className="w-5 h-5 text-amber-600" />}
          color="bg-amber-50" />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly chart (simplified bar) */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-bold text-slate-900 mb-4">Applications (Last 6 Months)</h3>
          {monthlyApplications.length > 0 ? (
            <div className="flex items-end gap-2 h-32">
              {monthlyApplications.map((m, i) => {
                const max = Math.max(...monthlyApplications.map(x => parseInt(x.count)));
                const h = max ? (parseInt(m.count) / max) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500 font-medium">{m.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-emerald-400 transition-all duration-700"
                      style={{ height: `${Math.max(h, 4)}%` }}
                    />
                    <span className="text-xs text-slate-400 whitespace-nowrap">{m.month.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          )}
        </div>

        {/* Applications by status */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-4">By Status</h3>
          <div className="space-y-3">
            {applicationsByStatus.map(s => (
              <div key={s.status} className="flex items-center justify-between">
                <span className={cn('badge capitalize', statusBadgeColor(s.status))}>{s.status}</span>
                <span className="font-semibold text-slate-900 text-sm">{parseInt(s.count).toLocaleString()}</span>
              </div>
            ))}
            {applicationsByStatus.length === 0 && (
              <p className="text-slate-400 text-sm">No applications yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Applications */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Recent Applications</h3>
            <Link to="/admin/applications" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentApplications.map(app => (
              <div key={app.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {app.applicant_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{app.applicant_name}</p>
                  <p className="text-xs text-slate-500 truncate">{app.job_title} · {app.company}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn('badge capitalize text-xs', statusBadgeColor(app.status))}>{app.status}</span>
                  <span className="text-xs text-slate-400">{timeAgo(app.created_at)}</span>
                </div>
              </div>
            ))}
            {recentApplications.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No applications yet</p>}
          </div>
        </div>

        {/* Top Jobs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Top Jobs by Applications</h3>
            <Link to="/admin/jobs" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {topJobs.map((job, i) => (
              <div key={job.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-xs font-black text-brand-600 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
                  <p className="text-xs text-slate-500 truncate">{job.company} · {job.location}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                  <FileText className="w-3 h-3 text-brand-500" />
                  {job.application_count}
                </span>
              </div>
            ))}
            {topJobs.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No data yet</p>}
          </div>
        </div>
      </div>

      {/* Jobs by category */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Jobs by Category</h3>
          <Link to="/admin/categories" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Manage</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {jobsByCategory.map(cat => (
            <div key={cat.name} className="text-center p-3 bg-slate-50 rounded-xl hover:bg-brand-50 transition-colors">
              <div className="text-2xl mb-1">{cat.icon}</div>
              <p className="text-xs font-medium text-slate-700 truncate">{cat.name}</p>
              <p className="text-lg font-black text-brand-600">{cat.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
