import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEyeOff, FiEye } from 'react-icons/fi';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="login-layout-wrapper">
            <div className="login-side-form">
                <div className="login-form-container">
                    <h2 className="login-heading">Login</h2>
                    <p className="login-subtitle">Enter your account details</p>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group-v2">
                            <input
                                type="text"
                                className="form-input-v2"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Username"
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
