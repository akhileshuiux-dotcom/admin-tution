import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEyeOff, FiEye, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const StudentLogin = () => {
    const navigate = useNavigate();
    const { signIn, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            if (user.role?.toLowerCase() === 'student') {
                navigate('/student');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await signIn(email, password);
            if (data.user?.role?.toLowerCase() === 'student') {
                navigate('/student');
            } else {
                setError('This login is for students only. Please use the Admin Login.');
            }
        } catch (err) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-layout-wrapper">
            <div className="login-side-form">
                <div className="login-form-container">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-[#22c55e] rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-[24px] font-bold text-slate-800 tracking-tight">EduWay</span>
                    </div>
                    
                    <h2 className="login-heading">Student Login</h2>
                    <p className="login-subtitle">Access your personalized learning portal</p>

                    {error && (
                        <div style={{ backgroundColor: '#fff1f2', color: '#e11d48', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fda4af' }}>
                            <FiAlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group-v2">
                            <input
                                type="email"
                                className="form-input-v2"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Student Email"
                            />
                        </div>

                        <div className="form-group-v2 password-group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input-v2"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FiEye /> : <FiEyeOff />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn-login-v2 bg-[#0f172a] hover:bg-slate-800 shadow-xl shadow-slate-200"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Enter Dashboard'}
                        </button>
                    </form>

                    <div className="signup-prompt">
                        <span>Need the admin portal?</span>
                        <button onClick={() => navigate('/login/admin')} className="text-blue-600 font-bold ml-1">Admin Login</button>
                    </div>
                </div>
            </div>

            <div className="login-side-brand !bg-gradient-to-br !from-[#22c55e] !to-emerald-600">
                <div className="login-hero-image">
                    <img src="/auth_hero_v3.png" alt="Student Portal Hero" />
                </div>
                <div className="login-branding">
                    <h1 className="h1" style={{ color: 'white', marginBottom: '0.2rem', fontSize: '3.5rem', lineHeight: '1.2', textShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                        Start Your<br />Learning Journey
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.05rem', fontWeight: '500' }}>
                        Education is the most powerful weapon
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
