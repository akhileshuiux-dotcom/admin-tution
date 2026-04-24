import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Plus, Search, Filter,
  UserPlus, Mail, Hash, BookOpen, Trash2, Edit2, X, Briefcase,
  Phone, Calendar, User, MapPin, Activity, CreditCard, Shield, Camera, Lock, Check, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import api from '../../api';
import TeacherDetailsView from './TeacherDetailsView';

const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", required = false, readOnly, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />}
      <input
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: Icon ? '10px 12px 10px 38px' : '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0',
          fontSize: 14, outline: 'none', background: (readOnly || disabled) ? '#f1f5f9' : '#f8fafc', 
          color: (readOnly || disabled) ? '#94a3b8' : '#1e293b', 
          boxSizing: 'border-box',
          cursor: (readOnly || disabled) ? 'not-allowed' : 'text'
        }}
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, value, onChange, options, required = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />}
      <select
        required={required}
        value={value}
        onChange={onChange}
        style={{
          width: '100%', padding: Icon ? '10px 12px 10px 38px' : '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0',
          fontSize: 14, outline: 'none', background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box', appearance: 'none'
        }}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  </div>
);

const TextAreaField = ({ label, icon: Icon, value, onChange, placeholder, rows = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && <Icon style={{ position: 'absolute', left: 12, top: '16px', color: '#94a3b8' }} size={16} />}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%', padding: Icon ? '12px 12px 12px 38px' : '12px', borderRadius: 12, border: '1px solid #e2e8f0',
          fontSize: 14, outline: 'none', background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box', resize: 'none'
        }}
      />
    </div>
  </div>
);

const AdminTeachersView = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availableGrades, setAvailableGrades] = useState([]);
  const [filters, setFilters] = useState({ specialization: '', status: '', grade: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [resetRequests, setResetRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showResetActionModal, setShowResetActionModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [tempPass, setTempPass] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showAddPass, setShowAddPass] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form State
  const [form, setForm] = useState({
    user: { username: '', email: '', first_name: '', last_name: '', password: 'Teacher@123' },
    employee_id: '', specialization: '', bio: '', status: 'active', monthly_salary: 0,
    phone_number: '', gender: 'male', dob: '', qualification: '', experience_years: 0,
    joining_date: '', current_address: '', permanent_address: '', assigned_classes: []
  });

  useEffect(() => { 
    fetchTeachers(); 
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const resp = await api.get('/password-reset-requests/');
      setResetRequests(resp.data);
    } catch (e) { console.error(e); } finally { setLoadingRequests(false); }
  };

  const handleProcessRequest = async (action) => {
    if (action === 'approve' && !tempPass) {
        alert("Please enter a temporary password");
        return;
    }
    setProcessing(true);
    try {
        await api.post(`/password-reset-requests/${activeRequest.id}/process/`, {
            action,
            admin_note: adminNote,
            temp_password: tempPass
        });
        setShowResetActionModal(false);
        fetchRequests();
        fetchTeachers();
    } catch (e) {
        alert(e.response?.data?.error || "Failed to process request");
    } finally {
        setProcessing(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const [teacherResp, studentResp] = await Promise.all([
        api.get(`/teachers/`),
        api.get(`/students/`)
      ]);
      setTeachers(teacherResp.data);
      
      // Extract unique grades from students to populate the standard filter
      const grades = [...new Set(studentResp.data.map(s => s.grade))].filter(Boolean).sort((a, b) => 
        a.toString().localeCompare(b.toString(), undefined, {numeric: true})
      );
      setAvailableGrades(grades);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({
      user: { username: '', email: '', first_name: '', last_name: '', password: 'Teacher@123' },
      employee_id: '', specialization: '', bio: '', status: 'active', monthly_salary: 0,
      phone_number: '', gender: 'male', dob: '', qualification: '', experience_years: 0,
      joining_date: '', current_address: '', permanent_address: '', assigned_classes: []
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
      employee_id: t.employee_id, specialization: t.specialization, bio: t.bio, 
      status: t.status || 'active', monthly_salary: t.monthly_salary || 0,
      phone_number: t.phone_number || '', gender: t.gender || 'male',
      dob: t.dob || '', qualification: t.qualification || '',
      experience_years: t.experience_years || 0, joining_date: t.joining_date || '',
      current_address: t.current_address || '', permanent_address: t.permanent_address || '',
      assigned_classes: t.assigned_classes || []
    });
    setEditingId(t.id);
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.user.username) payload.user.username = payload.user.email;
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

  const saveTeacher = async (e) => {
    e.preventDefault();
    if (!editingId && form.user.password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (!editingId) {
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
      if (!strongRegex.test(form.user.password)) {
        alert("Password must be 8+ chars with upper, lower, number & special char.");
        return;
      }
    }

    save(e);
  };

  const del = async (id) => {
    if (!window.confirm("Are you sure? This will delete the teacher and their login account.")) return;
    await api.delete(`/teachers/${id}/`);
    fetchTeachers();
  };

  const filtered = teachers.filter(t => {
    const q = search.toLowerCase();
    const name = `${t.user?.first_name} ${t.user?.last_name} ${t.user?.username || ''}`.toLowerCase();
    const matchesSearch = name.includes(q) || (t.employee_id || '').toLowerCase().includes(q) || (t.specialization || '').toLowerCase().includes(q);
    const matchesSpecialization = !filters.specialization || t.specialization === filters.specialization;
    const matchesStatus = !filters.status || t.status === filters.status;
    const matchesGrade = !filters.grade || (t.assigned_classes || []).some(c => c.toString() === filters.grade.toString());
    return matchesSearch && matchesSpecialization && matchesStatus && matchesGrade;
  });

  const specializations = [...new Set(teachers.map(t => t.specialization).filter(Boolean))].sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {selectedTeacherId ? (
        <TeacherDetailsView 
          teacherId={selectedTeacherId} 
          onBack={() => setSelectedTeacherId(null)} 
          onEdit={handleEdit} 
        />
      ) : (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Instructor Management</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Manage faculty directory and assignments</p>
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
            <select 
              value={filters.grade} onChange={e => setFilters({...filters, grade: e.target.value})}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#64748b', outline: 'none' }}
            >
              <option value="">All Standards</option>
              {availableGrades.map(g => <option key={g} value={g}>Standard {g}</option>)}
            </select>
            <select 
              value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#64748b', outline: 'none' }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                style={{ 
                  padding: '10px 20px', borderRadius: 12, border: '1px solid #e2e8f0', 
                  background: showFilters ? '#0ea5e9' : '#fff', color: showFilters ? '#fff' : '#64748b',
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700
                }}
              >
                <Filter size={18} /> More Filters
              </button>
              <AnimatePresence>
                {showFilters && (
                  <>
                    <div onClick={() => setShowFilters(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{ 
                        position: 'absolute', right: 0, top: 'calc(100% + 12px)', width: 280, background: '#fff', 
                        borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, zIndex: 50, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1e293b' }}>Advanced Filters</h4>
                        <button 
                          onClick={() => setFilters({ specialization: '', status: '', grade: '' })}
                          style={{ border: 'none', background: 'none', color: '#0ea5e9', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >Reset All</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specialization</label>
                          <select 
                            value={filters.specialization} onChange={e => setFilters({ ...filters, specialization: e.target.value })}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, outline: 'none', color: '#1e293b' }}
                          >
                            <option value="">All Specializations</option>
                            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Table Container */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Instructor</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employee ID</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Specialization</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading directory...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>No teachers found.</td></tr>
                ) : filtered.map((t, idx) => (
                  <tr 
                    key={t.id} 
                    onClick={() => setSelectedTeacherId(t.id)}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s', cursor: 'pointer' }}
                    className="hover:bg-slate-50"
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, shadow: '0 4px 12px rgba(14,165,233,0.15)' }}>
                          {t.profile_photo ? <img src={t.profile_photo} style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover' }} /> : (t.user?.first_name?.[0] || 'T')}
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
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: 8 }}>{t.specialization || 'General'}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8,
                        background: t.status === 'active' ? '#f0fdf4' : '#fef2f2',
                        color: t.status === 'active' ? '#15803d' : '#b91c1c',
                        fontSize: 11, fontWeight: 700, border: `1px solid ${t.status === 'active' ? '#dcfce7' : '#fee2e2'}`
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {t.status === 'active' ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
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
        </>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', padding: 20 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#fff', borderRadius: 32, width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '24px 40px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', margin: 0 }}>{editingId ? 'Refine Instructor Profile' : 'Onboard New Instructor'}</h3>
                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 36, height: 36, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} color="#64748b" /></button>
              </div>
              <form onSubmit={saveTeacher} style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>
                {/* Personal Section */}
                <div>
                   <h4 style={{ fontSize: 12, fontWeight: 900, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <User size={14} /> Personal Information
                      <div style={{ flex: 1, height: 1, background: '#e0f2fe' }} />
                   </h4>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <InputField label="First Name" icon={User} value={form.user.first_name} onChange={e => setForm({ ...form, user: { ...form.user, first_name: e.target.value } })} required />
                      <InputField label="Last Name" icon={User} value={form.user.last_name} onChange={e => setForm({ ...form, user: { ...form.user, last_name: e.target.value } })} required />
                      <InputField label="Email Address" icon={Mail} value={form.user.email} onChange={e => setForm({ ...form, user: { ...form.user, email: e.target.value } })} required type="email" />
                      <InputField label="Phone Number" icon={Phone} value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} required />
                      <SelectField label="Gender" icon={Shield} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} options={[{value: 'male', label: 'Male'}, {value: 'female', label: 'Female'}, {value: 'other', label: 'Other'}]} />
                      <InputField label="Date of Birth" icon={Calendar} type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                   </div>
                </div>

                {/* Professional Section */}
                <div>
                   <h4 style={{ fontSize: 12, fontWeight: 900, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Briefcase size={14} /> Professional Metadata
                      <div style={{ flex: 1, height: 1, background: '#f3e8ff' }} />
                   </h4>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <InputField label="Employee ID" icon={Hash} value={editingId ? form.employee_id : ''} onChange={e => setForm({ ...form, employee_id: e.target.value })} disabled={!editingId} placeholder={editingId ? "e.g. EMP-12345" : "(System Generated)"} />
                      <InputField label="Specialization" icon={Briefcase} value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Mathematics" />
                      <InputField label="Qualification" icon={GraduationCap} value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. PhD in Physics" />
                      <InputField label="Experience (Years)" icon={Activity} type="number" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })} />
                      <InputField label="Joining Date" icon={Calendar} type="date" value={form.joining_date} onChange={e => setForm({ ...form, joining_date: e.target.value })} />
                      <InputField label="Monthly Base Salary ($)" icon={CreditCard} type="number" value={form.monthly_salary} onChange={e => setForm({ ...form, monthly_salary: e.target.value })} required />
                   </div>
                </div>

                {/* Address & Bio Section */}
                <div>
                   <h4 style={{ fontSize: 12, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <MapPin size={14} /> Address & Bio
                      <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                   </h4>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <TextAreaField label="Current Address" icon={MapPin} value={form.current_address} onChange={e => setForm({ ...form, current_address: e.target.value })} />
                      <TextAreaField label="Permanent Address" icon={MapPin} value={form.permanent_address} onChange={e => setForm({ ...form, permanent_address: e.target.value })} />
                      <div style={{ gridColumn: 'span 2' }}>
                         <TextAreaField label="Instructor Biography" icon={BookOpen} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} />
                      </div>
                   </div>
                </div>

                {!editingId && (
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Shield size={14} /> Security Setup
                        <div style={{ flex: 1, height: 1, background: '#fef3c7' }} />
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div style={{ position: 'relative' }}>
                        <InputField label="Initial Password" icon={Shield} value={form.user.password} onChange={e => setForm({ ...form, user: { ...form.user, password: e.target.value } })} required type={showAddPass ? "text" : "password"} />
                        <button type="button" onClick={() => setShowAddPass(!showAddPass)} style={{ position: 'absolute', right: 12, top: 32, border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                          {showAddPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <InputField label="Confirm Initial Password" icon={Lock} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required type="password" />
                    </div>
                    <p style={{ marginTop: 8, fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>Establish a strong password (8+ chars, with uppercase, number & symbol).</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
                  <button type="submit" disabled={saving} style={{ flex: 2, padding: '16px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 16, cursor: 'pointer', shadow: '0 10px 15px -3px rgba(14,165,233,0.3)' }}>
                    {saving ? 'Synchronizing...' : editingId ? 'Update Instructor' : 'Register Instructor'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '16px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 16, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Action Modal */}
      <AnimatePresence>
        {showResetActionModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', padding: 20 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: '#fff', borderRadius: 32, width: '100%', maxWidth: 500, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b', margin: 0 }}>Review Reset Request</h3>
                  <button onClick={() => setShowResetActionModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 36, height: 36, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} color="#64748b" /></button>
                </div>
                
                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 20, marginBottom: 24 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Teacher Account</p>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{activeRequest?.teacher_name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{activeRequest?.teacher_emp_id}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <InputField label="Assign Temporary Access Key" icon={Lock} value={tempPass} onChange={e => setTempPass(e.target.value)} placeholder="e.g. Temp@123" />
                  <TextAreaField label="Administrative Note (Internal)" value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Reason for approval/rejection..." />
                  
                  <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                    <button 
                      onClick={() => handleProcessRequest('approve')}
                      disabled={processing}
                      style={{ flex: 1, padding: '14px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, cursor: 'pointer' }}
                    >
                      Approve & Set Key
                    </button>
                    <button 
                      onClick={() => handleProcessRequest('reject')}
                      disabled={processing}
                      style={{ flex: 1, padding: '14px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 14, fontWeight: 800, cursor: 'pointer' }}
                    >
                      Reject Request
                    </button>
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTeachersView;
