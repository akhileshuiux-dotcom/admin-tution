import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main)' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%' }} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role-based access control
    if (requiredRole) {
        const userRole = user.role?.toLowerCase();
        
        if (requiredRole === 'student' && userRole !== 'student') {
            return <Navigate to="/dashboard" replace />;
        }
        
        if (requiredRole === 'admin' && userRole === 'student') {
            return <Navigate to="/student" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
