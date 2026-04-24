import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, Filter, MoreVertical, 
  UserPlus, Mail, Phone, Hash, BookOpen, Trash2, Edit2, X,
  Target, Stethoscope, MapPin, Activity, Clock, CreditCard, ClipboardList,
  CheckCircle, AlertCircle, Calendar, GraduationCap, Info
} from 'lucide-react';
import api from '../../api';

// Reusable Components
const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", required = false, readOnly }) => (
  <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        required={required}
        readOnly={readOnly}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-[15px] font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, value, onChange, options, required = false }) => (
  <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
      <select
        required={required}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-10 py-4 text-[15px] font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none shadow-sm cursor-pointer"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:translate-y-[-40%] transition-transform">
         <Filter size={14} />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5',
    inactive: 'bg-slate-50 text-slate-500 border-slate-100 shadow-slate-500/5',
    lead: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-500/5',
    pending_renewal: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5',
    completed: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-500/5',
    discontinued: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/5',
  };
  
  const normalizedStatus = status === 'new' ? 'lead' : status;
  const label = normalizedStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black border uppercase tracking-widest transition-all ${styles[normalizedStatus] || styles.inactive} shadow-sm inline-flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${normalizedStatus === 'active' ? 'bg-emerald-500' : 'bg-current'} opacity-80`} />
      {label}
    </span>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    <Icon size={14} /> {label}
  </button>
);

const StudentProfile = ({ student, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [history, setHistory] = useState({ attendance: [], payments: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (student) fetchHistory();
  }, [student]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const [att, pay] = await Promise.all([
        api.get(`/attendance/?student=${student.id}`),
        api.get(`/student-payments/?student=${student.id}`)
      ]);
      setHistory({ attendance: att.data, payments: pay.data });
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Profile Header */}
        <div className="bg-slate-50 px-10 py-8 border-b border-slate-200 flex justify-between items-start">
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-indigo-200">
              {student.user.first_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-slate-900">{student.user.first_name} {student.user.last_name}</h2>
                <StatusBadge status={student.status} />
                <StatusBadge status={student.plan_status} />
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-4">
                <span className="flex items-center gap-1.5"><Hash size={14} /> {student.student_id}</span>
                <span className="flex items-center gap-1.5"><GraduationCap size={14} /> Grade {student.grade}</span>
                <span className="flex items-center gap-1.5"><Mail size={14} /> {student.user.email}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(student)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm">
              <Edit2 size={20} />
            </button>
            <button onClick={onClose} className="p-3 bg-slate-200/50 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-10 py-4 border-b border-slate-100 flex gap-2">
            <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={Info} label="Summary" />
            <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={Activity} label="Attendance" />
            <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={CreditCard} label="Payments" />
            <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={ClipboardList} label="Admin Notes" />
          </div>

          <div className="flex-1 overflow-y-auto px-10 py-8">
            <AnimatePresence mode="wait">
              {activeTab === 'summary' && (
                <motion.div key="summary" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Academic Plan</h4>
                      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Plan Type</p>
                          <p className="text-sm font-black text-slate-800 capitalize">{student.plan_type.replace('-', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Sessions/Week</p>
                          <p className="text-sm font-black text-slate-800">{student.sessions_per_week}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Batch</p>
                          <p className="text-sm font-black text-slate-800">{student.batch || 'Not assigned'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Syllabus</p>
                          <p className="text-sm font-black text-slate-800">{student.syllabus || 'Not specified'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Subjects</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {student.subjects?.map(s => (
                              <span key={s.id} className="bg-white px-3 py-1 rounded-full text-[11px] font-bold text-indigo-600 border border-indigo-100 shadow-sm">{s.name}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Contact & Location</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Phone size={18} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Parent Contact</p>
                            <p className="text-sm font-black text-slate-800">{student.parent_contact || 'None'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><MapPin size={18} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                            <p className="text-sm font-black text-slate-800">{student.location || 'Not recorded'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-1">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600"><MapPin size={18} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Permanent Address</p>
                            <p className="text-sm font-black text-slate-800 leading-relaxed">{student.permanent_address || 'Address not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </motion.div>
              )}

              {activeTab === 'attendance' && (
                <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <table className="w-full">
                    <thead className="text-left">
                      <tr className="border-b border-slate-100">
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher</th>
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {history.attendance.map(h => (
                        <tr key={h.id}>
                          <td className="py-4 text-sm font-bold text-slate-600">{h.date}</td>
                          <td className="py-4"><StatusBadge status={h.status} /></td>
                          <td className="py-4 text-sm font-black text-slate-800">{h.teacher_name || 'System'}</td>
                          <td className="py-4 text-xs text-slate-500 italic">{h.notes || 'No comments'}</td>
                        </tr>
                      ))}
                      {history.attendance.length === 0 && <tr><td colSpan={4} className="py-20 text-center text-slate-400 italic">No attendance records found</td></tr>}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <div className="grid grid-cols-1 gap-4">
                      {history.payments.map(p => (
                        <div key={p.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex justify-between items-center">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm"><CreditCard size={20} /></div>
                            <div>
                              <p className="text-lg font-black text-slate-900">${p.amount}</p>
                              <p className="text-xs font-bold text-slate-400 uppercase">{p.month} — {p.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-[11px] font-black text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-100">{p.payment_method || 'GENERIC'}</span>
                            <StatusBadge status={p.status} />
                          </div>
                        </div>
                      ))}
                      {history.payments.length === 0 && <div className="py-20 text-center text-slate-400 italic">No payment records found</div>}
                   </div>
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex gap-4">
                    <Info className="text-amber-600" size={24} />
                    <div>
                      <h5 className="font-black text-amber-900 mb-1">Administrative Observation</h5>
                      <p className="text-sm text-amber-800 leading-relaxed italic">"{student.bio || 'No administrative observations recorded for this student yet.'}"</p>
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] flex gap-4">
                    <Stethoscope className="text-indigo-600" size={24} />
                    <div>
                      <h5 className="font-black text-indigo-900 mb-1">Medical & Special Needs</h5>
                      <p className="text-sm text-indigo-800 leading-relaxed">{student.medical_info || student.special_requirements || 'No special requirements noted.'}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdminStudentsView = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', grade: '', subjects: '', year: '' });
  const [lifecycleTab, setLifecycleTab] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Form State
  const [form, setForm] = useState({
    user: { username: '', email: '', first_name: '', last_name: '', password: 'Student@123' },
    student_id: '', grade: '', parent_name: '', parent_contact: '', bio: '', medical_info: '',
    subject_ids: [], plan_type: 'one-on-one', syllabus: '', sessions_per_week: 1,
    location: '', learning_goals: '', special_requirements: '',
    status: 'active', plan_status: 'lead',
    assigned_teacher: '', lead_source: 'Walk-in', reference_by: '',
    batch: 'Morning Batch', permanent_address: ''
  });

  useEffect(() => { 
    fetchStudents(); 
    fetchSubjects();
    fetchTeachers();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Direct Search/Filter API support
      let url = `/students/?search=${search}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.grade) url += `&grade=${filters.grade}`;
      if (filters.subjects) url += `&subjects=${filters.subjects}`;
      if (lifecycleTab) url += `&plan_status=${lifecycleTab}`;
      
      const resp = await api.get(url);
      setStudents(resp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const resp = await api.get('/subjects/');
      setSubjects(resp.data);
    } catch (e) {}
  };

  const fetchTeachers = async () => {
    try {
      const resp = await api.get('/teachers/');
      setTeachers(resp.data);
    } catch (e) {}
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filters, lifecycleTab]);

  const resetForm = () => {
    setForm({
      user: { username: '', email: '', first_name: '', last_name: '', password: 'Student@123' },
      student_id: '', grade: '', parent_name: '', parent_contact: '', bio: '', medical_info: '',
      subject_ids: [], plan_type: 'one-on-one', syllabus: '', sessions_per_week: 1,
      location: '', learning_goals: '', special_requirements: '',
      status: 'active', plan_status: 'lead',
      assigned_teacher: '', lead_source: 'Walk-in', reference_by: '',
      batch: 'Morning Batch', permanent_address: ''
    });
    setEditingId(null);
  };

  const handleEdit = (s) => {
    setForm({
      user: { 
        username: s.user.username, email: s.user.email, 
        first_name: s.user.first_name, last_name: s.user.last_name, 
        password: '' 
      },
      student_id: s.student_id, grade: s.grade, 
      parent_name: s.parent_name, parent_contact: s.parent_contact, bio: s.bio, medical_info: s.medical_info,
      subject_ids: s.subjects?.map(sub => sub.id) || [],
      plan_type: s.plan_type, syllabus: s.syllabus, sessions_per_week: s.sessions_per_week,
      location: s.location, learning_goals: s.learning_goals, special_requirements: s.special_requirements,
      status: s.status, plan_status: s.plan_status,
      assigned_teacher: s.assigned_teacher || '', lead_source: s.lead_source || 'Walk-in', reference_by: s.reference_by || '',
      batch: s.batch || 'Morning Batch', permanent_address: s.permanent_address || ''
    });
    setEditingId(s.id);
    setShowModal(true);
    setSelectedStudent(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { 
        ...form,
        sessions_per_week: parseInt(form.sessions_per_week) || 1
      };
      
      if (!payload.assigned_teacher) payload.assigned_teacher = null;
      
      // Sync username with email for authentication
      if (!payload.user.username) {
        payload.user.username = payload.user.email;
      }

      if (!payload.user.password) delete payload.user.password;

      if (editingId) {
        await api.patch(`/students/${editingId}/`, payload);
      } else {
        await api.post(`/students/`, payload);
      }
      setShowModal(false); resetForm(); fetchStudents();
    } catch (e) {
      alert(e.response?.data ? JSON.stringify(e.response.data) : "An error occurred");
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete record permanently?")) return;
    await api.delete(`/students/${id}/`);
    fetchStudents();
  };

  const availableYears = [...new Set(students.filter(s => s.enrolled_date).map(s => String(new Date(s.enrolled_date).getFullYear())))].sort((a,b) => b - a);

  const visibleStudents = students.filter(s => {
    if (filters.year && s.enrolled_date) {
      if (String(new Date(s.enrolled_date).getFullYear()) !== String(filters.year)) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Student Hub</h2>
          <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Manage student enrollment, profiles and academic status</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: 14, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Enrolled: {students.length}</span>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#0ea5e9',
              color: '#fff', borderRadius: 14, border: 'none', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(14,165,233,0.2)'
            }}
          >
            <UserPlus size={18} /> Register Student
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', padding: '8px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <Search size={18} color="#94a3b8" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search students by name, ID, phone or email..."
            style={{ background: 'none', border: 'none', outline: 'none', flex: 1, color: '#1e293b', fontSize: 14 }}
          />
        </div>
        <select 
          value={lifecycleTab} onChange={e => setLifecycleTab(e.target.value)}
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#64748b', outline: 'none' }}
        >
          <option value="">All States</option>
          <option value="lead">Lead</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="pending_renewal">Renewal</option>
          <option value="discontinued">Discontinued</option>
        </select>
        <select 
          value={filters.grade} onChange={e => setFilters({...filters, grade: e.target.value})}
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#64748b', outline: 'none' }}
        >
          <option value="">All Standards</option>
          {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '12+'].map(g => (
            <option key={g} value={g}>Standard {g}</option>
          ))}
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
                      onClick={() => setFilters({ status: '', grade: '', subjects: '', year: '' })}
                      style={{ border: 'none', background: 'none', color: '#0ea5e9', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >Reset All</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                      <select 
                        value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, outline: 'none', color: '#1e293b' }}
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enrollment Year</label>
                      <select 
                        value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, outline: 'none', color: '#1e293b' }}
                      >
                        <option value="">All Years</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
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
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Student Profiles</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Guardian Info</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Standard</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading directory...</td></tr>
            ) : visibleStudents.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>No students found.</td></tr>
            ) : visibleStudents.map((s, idx) => (
              <tr 
                key={s.id} 
                onClick={() => setSelectedStudent(s)}
                style={{ borderBottom: idx < visibleStudents.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s', cursor: 'pointer' }}
                className="hover:bg-slate-50"
              >
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: 800, fontSize: 18, shadow: '0 4px 12px rgba(99,102,241,0.15)' }}>
                       <div className="flex items-center justify-center w-full h-full">{s.user?.first_name?.[0]}</div>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{s.user?.first_name} {s.user?.last_name}</p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: 12 }}>{s.student_id}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{s.parent_name || '—'}</p>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: 12 }}>{s.parent_contact || 'No Contact'}</p>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#4338ca', background: '#eef2ff', padding: '4px 10px', borderRadius: 8 }}>Standard {s.grade}</span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <StatusBadge status={s.status} />
                  </div>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={() => handleEdit(s)} title="Edit" style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => del(s.id)} title="Delete" style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Profile Detail View */}
      <AnimatePresence>
        {selectedStudent && <StudentProfile student={selectedStudent} onClose={() => setSelectedStudent(null)} onEdit={handleEdit} />}
      </AnimatePresence>

      {/* Register/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
              <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">{editingId ? 'Refine Profile' : 'Onboard Student'}</h3>
                  <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-[0.2em]">{editingId ? 'Update existing credentials' : 'Initialize system enrollment lifecycle'}</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="w-14 h-14 bg-white border border-slate-100 rounded-[1.2rem] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>
              {/* Form Content */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={save} className="p-12 space-y-16">
                  {/* Section 1: Identity & Access */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">01</span>
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Identity & Access Control</h4>
                       <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <InputField label="First Name" icon={Users} value={form.user.first_name} onChange={e => setForm({...form, user: {...form.user, first_name: e.target.value}})} required />
                      <InputField label="Last Name" icon={Users} value={form.user.last_name} onChange={e => setForm({...form, user: {...form.user, last_name: e.target.value}})} required />
                      <InputField label="Official Email" icon={Mail} value={form.user.email} onChange={e => setForm({...form, user: {...form.user, email: e.target.value}})} required type="email" />
                      {!editingId && <InputField label="Access Key (Pass)" icon={Hash} value={form.user.password} onChange={e => setForm({...form, user: {...form.user, password: e.target.value}})} required />}
                      <InputField label="Internal ID" icon={Hash} value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} placeholder="System Generated" />
                      <InputField label="Target Standard" icon={GraduationCap} value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} required placeholder="e.g. 10th" />
                    </div>
                  </div>

                  {/* Section 2: Guardian & Contact */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">02</span>
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Guardian & Contact Dossier</h4>
                       <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="Primary Guardian" icon={Users} value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} placeholder="Parent / Guardian Name" />
                      <InputField label="Emergency Contact" icon={Phone} value={form.parent_contact} onChange={e => setForm({...form, parent_contact: e.target.value})} placeholder="+1 (555) 000-0000" />
                      <div className="md:col-span-2">
                         <InputField label="Residential/Permanent Address" icon={MapPin} value={form.permanent_address} onChange={e => setForm({...form, permanent_address: e.target.value})} placeholder="Full physical address for official correspondence..." />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Academic Strategy */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">03</span>
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Academic Strategy & Lead Tracking</h4>
                       <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <SelectField 
                        label="Learning Plan" icon={ClipboardList} value={form.plan_type} 
                        onChange={e => setForm({...form, plan_type: e.target.value})}
                        options={[
                          {value: 'one-on-one', label: 'One-on-One Session'},
                          {value: 'batch', label: 'Standard Batch'},
                          {value: 'twin', label: 'Twin Sessions'},
                          {value: 'revision', label: 'Revision Program'}
                        ]}
                      />
                      <InputField label="Frequency / Week" icon={Clock} type="number" value={form.sessions_per_week} onChange={e => setForm({...form, sessions_per_week: e.target.value})} required />
                      <InputField label="Target Syllabus" icon={BookOpen} value={form.syllabus} onChange={e => setForm({...form, syllabus: e.target.value})} placeholder="IB, IGCSE, NCERT..." />
                      
                      <SelectField
                        label="Assign Mentor" icon={UserPlus} value={form.assigned_teacher}
                        onChange={e => setForm({...form, assigned_teacher: e.target.value})}
                        options={[
                          {value: '', label: 'No Mentor Assigned'},
                          ...teachers.map(t => ({ value: t.id, label: `${t.user.first_name} ${t.user.last_name}` }))
                        ]}
                      />

                      <SelectField 
                        label="Operating Batch" icon={Clock} value={form.batch} 
                        onChange={e => setForm({...form, batch: e.target.value})}
                        options={[
                          {value: 'Morning Batch', label: 'Morning Registry'},
                          {value: 'Evening Batch', label: 'Evening Registry'}
                        ]}
                      />

                      <div className="flex flex-col gap-3">
                          <SelectField
                            label="Acquisition Source" icon={Target} 
                            value={["Walk-in", "Parent Reference", "Student Reference", "Social Media", "Advertisement", "Website", "Existing Student Referral", "Teacher Referral"].includes(form.lead_source) ? form.lead_source : "Other"}
                            onChange={e => setForm({...form, lead_source: e.target.value === 'Other' ? '' : e.target.value})}
                            options={[
                              {value: 'Walk-in', label: 'Direct Walk-in'},
                              {value: 'Parent Reference', label: 'Parent Referral'},
                              {value: 'Student Reference', label: 'Student Referral'},
                              {value: 'Social Media', label: 'Social Media Platform'},
                              {value: 'Advertisement', label: 'Marketing Campaign'},
                              {value: 'Website', label: 'Digital Portal'},
                              {value: 'Existing Student Referral', label: 'Student Network'},
                              {value: 'Teacher Referral', label: 'Staff Referral'},
                              {value: 'Other', label: 'Custom Source...'}
                            ]}
                          />
                          { !["Walk-in", "Parent Reference", "Student Reference", "Social Media", "Advertisement", "Website", "Existing Student Referral", "Teacher Referral"].includes(form.lead_source) && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                              <input 
                                type="text"
                                value={form.lead_source}
                                onChange={e => setForm({...form, lead_source: e.target.value})}
                                placeholder="Specify custom source..."
                                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl px-5 py-4 text-sm font-bold text-emerald-900 outline-none focus:border-emerald-500 transition-all"
                              />
                            </motion.div>
                          )}
                          { ["Parent Reference", "Student Reference", "Existing Student Referral", "Teacher Referral"].includes(form.lead_source) && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                              <input 
                                type="text"
                                value={form.reference_by}
                                onChange={e => setForm({...form, reference_by: e.target.value})}
                                placeholder="Referring Authority / Name..."
                                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl px-5 py-4 text-sm font-bold text-emerald-900 outline-none focus:border-emerald-500 transition-all shadow-sm"
                              />
                            </motion.div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Personalized Insights */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                       <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">04</span>
                       <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Personalized Insights & Goals</h4>
                       <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Core Learning Objectives</label>
                        <textarea 
                           value={form.learning_goals} onChange={e => setForm({...form, learning_goals: e.target.value})}
                           rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-[15px] font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:shadow-xl focus:shadow-indigo-500/5 transition-all" 
                           placeholder="Primary academic targets and milestones..."
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Special Clinical/Medical Provisions</label>
                        <textarea 
                           value={form.special_requirements} onChange={e => setForm({...form, special_requirements: e.target.value})}
                           rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-[15px] font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:shadow-xl focus:shadow-indigo-500/5 transition-all" 
                           placeholder="Allergies, learning disabilities, or critical constraints..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div className="pt-12 border-t border-slate-100 flex items-center gap-6">
                    <button 
                      type="submit" 
                      disabled={saving} 
                      className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-slate-900/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                    >
                      {saving ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {editingId ? 'Update Dossier' : 'Initialize Enrollment'}
                          <CheckCircle size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="px-12 py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-lg hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudentsView;
