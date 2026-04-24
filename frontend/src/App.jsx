import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from './api';
import Background from './components/Background';
import ErrorBoundary from './components/ErrorBoundary';
import loginBgImage from './login_bg.jpg';

// Essential Theme Imports
import PrimaryTheme from './themes/PrimaryTheme';
import SecondaryTheme from './themes/SecondaryTheme';

// Essential UI Components
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';

// Lazy Loaded Views to prevent bundle-wide crashes
const ScheduleView = lazy(() => import('./components/views/ScheduleView'));

const TestsView = lazy(() => import('./components/views/TestsView'));
const ReportsView = lazy(() => import('./components/views/ReportsView'));
const ChatView = lazy(() => import('./components/views/ChatView'));
const NotesView = lazy(() => import('./components/views/NotesView'));
const StudentAttendanceView = lazy(() => import('./components/views/StudentAttendanceView'));
const StudentPapersView = lazy(() => import('./components/views/StudentPapersView'));
const StudentGamesView = lazy(() => import('./components/views/StudentGamesView'));
const StudentNoticesView = lazy(() => import('./components/views/StudentNoticesView'));
const StudentProfileView = lazy(() => import('./components/views/StudentProfileView'));
const StudentSettingsView = lazy(() => import('./components/views/StudentSettingsView'));
const StudentAcademicRecordsView = lazy(() => import('./components/views/StudentAcademicRecordsView'));
const StudentHelpSupportView = lazy(() => import('./components/views/StudentHelpSupportView'));



function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('Dashboard');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [loginRole, setLoginRole] = useState('student');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);

  // Forced Password Change State
  const [showForcedChange, setShowForcedChange] = useState(false);
  const [forcedForm, setForcedForm] = useState({ new_password: '', confirm_password: '' });
  const [forcedError, setForcedError] = useState('');
  const [isChangingForced, setIsChangingForced] = useState(false);
  const [showForcedPass, setShowForcedPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.needs_password_change && user?.role === 'teacher') {
      setShowForcedChange(true);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const resp = await api.get('/profile/');
      if (resp.data) {
        setUser(resp.data);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.log("No valid session");
      // Get fresh CSRF token if we don't have a session
      try { await api.get('/csrf/'); } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier) return;
    setIsSubmittingForgot(true);
    setForgotMsg({ type: '', text: '' });
    try {
      const resp = await api.post('/forgot-password/', { identifier: forgotIdentifier });
      setForgotMsg({ type: 'success', text: resp.data.message });
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.response?.data?.error || 'Failed to submit request' });
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const handleForcedChange = async (e) => {
    e.preventDefault();
    if (forcedForm.new_password !== forcedForm.confirm_password) {
      setForcedError("Passwords do not match");
      return;
    }
    
    // Simple strength check
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!strongRegex.test(forcedForm.new_password)) {
      setForcedError("Password must be 8+ chars with upper, lower, number & special char.");
      return;
    }

    setIsChangingForced(true);
    setForcedError('');
    try {
      await api.post('/profile/', {
        action: 'change_password',
        old_password: creds.password, // We use the password they just logged in with
        new_password: forcedForm.new_password
      });
      setShowForcedChange(false);
      // Update user state locally to reflect change
      setUser({...user, needs_password_change: false});
    } catch (err) {
      setForcedError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsChangingForced(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await api.post('/login/', {
        username: creds.username,
        password: creds.password,
        role: loginRole
      });
      if (resp.data) {
        console.log("Login Success, Payload:", resp.data);
        await checkAuth();
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Authentication Failed');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await api.post('/logout/'); } catch (e) {}
    // Refresh CSRF after logout for next login
    try { await api.get('/csrf/'); } catch (e) {}
    setUser(null);
    setIsAuthenticated(false);
    setActiveView('Dashboard');
  };

  const onNavigate = (view) => {
    setActiveView(view);
    setIsFocusMode(false);
  };

  const renderContent = () => {
    if (!user) return null;
    
    // Core Dashboards (Standalone)
    if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />;
    if (user.role === 'teacher') return <TeacherDashboard user={user} onLogout={handleLogout} />;

    // Student Views (Themed)
    const viewProps = { user };
    let content;
    switch (activeView) {
      case 'Dashboard': content = <StudentDashboard user={user} onLogout={handleLogout} onNavigate={onNavigate} />; break;
      case 'Schedule': content = <ScheduleView {...viewProps} />; break;

      case 'Tests': content = <TestsView user={user} onFocusMode={setIsFocusMode} />; break;
      case 'Reports': content = <ReportsView {...viewProps} />; break;
      case 'Chat': content = <ChatView {...viewProps} />; break;
      case 'Notes': content = <NotesView {...viewProps} />; break;
      case 'PastPapers': content = <StudentPapersView {...viewProps} />; break;
      case 'Attendance': content = <StudentAttendanceView {...viewProps} />; break;
      case 'Games': content = <StudentGamesView {...viewProps} />; break;
      case 'Notices': content = <StudentNoticesView {...viewProps} />; break;
      
      case 'Profile': content = <StudentProfileView {...viewProps} />; break;
      case 'Settings': content = <StudentSettingsView {...viewProps} />; break;
      case 'AcademicRecords': content = <StudentAcademicRecordsView {...viewProps} />; break;
      case 'HelpSupport': content = <StudentHelpSupportView {...viewProps} />; break;
      
      default: content = <StudentDashboard user={user} onLogout={handleLogout} />; break;

    }
    return renderTheme(content);
  };

  const renderTheme = (content) => {
    const ViewWrapper = (
      <ErrorBoundary>
        <Suspense fallback={<div className="p-20 text-center text-slate-400 font-bold animate-pulse">Initializing Module...</div>}>
          {content}
        </Suspense>
      </ErrorBoundary>
    );

    if (user?.grade && parseInt(user.grade) <= 5) {
      return <PrimaryTheme user={user} onLogout={handleLogout} onNavigate={onNavigate} currentView={activeView}>{ViewWrapper}</PrimaryTheme>;
    }
    return <SecondaryTheme user={user} onLogout={handleLogout} onNavigate={onNavigate} currentView={activeView} isFocusMode={isFocusMode}>{ViewWrapper}</SecondaryTheme>;
  };

  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500 animate-bounce shadow-xl shadow-cyan-500/20"></div>
          <p className="text-cyan-500 font-black tracking-widest text-xs uppercase animate-pulse">Syncing Neural Net...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#020617] selection:bg-cyan-500/30">
      <Background />
      
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div key="login" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} style={{ backgroundImage: `url(${loginBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#020617' }} className="flex items-center justify-center min-h-screen p-6 relative">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-0"></div>
              <div className="bg-slate-900/40 backdrop-blur-2xl p-12 rounded-[3rem] w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/5 relative z-10">
                <div className="flex flex-col items-center gap-6 mb-12">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                    <span className="text-4xl font-black text-white italic">A</span>
                  </div>
                  <div className="text-center">
                    <h1 className="text-4xl font-black tracking-tighter text-white">EDUWAY PORTAL</h1>
                    <p className="text-cyan-500/60 font-black uppercase tracking-[0.3em] text-[10px] mt-2">Neural Academy access</p>
                  </div>
                </div>

                <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8 border border-white/5">
                  {['student', 'teacher', 'admin'].map((role) => (
                    <button key={role} onClick={() => setLoginRole(role)} className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${loginRole === role ? 'bg-cyan-500 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>
                      {role.toUpperCase()}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Identity Hash</label>
                    <input type="text" value={creds.username} onChange={e => setCreds({...creds, username: e.target.value})} className="w-full bg-white/90 border border-white/10 rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-500/50 transition-all font-medium" placeholder="ID or Email..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Access Key</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} className="w-full bg-white/90 border border-white/10 rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-500/50 transition-all font-medium pr-12" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {error && <p className="text-rose-500 text-[11px] text-center font-bold tracking-tight bg-rose-500/10 py-3 rounded-xl border border-rose-500/20">{error}</p>}

                  <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black py-5 rounded-2xl shadow-2xl shadow-cyan-500/20 transition-all mt-4 tracking-widest uppercase text-sm">
                    Initialize Session
                  </button>

                  {loginRole === 'teacher' && (
                    <div className="text-center">
                      <button 
                        type="button" 
                        onClick={() => { setShowForgotModal(true); setForgotMsg({type:'', text:''}); setForgotIdentifier(''); }}
                        className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest hover:text-cyan-400 transition-colors"
                      >
                        Trouble accessing account? Forgot Password
                      </button>
                    </div>
                  )}
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <p className="text-slate-600 text-[10px] font-black tracking-widest">
                    {loginRole === 'admin' ? "ID: admin@gmail.com | Key: Admin@123" : loginRole === 'teacher' ? "ID: teacher@gmail.com | Key: Teacher@123" : "ID: student@gmail.com | Key: Student@123"}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
               {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forgot Password Modal */}
        <AnimatePresence>
          {showForgotModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForgotModal(false)} className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md relative z-10 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                      <Lock size={20} />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">Manual Reset</h3>
                  </div>
                  <button onClick={() => setShowForgotModal(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {forgotMsg.text ? (
                  <div className={`p-6 rounded-2xl border ${forgotMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'} mb-6`}>
                    <p className="text-sm font-bold leading-relaxed">{forgotMsg.text}</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">Enter your Email, Employee ID, or Username. Admin will verify and provide a temporary access key.</p>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Identify Account</label>
                      <input 
                        type="text" 
                        required
                        value={forgotIdentifier}
                        onChange={e => setForgotIdentifier(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-all"
                        placeholder="Email or ID..." 
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmittingForgot}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50"
                    >
                      {isSubmittingForgot ? 'Transmitting...' : 'Submit Reset Request'}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Forced Password Change Overlay */}
        <AnimatePresence>
          {showForcedChange && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#020617]">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-lg shadow-2xl relative"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/20 border-4 border-slate-900">
                  <ShieldAlert size={36} className="text-white" />
                </div>
                
                <div className="text-center mb-10 pt-8">
                  <h2 className="text-3xl font-black text-white tracking-tighter">Action Required</h2>
                  <p className="text-slate-400 text-sm font-bold mt-2">Your current access key is temporary. Please establish a permanent secure password.</p>
                </div>

                <form onSubmit={handleForcedChange} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">New Secure Password</label>
                    <div className="relative">
                      <input 
                        type={showForcedPass ? "text" : "password"} 
                        value={forcedForm.new_password}
                        onChange={e => setForcedForm({...forcedForm, new_password: e.target.value})}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-amber-500/50 transition-all font-medium pr-12"
                        placeholder="••••••••" 
                      />
                      <button type="button" onClick={() => setShowForcedPass(!showForcedPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-500 transition-colors">
                        {showForcedPass ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Confirm New Password</label>
                    <input 
                      type="password"
                      value={forcedForm.confirm_password}
                      onChange={e => setForcedForm({...forcedForm, confirm_password: e.target.value})}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-amber-500/50 transition-all font-medium"
                      placeholder="••••••••" 
                    />
                  </div>

                  {forcedError && <p className="text-rose-500 text-[11px] text-center font-bold bg-rose-500/10 py-3 rounded-xl border border-rose-500/20">{forcedError}</p>}

                  <button 
                    type="submit" 
                    disabled={isChangingForced}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/10 transition-all disabled:opacity-50"
                  >
                    {isChangingForced ? 'Encrypting...' : 'Establish Secure Access'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
