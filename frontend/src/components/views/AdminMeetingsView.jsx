import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, Plus, Search, Trash2, Edit2, X, 
  MapPin, Clock, Info, User, BookOpen
} from 'lucide-react';
import api from '../../api';

const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", required = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px 10px 38px', borderRadius: 12, border: '1px solid #e2e8f0',
          fontSize: 14, outline: 'none', background: '#f8fafc', boxSizing: 'border-box', color: 'black'
        }}
      />
    </div>
  </div>
);

const AdminMeetingsView = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', end_time: '', location: '', meeting_type: 'offline', meeting_link: ''
  });

  useEffect(() => { 
    fetchMeetings(); 
  }, []);

  const fetchMeetings = async () => {
    try {
      const resp = await api.get('/admin-meetings/');
      setMeetings(resp.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', date: '', time: '', end_time: '', location: '', meeting_type: 'offline', meeting_link: '' });
    setEditingId(null);
  };

  const handleEdit = (m) => {
    setForm({
      title: m.title, description: m.description, 
      date: m.date, time: m.time, end_time: m.end_time || '', location: m.location,
      meeting_type: m.meeting_type || 'offline', meeting_link: m.meeting_link || ''
    });
    setEditingId(m.id);
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/admin-meetings/${editingId}/`, form);
      } else {
        await api.post('/admin-meetings/', form);
      }
      setShowModal(false); resetForm(); fetchMeetings();
    } catch (e) {
      alert("Error saving meeting");
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete meeting?")) return;
    try {
      await api.delete(`/admin-meetings/${id}/`);
      fetchMeetings();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>Meeting Scheduler</h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Schedule briefings and PD sessions for staff.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#ec4899', 
            color: '#fff', borderRadius: 14, border: 'none', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(236,72,153,0.2)'
          }}
        >
          <Plus size={18} /> Schedule Meeting
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {loading ? (
             <p style={{ color: '#94a3b8', textAlign: 'center', gridColumn: '1/-1', padding: 40 }}>Loading schedule...</p>
        ) : meetings.length === 0 ? (
             <p style={{ color: '#94a3b8', textAlign: 'center', gridColumn: '1/-1', padding: 40 }}>No meetings scheduled.</p>
        ) : meetings.map(meeting => (
          <div key={meeting.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fdf2f8', border: '1px solid #fbcfe8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarDays size={20} color="#ec4899" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                 <button onClick={() => handleEdit(meeting)} style={{ border: 'none', background: '#f8fafc', padding: 8, borderRadius: 8, cursor: 'pointer' }}><Edit2 size={14} color="#64748b" /></button>
                 <button onClick={() => del(meeting.id)} style={{ border: 'none', background: '#fff1f2', padding: 8, borderRadius: 8, cursor: 'pointer' }}><Trash2 size={14} color="#e11d48" /></button>
              </div>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>{meeting.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 0', flexWrap: 'wrap' }}>
                 <Clock size={12} color="#94a3b8" />
                 <span style={{ fontSize: 12, color: '#64748b' }}>{meeting.date} at {meeting.time}{meeting.end_time ? ` - ${meeting.end_time}` : ''}</span>
                 <span style={{ fontSize: 11, fontWeight: 600, color: meeting.meeting_type === 'online' ? '#059669' : '#64748b', background: meeting.meeting_type === 'online' ? '#d1fae5' : '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                   Type: {meeting.meeting_type === 'online' ? 'Online' : 'Offline'}
                 </span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{meeting.description || 'No additional details.'}</p>
            {meeting.meeting_type === 'online' && meeting.meeting_link && (
              <div>
                <a href={meeting.meeting_link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#ec4899', color: '#fff', textDecoration: 'none', padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8 }}>
                  Join Meeting
                </a>
              </div>
            )}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={14} color="#94a3b8" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{meeting.location || 'Conference Room'}</span>
               </div>
               <span style={{ fontSize: 10, fontWeight: 700, color: '#ec4899', background: '#fdf2f8', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>Mandatory</span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>{editingId ? 'Edit Meeting' : 'Schedule New Meeting'}</h3>
                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} color="#64748b" /></button>
              </div>
              <form onSubmit={save} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <InputField label="Meeting Title" icon={Info} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Monthly Staff Briefing" />
                <InputField label="Description" icon={BookOpen} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Agenda and topics..." />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                   <InputField label="Date" icon={CalendarDays} value={form.date} onChange={e => setForm({...form, date: e.target.value})} required type="date" />
                   <InputField label="Start Time" icon={Clock} value={form.time} onChange={e => setForm({...form, time: e.target.value})} required type="time" />
                   <InputField label="End Time" icon={Clock} value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} type="time" />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meeting Type</label>
                  <select
                    value={form.meeting_type}
                    onChange={e => setForm({...form, meeting_type: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#f8fafc', color: 'black' }}
                  >
                    <option value="offline">Offline Meeting</option>
                    <option value="online">Online Meeting</option>
                  </select>
                </div>
                
                {form.meeting_type === 'online' && (
                  <InputField label="Meeting Link (URL)" icon={Info} value={form.meeting_link} onChange={e => setForm({...form, meeting_link: e.target.value})} placeholder="https://..." />
                )}

                <InputField label={form.meeting_type === 'online' ? "Platform (optional)" : "Location"} icon={MapPin} value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder={form.meeting_type === 'online' ? "e.g. Zoom, Google Meet" : "e.g. Main Hall"} />

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button type="submit" disabled={saving} style={{ flex: 1, padding: '14px', background: '#ec4899', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                    {saving ? 'Scheduling...' : editingId ? 'Update Meeting' : 'Schedule Meeting'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMeetingsView;
