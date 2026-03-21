import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api';
import Background from './components/Background';
import ErrorBoundary from './components/ErrorBoundary';

// Essential Theme Imports
import PrimaryTheme from './themes/PrimaryTheme';
import SecondaryTheme from './themes/SecondaryTheme';

// Essential UI Components
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';

// Lazy Loaded Views to prevent bundle-wide crashes
const ScheduleView = lazy(() => import('./components/views/ScheduleView'));
const TasksView = lazy(() => import('./components/views/TasksView'));
const TestsView = lazy(() => import('./components/views/TestsView'));
const ReportsView = lazy(() => import('./components/views/ReportsView'));
const ChatView = lazy(() => import('./components/views/ChatView'));
const NotesView = lazy(() => import('./components/views/NotesView'));
const StudentAttendanceView = lazy(() => import('./components/views/StudentAttendanceView'));

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('Dashboard');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [loginRole, setLoginRole] = useState('student');
  const [error, setError] = useState('');

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
    
    // Core Dashboards
    if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />;
    if (user.role === 'teacher') return <TeacherDashboard user={user} onLogout={handleLogout} />;

    // Dynamic Views
    const viewProps = { user };
    switch (activeView) {
      case 'Dashboard': return <StudentDashboard user={user} onLogout={handleLogout} />;
      case 'Schedule': return <ScheduleView {...viewProps} />;
      case 'Tasks': return <TasksView {...viewProps} />;
      case 'Tests': return <TestsView user={user} onFocusMode={setIsFocusMode} />;
      case 'Reports': return <ReportsView {...viewProps} />;
      case 'Chat': return <ChatView {...viewProps} />;
      case 'Notes': return <NotesView {...viewProps} />;
      case 'Attendance': return <StudentAttendanceView {...viewProps} />;
      default: return <StudentDashboard user={user} onLogout={handleLogout} />;
    }
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
            <motion.div key="login" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="flex items-center justify-center min-h-screen p-6">
              <div className="bg-slate-900/40 backdrop-blur-2xl p-12 rounded-[3rem] w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/5">
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
                    <input type="password" value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} className="w-full bg-white/90 border border-white/10 rounded-2xl px-6 py-4 text-slate-900 placeholder-slate-400 outline-none focus:border-cyan-500/50 transition-all font-medium" placeholder="••••••••" />
                  </div>
                  
                  {error && <p className="text-rose-500 text-[11px] text-center font-bold tracking-tight bg-rose-500/10 py-3 rounded-xl border border-rose-500/20">{error}</p>}

                  <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black py-5 rounded-2xl shadow-2xl shadow-cyan-500/20 transition-all mt-4 tracking-widest uppercase text-sm">
                    Initalize Session
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <p className="text-slate-600 text-[10px] font-black tracking-widest uppercase">
                    {loginRole === 'admin' ? "ID: admin@gmail.com | Key: Admin@123" : loginRole === 'teacher' ? "ID: teacher@gmail.com | Key: Teacher@123" : "ID: student@gmail.com | Key: Student@123"}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
               {renderTheme(renderContent())}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
