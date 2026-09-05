import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Briefcase, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMyApplications } from '../../features/applications/applicationsSlice';
import { EmptyState } from '../../components/common/EmptyState';
import { Spinner } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { statusBadgeColor, capitalize, timeAgo, cn } from '../../utils';

export const MyApplicationsPage = () => {
  const dispatch = useAppDispatch();
  const { myApplications, loading, pagination } = useAppSelector(s => s.applications);

  useEffect(() => { dispatch(fetchMyApplications({})); }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-1">My Applications</h1>
        <p className="text-slate-500">Track your job application status</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : myApplications.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No applications yet"
          description="Start applying to jobs and track your progress here."
          action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>}
        />
      ) : (
        <div className="space-y-4">
          {myApplications.map(app => (
            <div key={app.id} className="card p-5 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{app.job_title}</h3>
                    <p className="text-sm text-slate-500">{app.company}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      {app.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.location}</span>
                      )}
                      {app.job_type && (
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{capitalize(app.job_type)}</span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Applied {timeAgo(app.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={cn('badge capitalize', statusBadgeColor(app.status))}>{app.status}</span>
                  <Link to={`/jobs/${app.job_id}`} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 transition-colors">
                    View Job <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={p => dispatch(fetchMyApplications({ page: p }))}
            />
          )}
        </div>
      )}
    </div>
  );
};
