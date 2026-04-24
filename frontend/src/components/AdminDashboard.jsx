import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, 
  CalendarDays, CreditCard, ShieldCheck, Award,
  Menu, X, ChevronRight, Bell, LogOut, ChevronDown
} from 'lucide-react';

// Import Views
import AdminOverviewView from './views/AdminOverviewView';
import AdminStudentsView from './views/AdminStudentsView';
import AdminTeachersView from './views/AdminTeachersView';
import AdminCoursesView from './views/AdminCoursesView';
import AdminMeetingsView from './views/AdminMeetingsView';
import AdminFinanceView from './views/AdminFinanceView';
import ResultsEntryView from './views/ResultsEntryView';
import AdminNoticesView from './views/AdminNoticesView';
import AdminTeacherAttendanceView from './views/AdminTeacherAttendanceView';
import AdminTeacherLeaveManagement from './views/AdminTeacherLeaveManagement';

// Import Profile Views
import AdminProfileView from './views/AdminProfileView';
import AdminAccountSettingsView from './views/AdminAccountSettingsView';
import AdminSecurityView from './views/AdminSecurityView';
import AdminNotificationsView from './views/AdminNotificationsView';
import AdminRolePermissionsView from './views/AdminRolePermissionsView';
import AdminActivityLogView from './views/AdminActivityLogView';
import AdminHelpSupportView from './views/AdminHelpSupportView';

// Import Common
import AdminProfileDropdown from './common/AdminProfileDropdown';
import LogoutConfirmationModal from './common/LogoutConfirmationModal';
import NotificationPanel from './common/NotificationPanel';


const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const profileRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'Overview', icon: LayoutDashboard, label: 'Overview', color: '#6366f1' },
    { id: 'Students', icon: Users, label: 'Students', color: '#8b5cf6' },
    { id: 'Teachers', icon: GraduationCap, label: 'Teachers', color: '#0ea5e9' },
    { id: 'Courses', icon: BookOpen, label: 'Curriculum', color: '#f59e0b' },
    { id: 'Meetings', icon: CalendarDays, label: 'Admin Meetings', color: '#ec4899' },
    { id: 'Finance', icon: CreditCard, label: 'Payment & Finance', color: '#10b981' },
    { id: 'Results', icon: Award, label: 'Exam Results', color: '#facc15' },
    { id: 'Notices', icon: Bell, label: 'Posts & Updates', color: '#f43f5e' },
    { id: 'TeacherAttendance', icon: CalendarDays, label: 'Teacher Attendance', color: '#0d9488' },
    { id: 'LeaveManagement', icon: CalendarDays, label: 'Leave Management', color: '#14b8a6' },
  ];


  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <AdminOverviewView user={user} setActiveTab={setActiveTab} />;
      case 'Students': return <AdminStudentsView />;
      case 'Teachers': return <AdminTeachersView />;
      case 'Courses':  return <AdminCoursesView />;
      case 'Meetings': return <AdminMeetingsView />;
      case 'Finance':  return <AdminFinanceView />;
      case 'Results':  return <ResultsEntryView user={user} />;
      case 'Notices':  return <AdminNoticesView />;
      case 'TeacherAttendance': return <AdminTeacherAttendanceView user={user} />;
      case 'LeaveManagement': return <AdminTeacherLeaveManagement />;
      
      // Profile Views
      case 'AdminProfile': return <AdminProfileView user={user} />;
      case 'AdminAccountSettings': return <AdminAccountSettingsView />;
      case 'AdminSecurity': return <AdminSecurityView />;
      case 'AdminNotifications': return <AdminNotificationsView />;
      case 'AdminRolePermissions': return <AdminRolePermissionsView />;
      case 'AdminActivityLog': return <AdminActivityLogView />;
      case 'AdminHelpSupport': return <AdminHelpSupportView />;

      default: return <AdminOverviewView user={user} setActiveTab={setActiveTab} />;
    }
  };

  const displayName = user?.user?.first_name 
    ? `${user.user.first_name} ${user.user.last_name || ''}`.trim() 
    : user?.user?.username || 'Administrator';

  const handleProfileNavigate = (view) => {
    setActiveTab(view);
    setShowProfile(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      <LogoutConfirmationModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={onLogout} 
      />

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        style={{
          background: '#fff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
          {isSidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#1e293b,#334155)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} color="#fff" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>EDUWAY</h1>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Control</p>
              </div>
            </div>
          ) : (
            <ShieldCheck size={24} color="#1e293b" />
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px',
                  borderRadius: 12,
                  border: 'none',
                  background: isActive ? '#f8fafc' : 'transparent',
                  color: isActive ? '#1e293b' : '#64748b',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: isActive ? item.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  <Icon size={18} color={isActive ? '#fff' : '#64748b'} />
                </div>
                {isSidebarOpen && <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>}
                {isActive && isSidebarOpen && (
                  <motion.div layoutId="pill" style={{ marginLeft: 'auto' }}>
                    <ChevronRight size={14} color="#cbd5e1" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px',
              borderRadius: 12,
              border: 'none',
              background: '#fff1f2',
              color: '#e11d48',
              cursor: 'pointer',
              width: '100%',
              fontWeight: 700,
              fontSize: 14,
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              boxShadow: '0 2px 8px rgba(225,29,72,0.05)'
            }}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top Navbar */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          borderBottom: '1px solid #e2e8f0'
        }}>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{ border: 'none', background: '#f1f5f9', p: 8, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}
          >
            {isSidebarOpen ? <X size={18} color="#64748b" /> : <Menu size={18} color="#64748b" />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }} ref={headerRef}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <button 
                onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, position: 'relative' }}
              >
                <Bell size={20} color={showNotifs ? '#6366f1' : '#64748b'} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 14, height: 14, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: '#fff' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifs && (
                  <NotificationPanel 
                    onClose={() => setShowNotifs(false)} 
                    onUnreadCountChange={setUnreadCount}
                  />
                )}
              </AnimatePresence>
            </div>
            <div style={{ height: 32, width: 1, background: '#e2e8f0' }}></div>
            
            {/* Profile Section */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  border: 'none', 
                  background: 'transparent', 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 12,
                  transition: 'all 0.2s'
                }}
                className={showProfile ? 'bg-slate-50' : 'hover:bg-slate-50'}
              >
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{displayName}</p>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Super Admin</p>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, position: 'relative' }}>
                  {displayName[0]?.toUpperCase()}
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }}></div>
                </div>
                <ChevronDown size={14} color="#94a3b8" style={{ transform: showProfile ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              <AnimatePresence>
                {showProfile && (
                  <AdminProfileDropdown 
                    user={user} 
                    onNavigate={handleProfileNavigate}
                    onLogout={() => {
                      setShowProfile(false);
                      setShowLogoutModal(true);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

