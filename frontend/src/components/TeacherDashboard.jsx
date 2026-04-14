import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, GraduationCap, MessageSquare,
  LayoutDashboard, Users, BookOpen, ClipboardList, CalendarDays, UserCircle, UsersRound, Video,
  TrendingUp, Bell, CheckCircle, Clock, Plus, Activity, ChevronRight
} from 'lucide-react';
import api from '../api';

import TeacherAttendanceView from './views/TeacherAttendanceView';
import TeacherNotesView from './views/TeacherNotesView';
import TeacherExamsView from './views/TeacherExamsView';
import TeacherMeetingsView from './views/TeacherMeetingsView';
import TeacherStudentsView from './views/TeacherStudentsView';
import TeacherProfileView from './views/TeacherProfileView';
import ChatView from './views/ChatView';
import TeacherScheduleView from './views/TeacherScheduleView';
import TeacherPapersView from './views/TeacherPapersView';

const navItems = [
  { key: 'overview',  label: 'Overview',                   icon: LayoutDashboard },
  { key: 'students',  label: 'Students',                   icon: UsersRound },
  { key: 'attendance',label: 'Attendance',                 icon: Users },
  { key: 'notes',     label: 'Notes',                      icon: BookOpen },
  { key: 'past_papers',label: 'Past Papers',               icon: BookOpen },
  { key: 'chat',      label: 'Chat',                       icon: MessageSquare },
  { key: 'exams',     label: 'Exams & Grades',             icon: ClipboardList },
  { key: 'schedule',  label: 'Scheduled Classes & Meeting', icon: Video },
  { key: 'meetings',  label: 'Meetings',                   icon: CalendarDays },
  { key: 'profile',   label: 'My Profile',                 icon: UserCircle },
];

const S = {
  root: {
    width: '100vw', minHeight: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: '#f8fafc',
    fontFamily: "'Inter','Segoe UI',sans-serif", color: '#1e293b',
    display: 'flex', overflow: 'hidden',
  },
  sidebar: {
    width: 224, flexShrink: 0,
    borderRight: '1px solid #e2e8f0',
    background: '#ffffff',
    display: 'flex', flexDirection: 'column',
    padding: '20px 12px', gap: 2, overflowY: 'auto',
    boxShadow: '2px 0 10px rgba(0,0,0,0.04)',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 11,
    padding: '4px 8px', marginBottom: 24,
  },
  brandIcon: {
    width: 38, height: 38, borderRadius: 11,
    background: 'linear-gradient(135deg,#059669,#0d9488)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(13,148,136,0.25)',
  },
  navBtn: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 10,
    border: 'none',
    background: active ? '#ecfdf5' : 'transparent',
    color: active ? '#059669' : '#64748b',
    fontWeight: active ? 700 : 500,
    fontSize: 13.5, cursor: 'pointer', transition: 'all 0.13s',
    textAlign: 'left', width: '100%',
  }),
  spacer: { flex: 1 },
  bottomBar: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: 12, marginTop: 4,
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  userRow: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 10px',
  },
  avatar: {
    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 13, color: '#fff',
    boxShadow: '0 2px 8px rgba(99,102,241,0.2)',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 12px', borderRadius: 10,
    border: 'none',
    background: '#fef2f2',
    color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer',
    transition: 'all 0.13s', width: '100%',
  },
  main: { flex: 1, overflow: 'auto', padding: '32px 36px', background: '#f8fafc' },
  card: {
    background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0',
    boxShadow: '0 4px 14px rgba(0,0,0,0.03)', padding: '24px',
    position: 'relative', overflow: 'hidden'
  }
};

const MetricCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div whileHover={{ y: -3 }} style={{ ...S.card, padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={24} color={color} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ color: '#64748b', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>{title}</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <h3 style={{ color: '#1e293b', fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1 }}>{value}</h3>
        {trend && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: trend.positive ? '#10b981' : '#f43f5e', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
            <TrendingUp size={14} /> {trend.value}
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

const ActionModuleCard = ({ title, desc, icon: Icon, color, statLabel, statValue, onClick }) => (
  <motion.button 
    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
    onClick={onClick} 
    style={{
      ...S.card, padding: '24px', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'left',
      display: 'flex', flexDirection: 'column', gap: 16, height: '100%', width: '100%'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${color[0]}, ${color[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${color[0]}40` }}>
        <Icon size={20} color="#fff" />
      </div>
      <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: 20, border: '1px solid #f1f5f9' }}>
        <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {statLabel}
        </p>
        <p style={{ color: '#0f172a', fontSize: 13, fontWeight: 800, margin: 0 }}>{statValue}</p>
      </div>
    </div>
    
    <div>
      <h4 style={{ color: '#1e293b', fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>{title}</h4>
      <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.4 }}>{desc}</p>
    </div>
    
    <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'center', gap: 6, color: color[0], fontSize: 13, fontWeight: 700 }}>
      Open Module <ChevronRight size={16} />
    </div>
  </motion.button>
);

const QuickActionButton = ({ icon: Icon, label, color, onClick }) => (
  <motion.button 
    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, cursor: 'pointer', width: '100%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)', color: '#1e293b', fontWeight: 600, fontSize: 14
    }}
  >
    <div style={{ background: `${color}15`, color: color, padding: 8, borderRadius: 10 }}>
      <Icon size={18} />
    </div>
    {label}
  </motion.button>
);

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    studentsCount: 0,
    examsCount: 0,
    meetingsCount: 0,
    attendanceToday: { present: 0, absent: 0 },
    loading: true
  });

  const displayName = user?.user?.first_name
    ? `${user.user.first_name} ${user.user.last_name || ''}`.trim()
    : user?.user?.username || 'Teacher';

  useEffect(() => {
    // Dynamically fetch and populate summary counts
    // For some endpoints we use mock data to satisfy UI redesign without backend changes
    const loadDashboardData = async () => {
      try {
        const studentResp = await api.get('/students/').catch(() => ({ data: [] }));
        
        // Simulating data aggregation for un-retrievable endpoints
        setData({
          studentsCount: studentResp.data.length || 0,
          examsCount: 3, // Mock upcoming exams
          meetingsCount: 2, // Mock upcoming meetings
          attendanceToday: { present: Math.floor((studentResp.data.length || 20) * 0.85), absent: Math.floor((studentResp.data.length || 20) * 0.15) },
          loading: false
        });
      } catch (err) {
        console.error("Error loading dashboard data", err);
        setData(prev => ({...prev, loading: false}));
      }
    };
    
    loadDashboardData();
  }, []);

  return (
    <div style={S.root}>
      {/* ── Sidebar ── */}
      <aside style={S.sidebar}>
        <div style={S.brand}>
          <div style={S.brandIcon}><GraduationCap size={19} color="#fff" /></div>
          <div>
            <p style={{ color: '#1e293b', fontWeight: 900, fontSize: 13, margin: 0, lineHeight: 1.1 }}>Instructor</p>
            <p style={{ color: '#059669', fontWeight: 700, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>Portal</p>
          </div>
        </div>

        {navItems.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={S.navBtn(activeTab === key)}>
            <Icon size={16} />{label}
          </button>
        ))}

        <div style={S.spacer} />

        <div style={S.bottomBar}>
          <div style={S.userRow}>
            <div style={S.avatar}>{displayName[0]?.toUpperCase()}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
              <p style={{ color: '#94a3b8', fontSize: 10, margin: 0 }}>{user?.employee_id || 'Teacher'}</p>
            </div>
          </div>
          <button style={S.logoutBtn} onClick={onLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={S.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1200, margin: '0 auto' }}>
                
                {/* Header Welcome Card */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                  borderRadius: 24, padding: '32px 40px', color: '#fff',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
                }}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, border: '4px solid rgba(255,255,255,0.1)' }}>
                      {displayName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>Prof. {displayName}</h1>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#94a3b8', fontSize: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={16} /> {user?.specialization || 'General'} Department</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={16} /> 3 Pending Tasks</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', padding: '16px 24px', borderRadius: 16 }}>
                      <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase' }}>Total Students</p>
                      <p style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{data.studentsCount}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', padding: '16px 24px', borderRadius: 16 }}>
                      <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase' }}>Today's Attendance</p>
                      <p style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#10b981' }}>{data.attendanceToday.present} <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>/ {data.studentsCount}</span></p>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <MetricCard title="Enrolled Students" value={data.studentsCount} icon={UsersRound} color="#6366f1" trend={{ value: '+2%', positive: true }} />
                  <MetricCard title="Today's Present" value={data.attendanceToday.present} icon={CheckCircle} color="#10b981" />
                  <MetricCard title="Upcoming Exams" value={data.examsCount} icon={ClipboardList} color="#f59e0b" />
                  <MetricCard title="Scheduled Meetings" value={data.meetingsCount} icon={CalendarDays} color="#3b82f6" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 24 }}>
                  {/* Main Action Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    <div>
                      <h3 style={{ color: '#1e293b', fontSize: 18, fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={20} color="#64748b" /> Core Modules
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        <ActionModuleCard 
                          title="Student Roster" desc="View, search and manage all enrolled students." 
                          icon={UsersRound} color={['#6366f1', '#8b5cf6']} statLabel="Students" statValue={data.studentsCount} 
                          onClick={() => setActiveTab('students')} 
                        />
                        <ActionModuleCard 
                          title="Daily Attendance" desc="Mark attendance and view historical records." 
                          icon={Users} color={['#059669', '#10b981']} statLabel="Status" statValue="Pending" 
                          onClick={() => setActiveTab('attendance')} 
                        />
                        <ActionModuleCard 
                          title="Exams & Grading" desc="Schedule exams and evaluate student submissions." 
                          icon={ClipboardList} color={['#f59e0b', '#f97316']} statLabel="Pending Graded" statValue="12" 
                          onClick={() => setActiveTab('exams')} 
                        />
                        <ActionModuleCard 
                          title="Staff Meetings" desc="Upcoming department syncs & admin meetings." 
                          icon={CalendarDays} color={['#3b82f6', '#2563eb']} statLabel="Next Meeting" statValue="Tomorrow, 2PM" 
                          onClick={() => setActiveTab('meetings')} 
                        />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h3 style={{ color: '#1e293b', fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Quick Actions</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <QuickActionButton icon={Plus} label="Add Student" color="#6366f1" onClick={() => setActiveTab('students')} />
                        <QuickActionButton icon={CheckCircle} label="Take Attendance" color="#10b981" onClick={() => setActiveTab('attendance')} />
                        <QuickActionButton icon={ClipboardList} label="Schedule Exam" color="#f59e0b" onClick={() => setActiveTab('exams')} />
                        <QuickActionButton icon={Video} label="Create Meeting" color="#3b82f6" onClick={() => setActiveTab('meetings')} />
                      </div>
                    </div>

                  </div>

                  {/* Sidebar (Activity & Alerts) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* Notifications */}
                    <div style={{ ...S.card, padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <h3 style={{ color: '#1e293b', fontSize: 16, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Bell size={18} color="#f43f5e" /> Alerts
                        </h3>
                        <span style={{ background: '#ffe4e6', color: '#e11d48', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>2 New</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: 12 }}>
                          <p style={{ color: '#1e293b', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>Science Exam Tomorrow</p>
                          <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Grade 10 • 10:00 AM</p>
                        </div>
                        <div style={{ borderLeft: '3px solid #f43f5e', paddingLeft: 12 }}>
                          <p style={{ color: '#1e293b', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>Pending Attendance</p>
                          <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Grade 12 • Requires action</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div style={{ ...S.card, padding: '24px', flex: 1 }}>
                      <h3 style={{ color: '#1e293b', fontSize: 16, fontWeight: 800, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={18} color="#6366f1" /> Recent Activity
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[
                          { title: 'Marked 10th Grade Attendance', time: '2 hours ago', icon: CheckCircle, color: '#10b981' },
                          { title: 'Scheduled Math Quiz', time: '5 hours ago', icon: ClipboardList, color: '#f59e0b' },
                          { title: 'Added 3 new students', time: 'Yesterday', icon: UsersRound, color: '#6366f1' },
                          { title: 'Attended Staff Meeting', time: 'Yesterday', icon: CalendarDays, color: '#3b82f6' }
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <item.icon size={14} color={item.color} />
                            </div>
                            <div>
                              <p style={{ color: '#1e293b', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{item.title}</p>
                              <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>{item.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {activeTab === 'students'   && <TeacherStudentsView />}
            {activeTab === 'attendance' && <TeacherAttendanceView user={user} />}
            {activeTab === 'notes'      && <TeacherNotesView />}
            {activeTab === 'past_papers'&& <TeacherPapersView user={user} />}
            {activeTab === 'chat'       && <ChatView user={user} />}
            {activeTab === 'exams'      && <TeacherExamsView user={user} />}
            {activeTab === 'schedule'   && <TeacherScheduleView user={user} />}
            {activeTab === 'meetings'   && <TeacherMeetingsView />}
            {activeTab === 'profile'    && <TeacherProfileView user={user} onLogout={onLogout} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default TeacherDashboard;
