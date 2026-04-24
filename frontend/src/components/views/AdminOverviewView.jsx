import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, GraduationCap, BookOpen, CalendarDays, 
  TrendingUp, Clock, Activity, Bell, Plus, CheckCircle, 
  ClipboardList, Send, Server, UserPlus, FolderPlus,
  AlertTriangle, CreditCard, Award, ArrowRight
} from 'lucide-react';
import api from '../../api';

// Reusable Metric Card (Enhanced)
const StatCard = ({ icon: Icon, title, value, color, trend, subtitle, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}
    style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '24px', flex: 1, minWidth: 220, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}
  >
    {/* Decorative background circle */}
    <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${color}20, ${color}00)` }} />
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
      {trend && (
        <div style={{ background: trend.positive ? '#ecfdf5' : '#fff1f2', color: trend.positive ? '#10b981' : '#e11d48', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          {trend.positive ? <TrendingUp size={14} /> : <TrendingUp size={14} style={{ transform: 'scaleY(-1)' }} />}
          {trend.value}
        </div>
      )}
    </div>
    <h3 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: '#1e293b' }}>{value}</h3>
    <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color }} />
      {subtitle}
    </p>
  </motion.div>
);

// Lightweight CSS Chart Component for Analytics
const MiniChart = ({ data, color }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
      {data.map((val, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <motion.div 
            initial={{ height: 0 }} 
            animate={{ height: `${(val / max) * 100}%` }} 
            transition={{ duration: 0.8, delay: i * 0.1 }}
            style={{ width: '100%', background: `linear-gradient(to top, ${color}99, ${color})`, borderRadius: '4px 4px 0 0' }}
          />
        </div>
      ))}
    </div>
  );
};

const AdminOverviewView = ({ user, setActiveTab }) => {
  const [data, setData] = useState({ students: [], teachers: [], courses: [], meetings: [] });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t, c, m] = await Promise.all([
          api.get(`/students/`).catch(() => ({ data: [] })),
          api.get(`/teachers/`).catch(() => ({ data: [] })),
          api.get(`/courses/`).catch(() => ({ data: [] })),
          api.get(`/admin-meetings/`).catch(() => ({ data: [] })),
        ]);
        setData({
          students: s.data,
          teachers: t.data,
          courses: c.data,
          meetings: m.data
        });
      } catch (err) {
        console.error("Dashboard dataload error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const adminName = user?.user?.first_name 
    ? `${user.user.first_name} ${user.user.last_name || ''}`.trim() 
    : user?.user?.username || 'Administrator';

  // Mock data for charts
  const studentGrowthData = [40, 55, 45, 78, 65, 90, 85];
  const revenueData = [20, 35, 30, 50, 45, 70, 95];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Global Overview Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 24, padding: '32px 40px', color: '#fff', boxShadow: '0 10px 30px rgba(15,23,42,0.2)', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Global Overview</h1>
            <span style={{ background: '#3b82f640', color: '#60a5fa', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Systems Active</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} /> 
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
          
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 700 }}>Total Enrolled</p>
              <h4 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{data.students.length} <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>+4 this week</span></h4>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 700 }}>Monthly Revenue</p>
              <h4 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>$4,250 <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Est.</span></h4>
            </div>
          </div>
        </div>

        {/* Embedded Admin Profile (As Requested) */}
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ position: 'relative' }}>
                <Bell size={18} color="#94a3b8" />
                <span style={{ position: 'absolute', top: -3, right: -4, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, padding: '1px 4px', borderRadius: 10 }}>5</span>
              </span>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff' }}>{adminName}</p>
            </div>
            <span style={{ color: '#10b981', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Super Admin Role</span>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, border: '2px solid rgba(255,255,255,0.2)' }}>
            {adminName[0]?.toUpperCase()}
          </div>
        </div>
      </motion.div>

      {/* 2. Top Statistics Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <StatCard delay={0.0} icon={Users} title="Total Students" value={data.students.length} color="#8b5cf6" trend={{ positive: true, value: '+5%' }} subtitle="24 new this month" />
        <StatCard delay={0.1} icon={GraduationCap} title="Active Teachers" value={data.teachers.length} color="#0ea5e9" trend={{ positive: true, value: '+1' }} subtitle="All staff present today" />
        <StatCard delay={0.2} icon={BookOpen} title="Running Courses" value={data.courses.length} color="#f59e0b" trend={{ positive: true, value: '+2%' }} subtitle="1 pending approval" />
        <StatCard delay={0.3} icon={CalendarDays} title="Upcoming Meetings" value={data.meetings.length || 3} color="#ec4899" subtitle="Next: Tomorrow at 10 AM" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, gridAutoFlow: 'dense' }}>
        
        {/* Left Column: Analytics & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* 3. Advanced Analytics */}
          <div style={{ background: '#fff', borderRadius: 24, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={20} color="#6366f1" /> Growth Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <p style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Student Registrations (7 Days)</p>
                <MiniChart data={studentGrowthData} color="#8b5cf6" />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 10, marginTop: 8 }}><span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span></div>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Fee Collection Status</p>
                <MiniChart data={revenueData} color="#10b981" />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 10, marginTop: 8 }}><span>W1</span><span>W2</span><span>W3</span><span>W4</span></div>
              </div>
            </div>
          </div>

          {/* 4. Enhanced System Activity */}
          <div style={{ background: '#fff', borderRadius: 24, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={20} color="#0ea5e9" /> System Log</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: 20 }}>
                <Server size={12} /> Live Sync
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: CheckCircle, label: 'Exam Results Published', sub: 'Grade 10 Mathematics results are live.', color: '#10b981', time: '10 mins ago' },
                { icon: UserPlus, label: 'New Teacher Onboarded', sub: 'Dr. Smith (Physics) account created.', color: '#6366f1', time: '1 hour ago' },
                { icon: FolderPlus, label: 'System Backup Complete', sub: 'Database snapshot safely stored.', color: '#f59e0b', time: '3 hours ago' },
                { icon: ClipboardList, label: 'Attendance Finalized', sub: 'Today\'s global attendance marked.', color: '#ec4899', time: 'Yesterday' }
              ].map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${log.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <log.icon size={16} color={log.color} />
                    </div>
                    {i !== 3 && <div style={{ width: 2, height: 24, background: '#f1f5f9', marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{log.label}</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{log.sub}</p>
                  </div>
                  <p style={{ margin: '6px 0 0 auto', fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>{log.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Toolbox, Alerts, Recent Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* 6. Quick Action Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Add Student', icon: UserPlus, color: '#8b5cf6' },
              { label: 'Attendance', icon: CheckCircle, color: '#10b981' },
              { label: 'Create Exam', icon: Award, color: '#f59e0b' },
              { label: 'Notify All', icon: Send, color: '#3b82f6' }
            ].map((action, i) => (
              <motion.button key={i} whileHover={{ y: -2 }} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                <div style={{ background: `${action.color}15`, padding: 10, borderRadius: 12 }}><action.icon size={20} color={action.color} /></div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* 5. Admin Toolbox (Improved) */}
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', borderRadius: 24, padding: '24px', color: '#fff', boxShadow: '0 8px 20px rgba(15,23,42,0.1)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Admin Toolbox</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24 }}>System administration core commands.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <motion.button onClick={() => setActiveTab && setActiveTab('Students')} whileHover={{ scale: 1.02 }} style={{ padding: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <UserPlus size={16} /> Register Student
              </motion.button>
              <motion.button onClick={() => setActiveTab && setActiveTab('Teachers')} whileHover={{ scale: 1.02 }} style={{ padding: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <GraduationCap size={16} /> Add Teacher
              </motion.button>
              <motion.button onClick={() => setActiveTab && setActiveTab('Courses')} whileHover={{ scale: 1.02 }} style={{ padding: '14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <BookOpen size={16} /> Create Course
              </motion.button>
              <motion.button onClick={() => setActiveTab && setActiveTab('Notices')} whileHover={{ scale: 1.02 }} style={{ padding: '14px', background: '#3b82f6', border: 'none', borderRadius: 16, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                <Send size={16} /> Publish Notice
              </motion.button>
            </div>
          </div>

          {/* 7. Alerts Panel */}
          <div style={{ background: '#fff', border: '1px solid #fee2e2', borderRadius: 24, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#ef4444' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={18} color="#ef4444" /> Needs Attention</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#334155' }}>3 Pending student approvals</p>
                <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Review</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#334155' }}>Grade 12 Results Pending</p>
                <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Publish</button>
              </div>
            </div>
          </div>

          {/* 8. Recent Data Snapshot */}
          <div style={{ background: '#fff', borderRadius: 24, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: 0 }}>Recent Registrations</h3>
              <a href="#" style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View All <ArrowRight size={12} /></a>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.students.slice(-4).reverse().map((student, i) => {
                const name = student.user?.first_name ? `${student.user.first_name} ${student.user.last_name||''}`.trim() : student.user?.username || student.student_id;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i !== 3 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1e293b, #334155)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Grade {student.grade || 'N/A'}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', background: '#ecfdf5', color: '#10b981', padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>New</span>
                  </div>
                );
              })}
              {data.students.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No recent students</p>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminOverviewView;
