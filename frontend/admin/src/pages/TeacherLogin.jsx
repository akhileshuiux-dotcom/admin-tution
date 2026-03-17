import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEyeOff, FiEye, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const TeacherLogin = () => {
    const navigate = useNavigate();
    const { signIn, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            if (user.role?.toLowerCase() === 'tutor') {
                navigate('/dashboard');
            } else if (user.role?.toLowerCase() === 'student') {
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
            const role = data.user?.role?.toLowerCase();
            if (role === 'tutor' || role === 'education manager' || role === 'admin') {
                navigate('/dashboard');
            } else {
                setError('Access denied. This login is for teachers only.');
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
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-[24px] font-bold text-white tracking-tight">EduWay</span>
                    </div>

                    <h2 className="login-heading">Teacher Login</h2>
                    <p className="login-subtitle">Access your educator dashboard</p>

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
                                placeholder="Teacher Email"
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
                            className="btn-login-v2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/30"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Teacher Access'}
                        </button>
                    </form>

                    <div className="signup-prompt">
                        <div className="flex flex-col gap-2 w-full mt-8">
                            <div className="flex justify-between items-center text-[0.85rem]">
                                <span className="text-[#6a6d7a]">Switch Portal:</span>
                                <div className="flex gap-4">
                                    <button onClick={() => navigate('/login/student')} className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">Student</button>
                                    <button onClick={() => navigate('/login/admin')} className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors">Admin</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-side-brand !bg-gradient-to-br !from-blue-900 !to-indigo-900">
                <div className="login-hero-image">
                    <img src="/auth_hero_v3.png" alt="Teacher Portal Hero" />
                </div>
                <div className="login-branding">
                    <h1 className="h1" style={{ color: 'white', marginBottom: '0.2rem', fontSize: '3.5rem', lineHeight: '1.2' }}>
                        Educator<br />Dashboard
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem' }}>
                        Empowering tutors with advanced tools
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TeacherLogin;
