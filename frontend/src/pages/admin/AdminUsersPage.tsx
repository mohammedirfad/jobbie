import { useEffect, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { User } from '../../types';
import { Pagination } from '../../components/common/Pagination';
import { TableRowSkeleton } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { cn, getInitials, formatDate } from '../../utils';
import { useDebounce } from '../../hooks/useDebounce';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setLoading(true);
    dashboardApi.getUsers({ search: debouncedSearch || undefined, role: roleFilter || undefined, page, limit })
      .then(res => {
        setUsers(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch, roleFilter, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500">{total} registered users</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email…" className="input-field pl-10" />
          </div>
          <div className="relative">
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              className="input-field pr-8 appearance-none cursor-pointer min-w-[130px]">
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['User', 'Role', 'Phone', 'Applications', 'Joined', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : users.length === 0
                  ? <tr><td colSpan={6}><EmptyState icon={<Search className="w-6 h-6" />} title="No users found" /></td></tr>
                  : users.map(user => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('badge capitalize',
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{user.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 font-medium">
                        {(user as unknown as { application_count?: number }).application_count ?? 0}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{user.created_at ? formatDate(user.created_at) : '—'}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-green-100 text-green-700">Active</span>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {!loading && total > 0 && (
          <div className="px-4 border-t border-slate-100">
            <Pagination currentPage={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};
