import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Plus, Search, Filter, 
  UserPlus, Mail, Hash, BookOpen, Trash2, Edit2, X, Briefcase
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
          fontSize: 14, outline: 'none', background: '#f8fafc', boxSizing: 'border-box'
        }}
      />
    </div>
  </div>
);

const AdminTeachersView = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    user: { username: '', email: '', first_name: '', last_name: '', password: 'Teacher@123' },
    employee_id: '', specialization: '', bio: ''
  });

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      const resp = await api.get(`/teachers/`);
      setTeachers(resp.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({
      user: { username: '', email: '', first_name: '', last_name: '', password: 'Teacher@123' },
      employee_id: '', specialization: '', bio: ''
    });
    setEditingId(null);
  };

  const handleEdit = (t) => {
    setForm({
      user: { 
        username: t.user.username, email: t.user.email, 
        first_name: t.user.first_name, last_name: t.user.last_name, 
        password: '' 
      },
      employee_id: t.employee_id, specialization: t.specialization, bio: t.bio
    });
    setEditingId(t.id);
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.user.password) delete payload.user.password;

      if (editingId) {
        await api.patch(`/teachers/${editingId}/`, payload);
      } else {
        await api.post(`/teachers/`, payload);
      }
      setShowModal(false); resetForm(); fetchTeachers();
    } catch (e) {
      alert(e.response?.data ? JSON.stringify(e.response.data) : "An error occurred");
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Are you sure? This will delete the teacher and their login account.")) return;
    await api.delete(`/teachers/${id}/`);
    fetchTeachers();
  };

  const filtered = teachers.filter(t => {
    const q = search.toLowerCase();
    const name = `${t.user?.first_name} ${t.user?.last_name} ${t.user?.username}`.toLowerCase();
    return name.includes(q) || t.employee_id.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>Instructor Directory</h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Manage the academy's teaching staff.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#0ea5e9', 
            color: '#fff', borderRadius: 14, border: 'none', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(14,165,233,0.2)'
          }}
        >
          <UserPlus size={18} /> Add New Teacher
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Search size={18} color="#94a3b8" />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID or specialization..." 
            style={{ background: 'none', border: 'none', outline: 'none', flex: 1, color: '#1e293b', fontSize: 14 }} 
          />
        </div>
      </div>

      {/* Table/List */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Instructor</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employee ID</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Specialization</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading directory...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>No teachers found.</td></tr>
            ) : filtered.map((t, idx) => (
              <tr key={t.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {t.user?.first_name?.[0] || t.user?.username?.[0]?.toUpperCase() || 'T'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{t.user?.first_name} {t.user?.last_name}</p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: 12 }}>{t.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{t.employee_id}</p>
                </td>
                <td style={{ padding: '16px 24px' }}>
                   <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: 6 }}>{t.specialization || 'General'}</span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={() => handleEdit(t)} title="Edit" style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => del(t.id)} title="Delete" style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 700, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>{editingId ? 'Edit Instructor' : 'Add New Instructor'}</h3>
                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} color="#64748b" /></button>
              </div>
              <form onSubmit={save} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <InputField label="First Name" icon={GraduationCap} value={form.user.first_name} onChange={e => setForm({...form, user: {...form.user, first_name: e.target.value}})} required />
                  <InputField label="Last Name" icon={GraduationCap} value={form.user.last_name} onChange={e => setForm({...form, user: {...form.user, last_name: e.target.value}})} required />
                  <InputField label="Email Address" icon={Mail} value={form.user.email} onChange={e => setForm({...form, user: {...form.user, email: e.target.value}})} required type="email" />
                  {!editingId && <InputField label="Portal Password" icon={Hash} value={form.user.password} onChange={e => setForm({...form, user: {...form.user, password: e.target.value}})} required />}
                  <InputField label="Employee ID" icon={Hash} value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} required placeholder="EMP-2024-XXX" />
                  <InputField label="Specialization" icon={Briefcase} value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="Mathematics, Science, etc." />
                  <div style={{ gridColumn: 'span 2' }}>
                    <InputField label="Biography" icon={BookOpen} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Brief teacher biography..." />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button type="submit" disabled={saving} style={{ flex: 1, padding: '14px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                    {saving ? 'Processing...' : editingId ? 'Save Changes' : 'Register Instructor'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0 24px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTeachersView;
