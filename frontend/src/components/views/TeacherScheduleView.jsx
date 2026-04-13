import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, CalendarDays, Plus, Trash2, Clock, ExternalLink,
  ChevronDown, ChevronUp, Link, X, AlertCircle, Users
} from 'lucide-react';
import api from '../../api';

/* ─────────────── Shared Utilities ─────────────── */
const inputStyle = {
  width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b',
  borderRadius: 10, padding: '9px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

/* ─────────────── Class Status Logic ─────────────── */
function getClassStatus(date, startTime, endTime) {
  const now = new Date();
  const start = new Date(`${date}T${startTime}`);
  const end   = new Date(`${date}T${endTime}`);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'completed';
}
const statusCfg = {
  upcoming:  { label: 'Upcoming',  bg: '#eff6ff', color: '#3b82f6' },
  live:      { label: '● Live',    bg: '#f0fdf4', color: '#16a34a' },
  completed: { label: 'Completed', bg: '#f8fafc', color: '#64748b' },
};
const fmt12 = (t) => {
  const [h, m] = t.split(':');
  const d = new Date(); d.setHours(+h, +m);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};
const fmtDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

/* ─────────────── Schedule Class Form Modal ─────────────── */
const ClassFormModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ title: '', category: 'GENERAL', date: '', start_time: '', end_time: '', link: '', description: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/online-classes/', form); onSaved(); onClose(); }
    catch (err) { console.error(err.response?.data || err.message); alert('Failed to schedule class.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={17} color="#fff" /></span>
            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 16, margin: 0 }}>Schedule Online Class</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 8 }}><X size={18} /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Class Title *</label>
              <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Algebra Chapter 3" style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Subject / Category</label>
              <input value={form.category} onChange={e => set('category', e.target.value.toUpperCase())} placeholder="GENERAL" style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Date *</label>
              <input required type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Start Time *</label>
              <input required type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>End Time *</label>
              <input required type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Class Link (Zoom / Meet / URL) *</label>
              <input required type="url" value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://meet.google.com/..." style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description (optional)</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Topics to be covered..." rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving}
              style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Scheduling…' : '📅 Schedule Class'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ─────────────── Create Teacher Meeting Modal ─────────────── */
const MeetingFormModal = ({ onClose, onSaved, students }) => {
  const [form, setForm] = useState({ title: '', description: '', date_time: '', meeting_link: '', student_ids: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleStudent = (id) => {
    setForm(f => ({
      ...f,
      student_ids: f.student_ids.includes(id) ? f.student_ids.filter(s => s !== id) : [...f.student_ids, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // Build payload — only include meeting_link if non-empty
      const payload = {
        title:       form.title,
        description: form.description,
        date_time:   form.date_time,
        student_ids: form.student_ids,
        ...(form.meeting_link ? { meeting_link: form.meeting_link } : {}),
      };
      await api.post('/teacher-meetings/', payload);
      onSaved();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
        setError(msgs);
      } else {
        setError(err.message || 'Failed to create meeting.');
      }
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={17} color="#fff" />
            </span>
            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 16, margin: 0 }}>Create Meeting for Students</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 8 }}><X size={18} /></button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div>
            <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Meeting Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Exam Briefing, PTM, Doubt Session" style={inputStyle} />
          </div>

          {/* Date Time */}
          <div>
            <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Date & Time *</label>
            <input required type="datetime-local" value={form.date_time} onChange={e => set('date_time', e.target.value)} style={inputStyle} />
          </div>

          {/* Meeting Link */}
          <div>
            <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Meeting Link (optional)</label>
            <input type="url" value={form.meeting_link} onChange={e => set('meeting_link', e.target.value)} placeholder="https://meet.google.com/..." style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description (optional)</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Agenda or instructions for students..." rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
          </div>

          {/* Student Selection */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>
                <Users size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Select Students
                <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 6 }}>(leave empty = all students)</span>
              </label>
              {students.length > 0 && (
                <button type="button"
                  onClick={() => {
                    const allIds = students.map(s => s.id);
                    const allSelected = allIds.every(id => form.student_ids.includes(id));
                    setForm(f => ({ ...f, student_ids: allSelected ? [] : allIds }));
                  }}
                  style={{
                    background: 'none', border: '1px solid #fed7aa', borderRadius: 7,
                    color: '#f97316', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    padding: '3px 10px', whiteSpace: 'nowrap',
                  }}>
                  {students.every(s => form.student_ids.includes(s.id)) ? '☐ Deselect All' : '☑ Select All'}
                </button>
              )}
            </div>
            {students.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>No students found.</p>
            ) : (
              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' }}>
                {students.map(s => {
                  const checked = form.student_ids.includes(s.id);
                  return (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 0' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleStudent(s.id)}
                        style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#f59e0b' }} />
                      <span style={{ color: '#1e293b', fontSize: 13 }}>
                        {s.user?.first_name} {s.user?.last_name}
                        <span style={{ color: '#94a3b8', fontSize: 11, marginLeft: 6 }}>{s.grade || s.standard || ''}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ color: '#dc2626', fontSize: 12, margin: 0, whiteSpace: 'pre-line', lineHeight: 1.6 }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="submit" disabled={saving}
              style={{ padding: '9px 22px', background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Creating…' : '📋 Create Meeting'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ─────────────── Class Card ─────────────── */
const ClassCard = ({ cls, onDelete, idx }) => {
  const [expanded, setExpanded] = useState(false);
  const status = getClassStatus(cls.date, cls.start_time, cls.end_time);
  const cfg = statusCfg[status];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
      style={{ background: '#fff', border: `1px solid ${status === 'live' ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 14, overflow: 'hidden', boxShadow: status === 'live' ? '0 0 0 2px #86efac40' : '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: '#0ea5e915', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Video size={19} color="#0ea5e9" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 14, margin: 0 }}>{cls.title}</p>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 6, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>{cls.category}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><CalendarDays size={12} /> {fmtDate(cls.date)}</span>
            <span style={{ color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {fmt12(cls.start_time)} – {fmt12(cls.end_time)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {status === 'live' ? (
            <a href={cls.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'linear-gradient(135deg,#16a34a,#059669)', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
              <ExternalLink size={13} /> Join Class
            </a>
          ) : (
            <button disabled style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 9, color: '#94a3b8', fontWeight: 600, fontSize: 12, cursor: 'not-allowed' }}>
              <ExternalLink size={13} /> {status === 'upcoming' ? 'Join Class' : 'Ended'}
            </button>
          )}
          <button onClick={() => setExpanded(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 6, borderRadius: 8 }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onDelete(cls.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 6, borderRadius: 8 }}><Trash2 size={16} /></button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 18px 14px', background: '#fafcff' }}>
              <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', margin: '0 0 6px' }}>Details</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <Link size={13} color="#0ea5e9" />
                <a href={cls.link} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380 }}>{cls.link}</a>
              </div>
              {cls.description && <p style={{ color: '#64748b', fontSize: 12, margin: 0, lineHeight: 1.6 }}>{cls.description}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─────────────── Classes Tab ─────────────── */
const ClassesTab = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/online-classes/'); setClasses(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const del = async (id) => {
    if (!window.confirm('Delete this scheduled class?')) return;
    await api.delete(`/online-classes/${id}/`); fetch();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>{loading ? 'Loading…' : `${classes.length} class${classes.length !== 1 ? 'es' : ''} scheduled`}</p>
        <button onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <Plus size={14} /> Schedule Class
        </button>
      </div>
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>Loading classes…</p>
      ) : classes.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 24px', background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
          No classes scheduled yet. Click <strong style={{ color: '#0ea5e9' }}>+ Schedule Class</strong> to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {classes.map((cls, i) => <ClassCard key={cls.id} cls={cls} onDelete={del} idx={i} />)}
        </div>
      )}
      <AnimatePresence>{showForm && <ClassFormModal onClose={() => setShowForm(false)} onSaved={fetch} />}</AnimatePresence>
    </div>
  );
};

/* ─────────────── Meetings Tab ─────────────── */
const MeetingsTab = () => {
  const [adminMeetings, setAdminMeetings]     = useState([]);
  const [teacherMeetings, setTeacherMeetings] = useState([]);
  const [students, setStudents]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showForm, setShowForm]               = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [admin, teacher, studs] = await Promise.all([
        api.get('/admin-meetings/'),
        api.get('/teacher-meetings/'),
        api.get('/students/'),
      ]);
      setAdminMeetings(admin.data);
      setTeacherMeetings(teacher.data);
      setStudents(studs.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const delTeacherMeeting = async (id) => {
    if (!window.confirm('Delete this meeting?')) return;
    await api.delete(`/teacher-meetings/${id}/`); fetchAll();
  };

  /* Admin meeting card (read-only, same as before) */
  const AdminCard = ({ meeting, idx, dim }) => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
      style={{ background: dim ? '#fafafa' : '#fff', border: `1px solid ${meeting.mandatory_for_all ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 14, padding: '16px 20px', opacity: dim ? 0.65 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {meeting.mandatory_for_all && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
            <AlertCircle size={10} /> Mandatory
          </span>
        )}
        <div>
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 15, margin: 0 }}>{meeting.title}</p>
          {meeting.description && <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0', lineHeight: 1.5 }}>{meeting.description}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <CalendarDays size={13} color="#f59e0b" />
            <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>
              {new Date(meeting.date_time).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: meeting.meeting_type === 'online' ? '#059669' : '#64748b', background: meeting.meeting_type === 'online' ? '#d1fae5' : '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
              Type: {meeting.meeting_type === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
          {meeting.meeting_type === 'online' && meeting.meeting_link && (
            <div style={{ marginTop: 10 }}>
              <a href={meeting.meeting_link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#ec4899', color: '#fff', textDecoration: 'none', padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8 }}>
                Join Meeting
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  /* Teacher meeting card (manageable) */
  const TeacherMeetingCard = ({ meeting, idx }) => {
    const isPast = new Date(meeting.date_time) < new Date();
    const studentCount = meeting.student_ids?.length || 0;
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
        style={{ background: '#fff', border: '1px solid #fed7aa', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: isPast ? 0.7 : 1, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CalendarDays size={18} color="#f97316" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 14, margin: 0 }}>{meeting.title}</p>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: isPast ? '#f8fafc' : '#fff7ed', color: isPast ? '#94a3b8' : '#f97316' }}>
              {isPast ? 'Past' : 'Upcoming'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f1f5f9', borderRadius: 20, padding: '2px 8px' }}>
              <Users size={9} />
              {studentCount > 0 ? `${studentCount} student${studentCount > 1 ? 's' : ''}` : 'All students'}
            </span>
          </div>
          {meeting.description && <p style={{ color: '#64748b', fontSize: 12, margin: '4px 0 0', lineHeight: 1.5 }}>{meeting.description}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ color: '#f97316', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarDays size={12} />
              {new Date(meeting.date_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {meeting.meeting_link && (
            <a href={meeting.meeting_link} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', background: '#0ea5e9', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
              <ExternalLink size={12} /> Join
            </a>
          )}
          <button onClick={() => delTeacherMeeting(meeting.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 6, borderRadius: 8 }}>
            <Trash2 size={16} />
          </button>
        </div>
      </motion.div>
    );
  };

  const adminUpcoming = adminMeetings.filter(m => new Date(m.date_time) >= new Date());
  const adminPast     = adminMeetings.filter(m => new Date(m.date_time) <  new Date());

  if (loading) return <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>Loading meetings…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Section A: Teacher Meetings for Students ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#f97316', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Your Meetings for Students</p>
            <p style={{ color: '#94a3b8', fontSize: 11, margin: '2px 0 0' }}>Meetings you create — visible to students</p>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <Plus size={14} /> Add Meeting
          </button>
        </div>

        {teacherMeetings.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 24px', background: '#fff', borderRadius: 16, border: '1px dashed #fed7aa' }}>
            No meetings created yet. Click <strong style={{ color: '#f97316' }}>+ Add Meeting</strong> to create one for your students.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {teacherMeetings.map((m, i) => <TeacherMeetingCard key={m.id} meeting={m} idx={i} />)}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #e2e8f0' }} />

      {/* ── Section B: Admin Meetings (read-only) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <p style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Admin Scheduled Meetings</p>
          <p style={{ color: '#94a3b8', fontSize: 11, margin: '2px 0 0' }}>Meetings scheduled by administration — view only</p>
        </div>

        {adminMeetings.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            No admin meetings scheduled.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {adminUpcoming.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ color: '#059669', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Upcoming</p>
                {adminUpcoming.map((m, i) => <AdminCard key={m.id} meeting={m} idx={i} />)}
              </div>
            )}
            {adminPast.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Past</p>
                {adminPast.map((m, i) => <AdminCard key={m.id} meeting={m} idx={i} dim />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      <AnimatePresence>
        {showForm && <MeetingFormModal onClose={() => setShowForm(false)} onSaved={fetchAll} students={students} />}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────── Main View ─────────────── */
const TeacherScheduleView = ({ user }) => {
  const [activeTab, setActiveTab] = useState('classes');

  const tabs = [
    { key: 'classes',  label: 'Classes',  icon: Video },
    { key: 'meetings', label: 'Meetings', icon: CalendarDays },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Module Header */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <span style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Video size={20} color="#fff" />
        </span>
        <div>
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 17, margin: 0 }}>Scheduled Classes & Meeting</p>
          <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>Manage your online sessions and student meetings</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: activeTab === key ? '#fff' : 'transparent',
              color: activeTab === key ? '#1e293b' : '#64748b',
              fontWeight: activeTab === key ? 700 : 500, fontSize: 13.5,
              boxShadow: activeTab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.14 }}>
          {activeTab === 'classes'  && <ClassesTab />}
          {activeTab === 'meetings' && <MeetingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TeacherScheduleView;
