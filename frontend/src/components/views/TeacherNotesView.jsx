import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2, Link, FileText, Video } from 'lucide-react';
import api from '../../api';

/* ─── Type/Section configs (unchanged) ─── */
const typeConfig = {
  pdf:        { label: 'PDF',          icon: FileText, color: '#ef4444' },
  video:      { label: 'Video Link',   icon: Video,    color: '#8b5cf6' },
  video_file: { label: 'Video Upload', icon: Video,    color: '#f97316' },
  link:       { label: 'Link',         icon: Link,     color: '#0ea5e9' },
};

const sectionColors = {
  notes: '#f8fafc', syllabus: '#f0f9ff', assignment: '#fef2f2',
  reference: '#f0fdf4', video: '#fff7ed', general: '#f8fafc',
};

const sectionText = {
  notes: 'Notes', syllabus: 'Syllabus', assignment: 'Assignment',
  reference: 'Reference', video: 'Videos', general: 'General',
};

const inputStyle = {
  width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b',
  borderRadius: 10, padding: '9px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const TeacherNotesView = () => {
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', file_type: 'pdf', url: '', course: '', section: 'notes' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([api.get('/resources/'), api.get('/courses/')]);
      setResources(r.data); setCourses(c.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('file_type', form.file_type);
      data.append('course', form.course);
      data.append('section', form.section);
      if (selectedFile) data.append('file', selectedFile);
      else data.append('url', form.url);
      await api.post('/resources/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowForm(false);
      setForm({ title: '', file_type: 'pdf', url: '', course: '', section: 'notes' });
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message);
      alert('Failed to save resource. Please check all fields.');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    await api.delete(`/resources/${id}/`); fetchData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={20} color="#fff" />
          </span>
          <div>
            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 17, margin: 0 }}>Notes & Assignments</p>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>Upload course materials</p>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#8b5cf6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <Plus size={15} /> Add Resource
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} onSubmit={save}
          style={{ background: '#fff', border: '1px solid #c4b5fd', borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 16, margin: 0 }}>New Resource</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Title</label>
              <input required value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} placeholder="Chapter 3 Notes" style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Type</label>
              <select value={form.file_type} onChange={e => setForm(v => ({ ...v, file_type: e.target.value }))} style={inputStyle}>
                <option value="pdf">PDF Document</option>
                <option value="video">Video Link</option>
                <option value="video_file">Video Upload</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Section</label>
              <select value={form.section} onChange={e => setForm(v => ({ ...v, section: e.target.value }))} style={inputStyle}>
                <option value="notes">Class Notes</option>
                <option value="syllabus">Syllabus</option>
                <option value="assignment">Assignments</option>
                <option value="reference">Reference</option>
                <option value="video">Videos</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Assign to Course</label>
              <select value={form.course} onChange={e => setForm(v => ({ ...v, course: e.target.value }))} style={inputStyle}>
                <option value="">— General —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ color: '#64748b', fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                {form.file_type === 'pdf' ? 'Upload PDF File' : form.file_type === 'video_file' ? 'Upload Video File' : 'Resource URL'}
              </label>
              {form.file_type === 'pdf' || form.file_type === 'video_file' ? (
                <input type="file" accept={form.file_type === 'pdf' ? '.pdf' : 'video/*'} onChange={e => setSelectedFile(e.target.files[0])} style={{ ...inputStyle, padding: '7px 12px' }} />
              ) : (
                <input required value={form.url} onChange={e => setForm(v => ({ ...v, url: e.target.value }))} placeholder="https://..." style={inputStyle} />
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving}
              style={{ padding: '9px 20px', background: '#8b5cf6', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {saving ? 'Uploading…' : 'Upload Resource'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setSelectedFile(null); }}
              style={{ padding: '9px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Loading materials…</p>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
          No resources yet. Click <strong style={{ color: '#1e293b' }}>Add Resource</strong> to start.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {resources.map((res, i) => {
            const cfg = typeConfig[res.file_type] || typeConfig.link;
            const Icon = cfg.icon;
            const finalUrl = res.file || res.url;
            return (
              <motion.div key={res.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={cfg.color} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 14, margin: 0 }}>{res.title}</p>
                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 6, background: sectionColors[res.section] || '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        {sectionText[res.section] || 'General'}
                      </span>
                    </div>
                    <a href={finalUrl} target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: 12, textDecoration: 'none', display: 'block', marginTop: 2 }}>
                      {res.file ? '📄 Download Attachment' : '🔗 Open Link'}
                    </a>
                  </div>
                </div>
                <button onClick={() => del(res.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 8, borderRadius: 8, transition: 'all 0.2s' }}>
                  <Trash2 size={17} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherNotesView;
