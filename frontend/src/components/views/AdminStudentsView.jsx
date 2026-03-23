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
const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", required = false }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, value, onChange, options, required = false }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <select
        required={required}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all appearance-none"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
    </div>
  </div>
);

const StatusBadge = ({ status, type = "general" }) => {
  const styles = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    pending_renewal: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    scheduled_leave: 'bg-purple-100 text-purple-700 border-purple-200',
    discontinued: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  
  const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status] || styles.inactive}`}>
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', grade: '', subjects: '' });
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
    status: 'active', plan_status: 'new'
  });

  useEffect(() => { 
    fetchStudents(); 
    fetchSubjects();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Direct Search/Filter API support
      let url = `/students/?search=${search}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.grade) url += `&grade=${filters.grade}`;
      if (filters.subjects) url += `&subjects=${filters.subjects}`;
      
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filters]);

  const resetForm = () => {
    setForm({
      user: { username: '', email: '', first_name: '', last_name: '', password: 'Student@123' },
      student_id: '', grade: '', parent_name: '', parent_contact: '', bio: '', medical_info: '',
      subject_ids: [], plan_type: 'one-on-one', syllabus: '', sessions_per_week: 1,
      location: '', learning_goals: '', special_requirements: '',
      status: 'active', plan_status: 'new'
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
      status: s.status, plan_status: s.plan_status
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

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Student Hub</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1 italic">Manage your future stars</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-3 px-8 py-4 bg-[#4f46e5] text-white rounded-3xl font-black shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus size={20} /> Register Student
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/30">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={20} />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by identity, phone or email..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-4 text-slate-900 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold" 
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
            className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black text-slate-600 outline-none hover:border-indigo-100 transition-all"
          >
            <option value="">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-2xl border transition-all ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'}`}
            >
              <Filter size={20} />
            </button>

            {/* Filter Overlay */}
            <AnimatePresence>
              {showFilters && (
                <>
                  <div className="fixed inset-0 z-[80]" onClick={() => setShowFilters(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-[90] space-y-6"
                  >
                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                      <h4 className="text-sm font-black text-slate-900">Refine Search</h4>
                      <button 
                        onClick={() => setFilters({ status: '', grade: '', subjects: '' })}
                        className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                      >
                        Reset All
                      </button>
                    </div>

                    {/* Grade Filter */}
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Level</label>
                       <select 
                         value={filters.grade} 
                         onChange={e => setFilters({...filters, grade: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                       >
                         <option value="">All Grades</option>
                         {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(g => (
                           <option key={g} value={g}>Grade {g}</option>
                         ))}
                         <option value="12+">University / Other</option>
                       </select>
                    </div>

                    {/* Subjects Filter */}
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Focus</label>
                       <select 
                         value={filters.subjects} 
                         onChange={e => setFilters({...filters, subjects: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none"
                       >
                         <option value="">All Subjects</option>
                         {subjects.map(s => (
                           <option key={s.id} value={s.id}>{s.name}</option>
                         ))}
                       </select>
                    </div>

                    <button 
                      onClick={() => setShowFilters(false)}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg hover:bg-slate-800 transition-all"
                    >
                      Apply Filters
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student & Mail</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Parent Details</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Course / Subjects</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="py-24 text-center"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto opacity-20" /></td></tr>
            ) : students.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedStudent(s)}>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-100">
                      {s.user?.first_name?.[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-base">{s.user?.first_name} {s.user?.last_name}</p>
                      <p className="text-xs text-indigo-500 font-bold">{s.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <p className="text-sm font-black text-slate-800">{s.parent_name || 'N/A'}</p>
                  <p className="text-xs text-slate-500 font-bold">{s.parent_contact || 'No contact'}</p>
                </td>
                <td className="px-10 py-6">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {s.subjects?.slice(0, 3).map(sub => (
                      <span key={sub.id} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-md border border-slate-200 mb-1">{sub.name}</span>
                    ))}
                    {s.subjects?.length > 3 && <span className="text-[10px] text-slate-400 font-bold">+{s.subjects.length - 3} more</span>}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">Grade {s.grade}</p>
                </td>
                <td className="px-10 py-6 text-center">
                   <StatusBadge status={s.status} />
                </td>
                <td className="px-10 py-6 text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-flex-end gap-2">
                    <button onClick={() => handleEdit(s)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => del(s.id)} className="p-3 bg-white border border-rose-100 rounded-xl text-rose-400 hover:bg-rose-50 transition-all"><Trash2 size={16} /></button>
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
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{editingId ? 'Refine Profile' : 'Student Onboarding'}</h3>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"><X size={20} color="#64748b" /></button>
              </div>
              <form onSubmit={save} className="p-10 flex flex-col gap-10">
                {/* Section: Identity */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-8 h-px bg-indigo-500/20" /> Identity Information
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="First Name" icon={Users} value={form.user.first_name} onChange={e => setForm({...form, user: {...form.user, first_name: e.target.value}})} required />
                    <InputField label="Last Name" icon={Users} value={form.user.last_name} onChange={e => setForm({...form, user: {...form.user, last_name: e.target.value}})} required />
                    <InputField label="Official Email" icon={Mail} value={form.user.email} onChange={e => setForm({...form, user: {...form.user, email: e.target.value}})} required type="email" />
                    {!editingId && <InputField label="Portal Password" icon={Hash} value={form.user.password} onChange={e => setForm({...form, user: {...form.user, password: e.target.value}})} required />}
                    <InputField label="Student ID" icon={Hash} value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} placeholder="Auto-gen if empty" />
                    <InputField label="Grade Level" icon={GraduationCap} value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} required placeholder="e.g. 10th" />
                    <InputField label="Parent/Guardian Name" icon={Users} value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} placeholder="Full Name" />
                    <InputField label="Parent Contact" icon={Phone} value={form.parent_contact} onChange={e => setForm({...form, parent_contact: e.target.value})} placeholder="+1 234..." />
                  </div>
                </div>

                {/* Section: Academic Plan */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-8 h-px bg-indigo-500/20" /> Academic Strategy
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <SelectField 
                      label="Plan Type" icon={ClipboardList} value={form.plan_type} 
                      onChange={e => setForm({...form, plan_type: e.target.value})}
                      options={[
                        {value: 'one-on-one', label: 'One-on-One'},
                        {value: 'batch', label: 'Batch'},
                        {value: 'twin', label: 'Twin'},
                        {value: 'revision', label: 'Revision'}
                      ]}
                    />
                    <InputField label="Sessions/Week" icon={Clock} type="number" value={form.sessions_per_week} onChange={e => setForm({...form, sessions_per_week: e.target.value})} required />
                    <InputField label="Syllabus" icon={BookOpen} value={form.syllabus} onChange={e => setForm({...form, syllabus: e.target.value})} placeholder="IB, IGCSE, NCERT..." />
                    <InputField label="Location/Center" icon={MapPin} value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Main Wing, Online..." />
                    
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subjects Enrolled</label>
                      <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        {subjects.map(s => (
                          <button
                            key={s.id} type="button"
                            onClick={() => {
                              const news = form.subject_ids.includes(s.id) 
                                ? form.subject_ids.filter(id => id !== s.id)
                                : [...form.subject_ids, s.id];
                              setForm({...form, subject_ids: news});
                            }}
                            className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                              form.subject_ids.includes(s.id) 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Goals & Requirements */}
                <div className="space-y-6">
                   <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-8 h-px bg-indigo-500/20" /> Personalized Needs
                  </h4>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Learning Goals</label>
                      <textarea 
                         value={form.learning_goals} onChange={e => setForm({...form, learning_goals: e.target.value})}
                         rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 outline-none focus:border-indigo-500" 
                         placeholder="What does the student aim to achieve?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Special Requirements / Medical</label>
                      <textarea 
                         value={form.special_requirements} onChange={e => setForm({...form, special_requirements: e.target.value})}
                         rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 outline-none focus:border-indigo-500" 
                         placeholder="Health notes, learning disabilities, or special scheduling needs..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Lifecycle Status */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-8 h-px bg-indigo-500/20" /> Status Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <SelectField 
                      label="Operational Status" icon={Activity} value={form.status} 
                      onChange={e => setForm({...form, status: e.target.value})}
                      options={[{value: 'active', label: 'Active'}, {value: 'inactive', label: 'Inactive'}]}
                    />
                    <SelectField 
                      label="Lifecycle State" icon={Calendar} value={form.plan_status} 
                      onChange={e => setForm({...form, plan_status: e.target.value})}
                      options={[
                        {value: 'new', label: 'New'},
                        {value: 'active', label: 'Active'},
                        {value: 'pending_renewal', label: 'Pending Renewal'},
                        {value: 'inactive', label: 'Inactive'},
                        {value: 'completed', label: 'Completed'},
                        {value: 'scheduled_leave', label: 'Scheduled Leave'},
                        {value: 'discontinued', label: 'Discontinued'}
                      ]}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-10 border-t border-slate-100">
                  <button type="submit" disabled={saving} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-[0.99]">
                    {saving ? 'Processing Neural Data...' : editingId ? 'Update Identity' : 'Authorize Student'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="px-10 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-lg">Dismiss</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudentsView;
