import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEyeOff, FiEye, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { signIn, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signIn(email, password);
            navigate('/dashboard');
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
                    <h2 className="login-heading">Login</h2>
                    <p className="login-subtitle">Enter your account details</p>

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
                                placeholder="Email Address"
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

                        <div className="forgot-password">
                            <a href="#">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            className="btn-login-v2"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="signup-prompt">
                        <span>Don't have an account?</span>
                        <button className="btn-signup-outline">Sign up</button>
                    </div>
                </div>
            </div>

            <div className="login-side-brand">
                <div className="login-hero-image">
                    <img src="/auth_hero_v3.png" alt="Student Portal Hero" />
                </div>
                <div className="login-branding">
                    <h1 className="h1" style={{ color: 'white', marginBottom: '0.2rem', fontSize: '3.5rem', lineHeight: '1.2', textShadow: '0 4px 15px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.5)' }}>
                        Welcome to the<br />Tutor Dashboard
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.05rem', textShadow: '0 2px 6px rgba(0,0,0,0.5)', fontWeight: '500' }}>
                        Login to access your account
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
