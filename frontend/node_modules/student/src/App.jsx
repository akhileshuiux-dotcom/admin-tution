import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Background from './components/Background'
import StudentDashboard from './components/StudentDashboard'
import PrimaryTheme from './themes/PrimaryTheme'
import SecondaryTheme from './themes/SecondaryTheme'
import ScheduleView from './components/views/ScheduleView'
import TasksView from './components/views/TasksView'
import TestsView from './components/views/TestsView'
import ReportsView from './components/views/ReportsView'
import ChatView from './components/views/ChatView'
import NotesView from './components/views/NotesView'

const API_BASE = 'http://localhost:8000/api/student/'
axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null) // This stores the Student profile
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeView, setActiveView] = useState('Dashboard')
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [creds, setCreds] = useState({ email: '', password: '' })

  useEffect(() => {
    // Check if already logged in on mount
    checkAuth();
  }, [])

  const checkAuth = async () => {
    try {
      const resp = await axios.get(`${API_BASE}profile/`);
      setUser(resp.data);
      setIsAuthenticated(true);
      fetchCourses();
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const resp = await axios.get(`${API_BASE}courses/`);
      setCourses(resp.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await axios.post(`${API_BASE}login/`, creds)
      checkAuth();
    } catch (err) {
      setError('Invalid identity credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}logout/`)
      setIsAuthenticated(false)
      setUser(null)
      setCourses([])
      setActiveView('Dashboard')
    } catch (err) {
      console.error(err)
      setIsAuthenticated(false)
    }
  }

  const onNavigate = (view) => setActiveView(view);

  const isPrimary = (grade) => {
    const g = parseInt(grade);
    return !isNaN(g) && g <= 5;
  };

  const renderTheme = (content) => {
    if (!user) return content;
    if (isPrimary(user.grade)) {
      return <PrimaryTheme user={user} onLogout={handleLogout} onNavigate={onNavigate} currentView={activeView}>{content}</PrimaryTheme>;
    }
    return <SecondaryTheme user={user} onLogout={handleLogout} onNavigate={onNavigate} currentView={activeView} isFocusMode={isFocusMode}>{content}</SecondaryTheme>;
  };

  const renderContent = () => {
    if (!user) return null;
    
    switch (activeView) {
      case 'Dashboard':
        return <StudentDashboard user={user} onLogout={handleLogout} />
      case 'Schedule':
        return <ScheduleView user={user} />
      case 'Tasks':
        return <TasksView user={user} />
      case 'Tests':
        return <TestsView user={user} onFocusMode={setIsFocusMode} />
      case 'Reports':
        return <ReportsView user={user} />
      case 'Chat':
        return <ChatView user={user} />
      case 'Notes':
        return <NotesView user={user} />
      case 'Profile':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl glass p-10 rounded-[2.5rem]">
            <h2 className="text-3xl font-bold mb-6">Profile Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-slate-400">Identity</span>
                <span className="font-bold">{user.user?.username}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-slate-400">Grade Level</span>
                <span className="text-cyan-400 font-bold">{user.grade}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-slate-400">Aether Points</span>
                <span className="text-violet-400 font-bold">{user.points}</span>
              </div>
            </div>
          </motion.div>
        )
      default:
        return <StudentDashboard user={user} courses={courses} />
    }
  }

  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Background />
      
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -40 }}
              className="flex items-center justify-center min-h-screen p-6"
            >
              <div className="bg-white/90 backdrop-blur-xl p-12 rounded-[3.5rem] w-full max-w-lg shadow-[0_30px_70px_rgba(0,0,0,0.05)] border border-white/50 flex flex-col gap-10">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl">
                    <span className="text-4xl font-black text-white italic">A</span>
                  </div>
                  <div className="text-center">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900">EduWay Portal</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Neural Academy Access</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-8">
                  <div className="space-y-6">
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="student@example.com"
                        value={creds.email}
                        onChange={(e) => setCreds(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-slate-900 rounded-3xl px-8 py-5 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                      />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 mb-2 block">Access Key</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={creds.password}
                        onChange={(e) => setCreds(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-slate-900 rounded-3xl px-8 py-5 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="text-rose-500 text-xs text-center font-black bg-rose-50 py-4 rounded-2xl border border-rose-100"
                    >
                      {error}
                    </motion.p>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 rounded-3xl bg-slate-900 text-white font-black hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]"
                  >
                    {loading ? 'ESTABLISHING LINK...' : 'CONNECT TO CORE'}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Standard protocol Alpha-9. <span className="text-blue-500 hover:underline cursor-pointer">Beacon Support</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {renderTheme(renderContent())}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
