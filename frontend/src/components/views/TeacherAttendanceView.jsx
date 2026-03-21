import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import api from '../../api';

const statusConfig = {
  present: { label: 'Present', bg: '#f0fdf4', color: '#059669', border: '#86efac', icon: CheckCircle },
  absent:  { label: 'Absent',  bg: '#fef2f2', color: '#ef4444', border: '#fca5a5', icon: XCircle },
  late:    { label: 'Late',    bg: '#fffbeb', color: '#f59e0b', border: '#fde68a', icon: Clock },
};

const TeacherAttendanceView = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/students/');
      setStudents(resp.data);
      const init = {};
      resp.data.forEach(s => { init[s.id] = 'present'; });
      setAttendance(init);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const autoFill = () => {
    const u = {}; students.forEach(s => { u[s.id] = 'present'; }); setAttendance(u);
  };

  const setStatus = (id, status) => setAttendance(p => ({ ...p, [id]: status }));

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: attendance[s.id] || 'present',
        notes: ''
      }));
      
      await api.post('/attendance/bulk_mark/', {
        date,
        teacher: user.id,
        records
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Failed to save attendance:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg,#059669,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#fff" />
          </span>
          <div>
            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 17, margin: 0 }}>Attendance Register</p>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>{students.length} students</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b', borderRadius: 10, padding: '8px 12px', fontSize: 13, outline: 'none' }} />
          <button onClick={autoFill}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, color: '#059669', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <RefreshCw size={13} /> Auto-Fill Present
          </button>
          <button onClick={save} disabled={saving}
            style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: saved ? '#059669' : '#0d9488', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Students */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Loading students…</p>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          No students found. Add students via the Admin panel.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {students.map((s, idx) => {
            const cur = attendance[s.id] || 'present';
            const name = s.user?.first_name ? `${s.user.first_name} ${s.user.last_name || ''}`.trim() : s.user?.username || s.student_id;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: '#1e293b', fontWeight: 600, fontSize: 14, margin: 0 }}>{name}</p>
                    <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>ID: {s.student_id} · Grade {s.grade}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Object.entries(statusConfig).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const active = cur === key;
                    return (
                      <button key={key} onClick={() => setStatus(s.id, key)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: `1px solid ${active ? cfg.border : '#e2e8f0'}`, background: active ? cfg.bg : 'transparent', color: active ? cfg.color : '#94a3b8', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.12s' }}>
                        <Icon size={12} />{cfg.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceView;
