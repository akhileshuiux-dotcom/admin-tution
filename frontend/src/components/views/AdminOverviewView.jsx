import React, { useState, useEffect } from 'react';
import { 
  Users, GraduationCap, BookOpen, CalendarDays, 
  TrendingUp, Award, Clock
} from 'lucide-react';
import api from '../../api';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '24px', flex: 1, minWidth: 200, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={color} />
      </div>
      <div style={{ background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
        <TrendingUp size={12} /> +12%
      </div>
    </div>
    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <h3 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{value}</h3>
  </div>
);

const AdminOverviewView = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, meetings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t, c, m] = await Promise.all([
          api.get(`/students/`),
          api.get(`/teachers/`),
          api.get(`/courses/`),
          api.get(`/admin-meetings/`),
        ]);
        setStats({
          students: s.data.length,
          teachers: t.data.length,
          courses: c.data.length,
          meetings: m.data.length
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Welcome Section */}
      <section>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>Global Overview</h2>
        <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>Real-time statistics for the EDUWAY Academy network.</p>
      </section>

      {/* Stats Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <StatCard icon={Users} label="Total Students" value={stats.students} color="#8b5cf6" bg="#f5f3ff" />
        <StatCard icon={GraduationCap} label="Total Teachers" value={stats.teachers} color="#0ea5e9" bg="#f0f9ff" />
        <StatCard icon={BookOpen} label="Active Courses" value={stats.courses} color="#f59e0b" bg="#fffbeb" />
        <StatCard icon={CalendarDays} label="Staff Meetings" value={stats.meetings} color="#ec4899" bg="#fdf2f8" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Recent Activity */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: '24px' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>System Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: Clock, label: 'Server Status', value: 'Healthy / 0.02s delay', color: '#10b981' },
              { icon: Award, label: 'Latest Milestone', value: 'Exam Results Released', color: '#6366f1' },
              { icon: Users, label: 'New Registrations', value: '8 Students joined today', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={18} color={item.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'linear-gradient(135deg,#1e293b,#334155)', borderRadius: 24, padding: '24px', color: '#fff' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Admin Toolbox</h3>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24 }}>Direct shortcuts to core management modules.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Register Student</button>
            <button style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add Teacher</button>
            <button style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>New Meeting</button>
            <button style={{ padding: '12px', background: '#3b82f6', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Publish Broadast</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewView;
