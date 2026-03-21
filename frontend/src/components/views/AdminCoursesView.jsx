import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Search, Filter, 
  Trash2, Edit2, X, GraduationCap, Layers, Tag
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

const SelectField = ({ label, icon: Icon, value, onChange, options, required = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
      <select
        required={required}
        value={value}
        onChange={onChange}
        style={{
          width: '100%', padding: '10px 12px 10px 38px', borderRadius: 12, border: '1px solid #e2e8f0',
          fontSize: 14, outline: 'none', background: '#f8fafc', boxSizing: 'border-box', appearance: 'none'
        }}
      >
        <option value="">Select Option</option>
        {options.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
      </select>
    </div>
  </div>
);

const AdminCoursesView = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '', description: '', teacher: '', subject: ''
  });

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const [c, t, s] = await Promise.all([
        api.get('/courses/'),
        api.get('/teachers/'),
        api.get('/subjects/'),
      ]);
      setCourses(c.data);
      setTeachers(t.data);
      setSubjects(s.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleEdit = (c) => {
    setForm({
      title: c.title,
      description: c.description,
      teacher: c.teacher?.id || '',
      subject: c.subject?.id || ''
    });
    setEditingId(c.id);
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/courses/${editingId}/`, form);
      } else {
        await api.post(`/courses/`, form);
      }
      setShowModal(false); setForm({title:'', description:'', teacher:'', subject:''}); setEditingId(null); fetchData();
    } catch (e) {
      alert("Error saving course");
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete course?")) return;
    try {
      await api.delete(`/courses/${id}/`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>Curriculum Management</h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Create subjects and assign instructors to courses.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setForm({title:'', description:'', teacher:'', subject:''}); setShowModal(true); }}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#f59e0b', 
            color: '#fff', borderRadius: 14, border: 'none', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(245,158,11,0.2)'
          }}
        >
          <Plus size={18} /> New Course
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {loading ? (
             <p style={{ color: '#94a3b8', textAlign: 'center', gridColumn: '1/-1', padding: 40 }}>Loading curriculum...</p>
        ) : courses.map(course => {
          const tName = `${course.teacher?.user?.first_name || 'T'} ${course.teacher?.user?.last_name || ''}`;
          return (
          <div key={course.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fffbeb', border: '1px solid #fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} color="#f59e0b" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                 <button onClick={() => handleEdit(course)} style={{ border: 'none', background: '#f8fafc', padding: 8, borderRadius: 8, cursor: 'pointer' }}><Edit2 size={14} color="#64748b" /></button>
                 <button onClick={() => del(course.id)} style={{ border: 'none', background: '#fff1f2', padding: 8, borderRadius: 8, cursor: 'pointer' }}><Trash2 size={14} color="#e11d48" /></button>
              </div>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>{course.title}</h3>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>{course.subject?.name || 'General'}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{course.description || 'No description provided.'}</p>
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
               <img src={`https://ui-avatars.com/api/?name=${tName.split(' ').join('+')}&background=fde68a&color=92400e`} style={{ width: 28, height: 28, borderRadius: 8 }} alt="Teacher" />
               <div style={{ fontSize: 12 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{tName}</p>
                  <p style={{ margin: 0, color: '#94a3b8' }}>Course Instructor</p>
               </div>
            </div>
          </div>
        )})}
      </div>

      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>{editingId ? 'Edit Course' : 'Create New Course'}</h3>
                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} color="#64748b" /></button>
              </div>
              <form onSubmit={save} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <InputField label="Course Title" icon={BookOpen} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Advanced Calculus" />
                <InputField label="Description" icon={Tag} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What's this course about?" />
                
                <SelectField 
                   label="Subject Category" icon={Layers} 
                   value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} 
                   options={subjects.map(s => ({ id: s.id, label: s.name }))} required 
                />
                
                <SelectField 
                   label="Assign Instructor" icon={GraduationCap} 
                   value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} 
                   options={teachers.map(t => ({ id: t.id, label: `${t.user?.first_name || 'T'} ${t.user?.last_name || ''}` }))} required 
                />

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button type="submit" disabled={saving} style={{ flex: 1, padding: '14px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                    {saving ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
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

export default AdminCoursesView;
