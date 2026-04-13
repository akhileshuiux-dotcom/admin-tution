import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, GraduationCap, MessageSquare,
  LayoutDashboard, Users, BookOpen, ClipboardList, CalendarDays, UserCircle, UsersRound, Video
} from 'lucide-react';
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
    background: '#f1f5f9',
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
    background: active ? '#f0fdf4' : 'transparent',
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
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 12px', borderRadius: 10,
    border: 'none',
    background: '#fef2f2',
    color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer',
    transition: 'all 0.13s', width: '100%',
  },
  main: { flex: 1, overflow: 'auto', padding: '32px 36px' },
};

const StatCard = ({ label, value, color, bg }) => (
  <div style={{ background: bg || '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '18px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
    <p style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{label}</p>
    <p style={{ color, fontSize: 24, fontWeight: 900, margin: 0 }}>{value}</p>
  </div>
);

const QuickLink = ({ icon: Icon, label, desc, grad, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
    background: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: 16, cursor: 'pointer', textAlign: 'left', color: 'inherit', width: '100%',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s',
  }}>
    <span style={{ width: 44, height: 44, borderRadius: 12, background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
      <Icon size={20} color="#fff" />
    </span>
    <span>
      <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 14, margin: 0 }}>{label}</p>
      <p style={{ color: '#94a3b8', fontSize: 12, margin: '2px 0 0' }}>{desc}</p>
    </span>
  </button>
);

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const displayName = user?.user?.first_name
    ? `${user.user.first_name} ${user.user.last_name || ''}`.trim()
    : user?.user?.username || 'Teacher';

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
              <p style={{ color: '#1e293b', fontWeight: 600, fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Welcome banner */}
                <div style={{ background: 'linear-gradient(130deg,#ecfdf5 0%,#f0fdf4 100%)', border: '1px solid #bbf7d0', borderRadius: 20, padding: '28px 32px' }}>
                  <p style={{ color: '#059669', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 6px' }}>Welcome back</p>
                  <h1 style={{ color: '#1e293b', fontSize: 28, fontWeight: 900, margin: '0 0 4px' }}>Prof. {displayName}</h1>
                  <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 6px' }}>{user?.specialization || 'General'} Department</p>
                  <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  <StatCard label="Today" value={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} color="#1e293b" />
                  <StatCard label="Your Role" value="Teacher" color="#059669" bg="#f0fdf4" />
                  <StatCard label="Employee ID" value={user?.employee_id || '—'} color="#6366f1" bg="#f5f3ff" />
                </div>

                {/* Quick links */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                  <QuickLink onClick={() => setActiveTab('students')}   icon={UsersRound}   label="Student List"     desc="View and search all students."     grad="linear-gradient(135deg,#6366f1,#8b5cf6)" />
                  <QuickLink onClick={() => setActiveTab('attendance')} icon={Users}         label="Mark Attendance" desc="Open today's digital register."      grad="linear-gradient(135deg,#059669,#0d9488)" />
                  <QuickLink onClick={() => setActiveTab('exams')}      icon={ClipboardList} label="Exams & Grades"  desc="Schedule exams and enter scores."   grad="linear-gradient(135deg,#f59e0b,#f97316)" />
                  <QuickLink onClick={() => setActiveTab('meetings')}   icon={CalendarDays}  label="Staff Meetings"  desc="View upcoming admin meetings."      grad="linear-gradient(135deg,#0ea5e9,#6366f1)" />
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
