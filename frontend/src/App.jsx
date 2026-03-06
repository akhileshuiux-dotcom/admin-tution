import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Enquiries from './pages/Enquiries';
import Students from './pages/Students';
import Tutors from './pages/Tutors';
import PlanWizard from './pages/PlanWizard';
import Sessions from './pages/Sessions';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <SearchProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/tutors" element={<Tutors />} />
            <Route path="/students" element={<Students />} />
            <Route path="/plans/new" element={<PlanWizard />} />
            <Route path="/schedule" element={<Sessions />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SearchProvider>
  );
}

export default App;
