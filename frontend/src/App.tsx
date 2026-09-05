import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { ToastContainer } from './components/common/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { UserLayout } from './components/layout/UserLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { NotFound } from './components/common/NotFound';

// User pages
import { HomePage }           from './pages/user/HomePage';
import { LoginPage }          from './pages/user/LoginPage';
import { RegisterPage }       from './pages/user/RegisterPage';
import { JobListingPage }     from './pages/user/JobListingPage';
import { JobDetailPage }      from './pages/user/JobDetailPage';
import { MyApplicationsPage } from './pages/user/MyApplicationsPage';
import { CategoriesPage }     from './pages/user/CategoriesPage';

// Admin pages
import { AdminDashboard }       from './pages/admin/AdminDashboard';
import { AdminJobsPage }        from './pages/admin/AdminJobsPage';
import { AdminJobFormPage }     from './pages/admin/AdminJobFormPage';
import { AdminApplicationsPage} from './pages/admin/AdminApplicationsPage';
import { AdminUsersPage }       from './pages/admin/AdminUsersPage';
import { AdminCategoriesPage }  from './pages/admin/AdminCategoriesPage';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* ── Auth (no layout) ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── User portal ── */}
          <Route element={<UserLayout />}>
            <Route path="/"            element={<HomePage />} />
            <Route path="/jobs"        element={<JobListingPage />} />
            <Route path="/jobs/:id"    element={<JobDetailPage />} />
            <Route path="/categories"  element={<CategoriesPage />} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/my-applications" element={<MyApplicationsPage />} />
            </Route>
          </Route>

          {/* ── Admin portal ── */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard"    element={<AdminDashboard />} />
              <Route path="/admin/jobs"         element={<AdminJobsPage />} />
              <Route path="/admin/jobs/new"     element={<AdminJobFormPage />} />
              <Route path="/admin/jobs/:id/edit" element={<AdminJobFormPage />} />
              <Route path="/admin/applications" element={<AdminApplicationsPage />} />
              <Route path="/admin/users"        element={<AdminUsersPage />} />
              <Route path="/admin/categories"   element={<AdminCategoriesPage />} />
            </Route>
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
