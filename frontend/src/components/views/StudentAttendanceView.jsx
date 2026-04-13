import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, Info } from 'lucide-react';
import api from '../../api';

const statusConfig = {
  present: { label: 'Present', color: '#059669', icon: CheckCircle, bg: '#f0fdf4' },
  absent:  { label: 'Absent',  color: '#ef4444', icon: XCircle, bg: '#fef2f2' },
  late:    { label: 'Late',    color: '#f59e0b', icon: Clock, bg: '#fffbeb' },
};

const StudentAttendanceView = ({ user }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, percentage: 0 });
  
  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (user?.id) fetchAttendance();
  }, [user, startDate, endDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const studentId = user.student_profile?.id || user.id; 
      
      const params = { student: studentId };
      if (startDate) params.date__gte = startDate;
      if (endDate) params.date__lte = endDate;

      const resp = await api.get('/attendance/', { params });
      const myRecords = resp.data;
      
      myRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecords(myRecords);
      calculateStats(myRecords);
    } catch (e) {
      console.error('Failed to fetch attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const s = { present: 0, absent: 0, late: 0, percentage: 0 };
    data.forEach(r => {
      if (r.status === 'present') s.present++;
      else if (r.status === 'absent') s.absent++;
      else if (r.status === 'late') s.late++;
    });
    const total = data.length;
    s.percentage = total > 0 ? Math.round(((s.present + (s.late * 0.5)) / total) * 100) : 0;
    setStats(s);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <p style={{ color: '#64748b', fontSize: 13, fontWeight: 600, margin: '0 0 8px 0' }}>Attendance Rate</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.percentage}%</h2>
            <span style={{ color: stats.percentage > 75 ? '#059669' : '#ef4444', fontSize: 12, fontWeight: 600 }}>
              {stats.percentage > 75 ? 'Excellent' : 'Needs attention'}
            </span>
          </div>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <p style={{ color: '#64748b', fontSize: 13, fontWeight: 600, margin: '0 0 8px 0' }}>Present Days</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#059669', margin: 0 }}>{stats.present}</h2>
        </div>
        <div style={{ background: '#fff', padding: 20, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <p style={{ color: '#64748b', fontSize: 13, fontWeight: 600, margin: '0 0 8px 0' }}>Absent Days</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#ef4444', margin: 0 }}>{stats.absent}</h2>
        </div>
      </div>

      {/* History Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Calendar size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Attendance History</h3>
          </div>

          {/* Date Filter UI */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '6px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>From</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#1e293b', fontWeight: 600, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '6px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>To</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#1e293b', fontWeight: 600, outline: 'none' }}
              />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={clearFilters}
                style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading records...</div>
        ) : records.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Info size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
            <p style={{ color: '#94a3b8', margin: 0 }}>No attendance records found yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '14px 22px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>DATE</th>
                  <th style={{ textAlign: 'left', padding: '14px 22px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>STATUS</th>
                  <th style={{ textAlign: 'left', padding: '14px 22px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>NOTES</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => {
                  const cfg = statusConfig[r.status] || statusConfig.present;
                  const Icon = cfg.icon;
                  return (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                      style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 22px', color: '#1e293b', fontWeight: 500, fontSize: 14 }}>
                        {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 22px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 700 }}>
                          <Icon size={12} /> {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 22px', color: '#64748b', fontSize: 13 }}>
                        {r.notes || '—'}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceView;
