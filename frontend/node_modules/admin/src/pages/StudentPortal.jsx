import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Background from '../student/components/Background';
import StudentDashboard from '../student/components/StudentDashboard';
import PrimaryTheme from '../student/themes/PrimaryTheme';
import SecondaryTheme from '../student/themes/SecondaryTheme';
import ScheduleView from '../student/views/ScheduleView';
import TasksView from '../student/views/TasksView';
import TestsView from '../student/views/TestsView';
import ReportsView from '../student/views/ReportsView';
import ChatView from '../student/views/ChatView';
import NotesView from '../student/views/NotesView';

const STUDENT_API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/admin/', '/student/')
  : 'http://localhost:8000/api/student/';

const StudentPortal = () => {
  const { user: authUser, signOut } = useAuth();
  const navigate = useNavigate();

  const [studentProfile, setStudentProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activeView, setActiveView] = useState('Dashboard');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the student's extended profile from the student API using the stored token
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await axios.get(`${STUDENT_API}profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setStudentProfile(resp.data);
        fetchCourses(token);
      } catch (err) {
        console.error('Failed to load student profile:', err);
        // Fall back to auth user info if student profile endpoint fails
        setStudentProfile({
          first_name: authUser?.name?.split(' ')[0] || authUser?.username || 'Student',
          last_name: authUser?.name?.split(' ').slice(1).join(' ') || '',
          email: authUser?.email || '',
          grade: '9',
          points: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const fetchCourses = async (token) => {
    try {
      const resp = await axios.get(`${STUDENT_API}courses/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setCourses(resp.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const onNavigate = (view) => setActiveView(view);

  const isPrimary = (grade) => {
    const g = parseInt(grade);
    return !isNaN(g) && g <= 5;
  };

  const renderTheme = (content) => {
    if (!studentProfile) return content;
    if (isPrimary(studentProfile.grade)) {
      return (
        <PrimaryTheme user={studentProfile} onLogout={handleLogout} onNavigate={onNavigate} currentView={activeView}>
          {content}
        </PrimaryTheme>
      );
    }
    return (
      <SecondaryTheme user={studentProfile} onLogout={handleLogout} onNavigate={onNavigate} currentView={activeView} isFocusMode={isFocusMode}>
        {content}
      </SecondaryTheme>
    );
  };

  const renderContent = () => {
    if (!studentProfile) return null;

    switch (activeView) {
      case 'Dashboard':
        return <StudentDashboard user={studentProfile} onLogout={handleLogout} />;
      case 'Schedule':
        return <ScheduleView user={studentProfile} />;
      case 'Tasks':
        return <TasksView user={studentProfile} />;
      case 'Tests':
        return <TestsView user={studentProfile} onFocusMode={setIsFocusMode} />;
      case 'Reports':
        return <ReportsView user={studentProfile} />;
      case 'Chat':
        return <ChatView user={studentProfile} />;
      case 'Notes':
        return <NotesView user={studentProfile} />;
      case 'Profile':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-3xl font-bold mb-6 text-slate-900">Profile Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-medium">Name</span>
                <span className="font-bold text-slate-900">{studentProfile.first_name} {studentProfile.last_name}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-medium">Email</span>
                <span className="font-bold text-slate-900">{studentProfile.email}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-medium">Grade Level</span>
                <span className="text-cyan-600 font-bold">{studentProfile.grade}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-medium">Points</span>
                <span className="text-violet-600 font-bold">{studentProfile.points ?? 0}</span>
              </div>
            </div>
          </motion.div>
        );
      default:
        return <StudentDashboard user={studentProfile} courses={courses} onLogout={handleLogout} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Background />
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key="student-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {renderTheme(renderContent())}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StudentPortal;
