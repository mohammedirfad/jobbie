import { useEffect, useState } from 'react';
import { ChevronDown, Search, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAllApplications, updateApplicationStatusThunk } from '../../features/applications/applicationsSlice';
import { Pagination } from '../../components/common/Pagination';
import { TableRowSkeleton } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { cn, statusBadgeColor, capitalize, timeAgo, formatDate } from '../../utils';
import { Application } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

const STATUSES = ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'];

export const AdminApplicationsPage = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { allApplications: applications, loading, pagination } = useAppSelector(s => s.applications);

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    dispatch(fetchAllApplications({ status: statusFilter || undefined, page, limit: 15 }));
  }, [statusFilter, page, dispatch]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingStatus(true);
    try {
      await dispatch(updateApplicationStatusThunk({ id, status })).unwrap();
      toast.success('Status updated');
      if (selectedApp?.id === id) setSelectedApp(prev => prev ? { ...prev, status: status as Application['status'] } : null);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Applications</h2>
          <p className="text-sm text-slate-500">{pagination?.total ?? 0} total applications</p>
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field pr-8 appearance-none cursor-pointer min-w-[160px]">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Applicant', 'Job', 'Status', 'Applied', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                : applications.length === 0
                  ? <tr><td colSpan={5}><EmptyState icon={<Search className="w-6 h-6" />} title="No applications found" /></td></tr>
                  : applications.map(app => (
                    <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {app.applicant_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{app.applicant_name}</p>
                            <p className="text-xs text-slate-500">{app.applicant_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 max-w-[200px] truncate">{app.job_title}</p>
                        <p className="text-xs text-slate-500">{app.company}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            value={app.status}
                            onChange={e => handleStatusUpdate(app.id, e.target.value)}
                            disabled={updatingStatus}
                            className={cn(
                              'text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none appearance-none pr-6',
                              statusBadgeColor(app.status)
                            )}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
                          </select>
                          <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{timeAgo(app.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedApp(app)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {pagination && !loading && (
          <div className="px-4 border-t border-slate-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={p => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Application Details" size="lg">
        {selectedApp && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {selectedApp.applicant_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900">{selectedApp.applicant_name}</p>
                <p className="text-sm text-slate-500">{selectedApp.applicant_email}</p>
                {selectedApp.applicant_phone && <p className="text-sm text-slate-500">{selectedApp.applicant_phone}</p>}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Applied For</p>
              <p className="font-semibold text-slate-900">{selectedApp.job_title}</p>
              <p className="text-sm text-slate-500">{selectedApp.company}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Applied On</p>
              <p className="text-sm text-slate-700">{formatDate(selectedApp.created_at)}</p>
            </div>

            {selectedApp.cover_letter && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Cover Letter</p>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedApp.cover_letter}
                </div>
              </div>
            )}

            {selectedApp.resume_url && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Resume</p>
                <a href={selectedApp.resume_url} target="_blank" rel="noreferrer"
                  className="text-sm text-brand-600 hover:underline break-all">
                  {selectedApp.resume_url}
                </a>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(selectedApp.id, s)}
                    disabled={updatingStatus || selectedApp.status === s}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                      selectedApp.status === s
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
