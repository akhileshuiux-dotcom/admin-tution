import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, RefreshCw, Calendar, Search, FileDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import api from '../../api';

const statusConfig = {
  present: { label: 'Present', bg: '#f0fdf4', color: '#059669', border: '#86efac', icon: CheckCircle },
  absent:  { label: 'Absent',  bg: '#fef2f2', color: '#ef4444', border: '#fca5a5', icon: XCircle },
  late:    { label: 'Late',    bg: '#fffbeb', color: '#f59e0b', border: '#fde68a', icon: Clock },
};

const SummaryCards = ({ data }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
    {[
      { label: 'Total Students', value: data.total, color: '#1e293b', bg: '#ffffff', icon: Users },
      { label: 'Present', value: data.present, color: '#059669', bg: '#f0fdf4', icon: CheckCircle },
      { label: 'Absent', value: data.absent, color: '#ef4444', bg: '#fef2f2', icon: XCircle },
      { label: 'Late', value: data.late, color: '#f59e0b', bg: '#fffbeb', icon: Clock },
    ].map((s, i) => (
      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
        style={{ background: s.bg, border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 22px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
        <p style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>{s.label}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: s.color, fontSize: 26, fontWeight: 900, margin: 0 }}>{s.value}</p>
          <s.icon size={20} color={s.color} style={{ opacity: 0.15 }} />
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: s.color, opacity: 0.1 }} />
      </motion.div>
    ))}
  </div>
);

const TeacherAttendanceView = ({ user }) => {
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' or 'history'
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // History State
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    student: '',
    status: '',
    search: '',
    grade: '',
  });

  const [markGradeFilter, setMarkGradeFilter] = useState('');

  // 1. Memoized Stats for "Mark Attendance"
  const filteredStudents = React.useMemo(() => students.filter(s => !markGradeFilter || s.grade === markGradeFilter), [students, markGradeFilter]);

  const stats = React.useMemo(() => {
    const vals = filteredStudents.map(s => attendance[s.id] || 'present');
    return {
      total: filteredStudents.length,
      present: vals.filter(v => v === 'present').length,
      absent: vals.filter(v => v === 'absent').length,
      late: vals.filter(v => v === 'late').length,
    };
  }, [filteredStudents, attendance]);

  const uniqueGrades = React.useMemo(() => {
    const grades = new Set(students.map(s => s.grade).filter(Boolean));
    return Array.from(grades).sort((a,b) => parseInt(a) - parseInt(b));
  }, [students]);

  // 2. Memoized Stats for "Attendance History"
  const historyStats = React.useMemo(() => {
    return {
      total: history.length,
      present: history.filter(v => v.status === 'present').length,
      absent: history.filter(v => v.status === 'absent').length,
      late: history.filter(v => v.status === 'late').length,
    };
  }, [history]);

  useEffect(() => { 
    fetchInitialData(); 
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  // Fetch both students and existing attendance for current date
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sResp, aResp] = await Promise.all([
        api.get('/students/'),
        api.get(`/attendance/?date=${date}`)
      ]);
      
      setStudents(sResp.data);
      
      // Map existing records or default to 'present'
      const init = {};
      sResp.data.forEach(s => { init[s.id] = 'present'; });
      aResp.data.forEach(rec => { init[rec.student] = rec.status; });
      setAttendance(init);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Listen for date changes to load existing data
  useEffect(() => {
    const loadDateData = async () => {
      try {
        const resp = await api.get(`/attendance/?date=${date}`);
        const update = {};
        students.forEach(s => { update[s.id] = 'present'; });
        resp.data.forEach(rec => { update[rec.student] = rec.status; });
        setAttendance(update);
      } catch (e) { console.error(e); }
    };
    if (students.length > 0) loadDateData();
  }, [date]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      let url = `/attendance/?date__gte=${filters.startDate}&date__lte=${filters.endDate}`;
      if (filters.student) url += `&student=${filters.student}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.search) url += `&search=${filters.search}`;
      
      const resp = await api.get(url);
      
      let rows = resp.data;
      if (filters.grade) {
        const matchingStudents = new Set(students.filter(s => s.grade === filters.grade).map(s => s.id));
        rows = rows.filter(r => matchingStudents.has(r.student));
      }
      
      // Sort by date descending
      const sorted = rows.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(sorted);
    } catch (e) {
      console.error('Failed to fetch attendance history:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const autoFill = () => {
    const u = { ...attendance }; filteredStudents.forEach(s => { u[s.id] = 'present'; }); setAttendance(u);
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

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Date', 'Student ID', 'Student Name', 'Status', 'Notes'];
    const rows = history.map(r => [
      r.date, 
      r.student_id_code || r.student, 
      r.student_name || 'Unknown', 
      r.status, 
      r.notes || ''
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#e2e8f0', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {[
          { key: 'mark', label: 'Mark Attendance', icon: RefreshCw },
          { key: 'history', label: 'Attendance History', icon: Calendar },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, border: 'none', background: activeTab === t.key ? '#fff' : 'transparent', color: activeTab === t.key ? '#0d9488' : '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: activeTab === t.key ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'mark' ? (
          <motion.div key="mark" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg,#059669,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="#fff" />
                </span>
                <div>
                  <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 17, margin: 0 }}>Attendance Register</p>
                  <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>{filteredStudents.length} students</p>
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

            {/* Grade Tabs */}
            {uniqueGrades.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: -4 }}>
                <button
                  onClick={() => setMarkGradeFilter('')}
                  style={{
                    padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: '1px solid #e2e8f0',
                    background: markGradeFilter === '' ? '#0d9488' : '#fff',
                    color: markGradeFilter === '' ? '#fff' : '#64748b',
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  All Grades
                </button>
                {uniqueGrades.map(grade => (
                  <button
                    key={grade}
                    onClick={() => setMarkGradeFilter(grade)}
                    style={{
                      padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: '1px solid #e2e8f0',
                      background: markGradeFilter === grade ? '#0d9488' : '#fff',
                      color: markGradeFilter === grade ? '#fff' : '#64748b',
                      cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            )}

            {/* Stats Summary */}
            <SummaryCards data={stats} />

            {/* Students List */}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Loading students…</p>
            ) : students.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                No students found. Add students via the Admin panel.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredStudents.map((s, idx) => {
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
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Filter Bar */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Filter size={18} color="#64748b" />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Filter Records</h3>
                </div>
                <button onClick={exportCSV} disabled={history.length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  <FileDown size={15} /> Export CSV
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Start Date</label>
                  <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>End Date</label>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Grade</label>
                  <select value={filters.grade} onChange={e => setFilters(f => ({ ...f, grade: e.target.value }))}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none' }}>
                    <option value="">All Grades</option>
                    {[...Array(12)].map((_,i) => <option key={i+1} value={`${i+1}th`}>{i+1}th Grade</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Student</label>
                  <select value={filters.student} onChange={e => setFilters(f => ({ ...f, student: e.target.value }))}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none' }}>
                    <option value="">All Students</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.user?.first_name} {s.user?.last_name} ({s.student_id})</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Status</label>
                  <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none' }}>
                    <option value="">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Search by student name or ID..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px 10px 38px', fontSize: 13, outline: 'none' }} />
              </div>

              <button onClick={fetchHistory}
                style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Apply Filters
              </button>
            </div>

            {/* History Stats Summary */}
            {!historyLoading && history.length > 0 && <SummaryCards data={historyStats} />}

            {/* Records List */}
            {historyLoading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Loading history…</p>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                No records found for the selected filters.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px', padding: '12px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px 14px 0 0', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  <span>Date</span>
                  <span>Student Details</span>
                  <span style={{ textAlign: 'right' }}>Status</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
                  {history.map((rec, i) => {
                    const cfg = statusConfig[rec.status] || statusConfig.present;
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={rec.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px', padding: '14px 20px', borderBottom: i === history.length - 1 ? 'none' : '1px solid #f1f5f9', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{rec.date}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{rec.student_name}</span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>ID: {rec.student_id_code} · Marked by Prof. {user?.user?.last_name || 'Teacher'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                            <StatusIcon size={11} /> {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherAttendanceView;
