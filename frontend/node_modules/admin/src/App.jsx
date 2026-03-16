import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Enquiries from './pages/Enquiries';
import Students from './pages/Students';
import Tutors from './pages/Tutors';
import PlanWizard from './pages/PlanWizard';
import Sessions from './pages/Sessions';
import Exams from './pages/Exams';
import LiveExam from './pages/LiveExam';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import StudentPortal from './pages/StudentPortal';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <SearchProvider>
      <BrowserRouter>
        <Routes>
          {/* Public: Login */}
          <Route element={<AuthLayout />}>
            <Route path="/login/student" element={<StudentLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/login" element={<Navigate to="/login/student" replace />} />
          </Route>

          {/* Student Portal (role=student) */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentPortal />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard (role=admin/manager/etc) */}
          <Route element={<ProtectedRoute requiredRole="admin"><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/tutors" element={<Tutors />} />
            <Route path="/students" element={<Students />} />
            <Route path="/plans/new" element={<PlanWizard />} />
            <Route path="/schedule" element={<Sessions />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/live/:id" element={<LiveExam />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Root: redirect based on role */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </SearchProvider>
  );
}

// Redirects to the right dashboard based on role
function RoleRedirect() {
  const stored = localStorage.getItem('user');
  if (!stored) return <Navigate to="/login/student" replace />;
  try {
    const user = JSON.parse(stored);
    if (user?.role?.toLowerCase() === 'student') return <Navigate to="/student" replace />;
    return <Navigate to="/dashboard" replace />;
  } catch {
    return <Navigate to="/login/student" replace />;
  }
}

export default App;
