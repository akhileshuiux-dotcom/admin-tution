import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Phone, BookOpen, Hash, User, Mail, 
  Filter, X, Plus, GraduationCap, ClipboardList, Clock, 
  MapPin, Target, CheckCircle, Activity, Calendar, UserPlus,
  ChevronDown, ChevronUp, Star, Award, ShieldCheck
} from 'lucide-react';
import api from '../../api';

// Reusable Components matching high-fidelity standard
const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", required = false }) => (
  <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-[15px] font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, value, onChange, options, required = false }) => (
  <div className="flex flex-col gap-2 flex-1 min-w-[240px]">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
      <select
        required={required}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-12 pr-10 py-4 text-[15px] font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none shadow-sm cursor-pointer"
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
    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest transition-all ${styles[normalizedStatus] || styles.inactive} shadow-sm inline-flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${normalizedStatus === 'active' ? 'bg-emerald-500' : 'bg-current'} opacity-80`} />
      {label}
    </span>
  );
};

const TeacherStudentsView = ({ permissions }) => {
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState({ grade: '', status: '' });
  const [showModal, setShowModal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [subjects, setSubjects] = React.useState([]);

  const [form, setForm] = React.useState({
    user: { first_name: '', last_name: '', email: '', password: 'Student@123' },
    student_id: '', grade: '', parent_name: '', parent_contact: '',
    plan_type: 'one-on-one', plan_status: 'lead', sessions_per_week: 3, 
    lead_source: 'Walk-in', reference_by: '', subject_ids: []
  });

  const hasPerm = (cat, key) => permissions?.[cat]?.[key] === true;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const r = await api.get('/students/');
      setStudents(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStudents();
    api.get('/subjects/').then(r => setSubjects(r.data)).catch(e => console.error(e));
  }, []);

  const resetForm = () => {
    setForm({
      user: { first_name: '', last_name: '', email: '', password: 'Student@123' },
      student_id: '', grade: '', parent_name: '', parent_contact: '',
      plan_type: 'one-on-one', plan_status: 'lead', sessions_per_week: 3, 
      lead_source: 'Walk-in', reference_by: '', subject_ids: []
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/students/', form);
      await fetchStudents();
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to onboard student. Please verify all fields.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const n = `${s.user?.first_name||''} ${s.user?.last_name||''} ${s.user?.username||''}`.toLowerCase();
    const matchesSearch = n.includes(q) || s.student_id?.toLowerCase().includes(q) || s.grade?.toLowerCase().includes(q);
    const matchesGrade = !filters.grade || s.grade === filters.grade;
    const matchesStatus = !filters.status || s.status === filters.status;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const uniqueGrades = React.useMemo(() => {
    const grades = new Set(students.map(s => s.grade).filter(Boolean));
    return Array.from(grades).sort((a, b) => parseInt(a) - parseInt(b));
  }, [students]);

  return (
    <div className="flex flex-col gap-10 max-w-[1400px] mx-auto p-6 pb-24">
      {/* Teacher Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-900 text-white p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight flex items-center gap-4 justify-center md:justify-start">
               Student Directory <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-widest border border-white/30">Teacher Access</span>
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
              <span className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/10 text-white">
                Assigned Capacity: {students.length} Students
              </span>
              <span className="px-5 py-2.5 bg-emerald-500/20 backdrop-blur-md rounded-2xl text-[11px] font-black uppercase tracking-widest border border-emerald-500/30 text-emerald-300">
                Performance: High
              </span>
            </div>
          </div>
          {hasPerm('student', 'add_student') && (
            <div className="flex gap-4">
               <button 
                 onClick={() => { resetForm(); setShowModal(true); }}
                 className="px-10 py-5 bg-white text-indigo-900 hover:scale-105 rounded-2xl transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-3 text-xs font-black uppercase tracking-widest border border-white"
               >
                 <Plus size={20} /> Register Student
               </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Enhanced Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-6 flex items-center gap-6 shadow-xl shadow-slate-200/40">
        <div className="flex-1 flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 group transition-all focus-within:bg-white focus-within:shadow-lg focus-within:shadow-indigo-500/5 focus-within:border-indigo-100">
          <Search size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search students by name, ID or standard..."
            className="bg-transparent border-none outline-none flex-1 text-[15px] font-bold text-slate-800 placeholder-slate-400 w-full"
          />
        </div>
        
        <div className="h-10 w-px bg-slate-100 hidden lg:block" />

        <div className="flex items-center gap-4">
          <select 
            value={filters.grade} onChange={e => setFilters({...filters, grade: e.target.value})}
            className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-widest outline-none hover:bg-white transition-all cursor-pointer shadow-sm"
          >
            <option value="">Standard: All</option>
            {uniqueGrades.map(g => (
              <option key={g} value={g}>Standard {g}</option>
            ))}
          </select>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-8 py-4 rounded-2xl border text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-sm ${
              showFilters ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/20' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
            }`}
          >
            <Filter size={18} /> Advanced
          </button>
        </div>
      </div>

      {/* Student List - Card Based */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Student Roster...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 bg-white rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center gap-4 opacity-40">
             <Users size={48} className="text-slate-300" />
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching student records</p>
          </div>
        ) : (
          filtered.map((s, i) => {
            const name = s.user?.first_name ? `${s.user.first_name} ${s.user.last_name || ''}`.trim() : s.user?.username || s.student_id;
            const isOpen = selectedId === s.id;
            
            return (
              <motion.div 
                key={s.id} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-[2rem] border transition-all ${isOpen ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'border-slate-100 shadow-sm hover:border-slate-300'}`}
              >
                <div 
                  onClick={() => setSelectedId(isOpen ? null : s.id)}
                  className="p-8 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-xl font-black shadow-lg">
                      {name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-[17px] font-black text-slate-900 leading-tight">{name}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[12px] text-slate-400 font-bold uppercase italic tracking-tight">ID: {s.student_id}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-widest italic">Standard {s.grade}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                     <div className="hidden md:flex flex-col items-end">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</p>
                        <StatusBadge status={s.status} />
                     </div>
                     <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                     </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-slate-50 bg-slate-50/50"
                    >
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <DetailItem icon={User} label="Parental Guard" value={s.parent_name} />
                        <DetailItem icon={Phone} label="Emergency Line" value={s.parent_contact} />
                        <DetailItem icon={Mail} label="Academic Mail" value={s.user?.email} />
                        <DetailItem icon={ShieldCheck} label="Academic Strategy" value={s.plan_type} />
                        <DetailItem icon={Award} label="Standard Session" value={s.batch} />
                        <DetailItem icon={Clock} label="Intensity" value={`${s.sessions_per_week} Sessions/Week`} />
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Curriculum Enrolled</label>
                              <div className="flex flex-wrap gap-2">
                                 {s.subjects?.map(sub => (
                                   <span key={sub.id} className="px-4 py-2 bg-white text-[12px] font-black text-indigo-600 rounded-xl border border-indigo-100 shadow-sm uppercase tracking-tight">{sub.name}</span>
                                 ))}
                                 {(!s.subjects || s.subjects.length === 0) && <span className="text-xs text-slate-400 italic font-bold">No subjects allocated yet</span>}
                              </div>
                           </div>
                           <DetailItem icon={Star} label="Academic Objectives" value={s.learning_goals} isLong />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[3.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 flex flex-col"
            >
              <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Register Student</h3>
                  <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-[0.2em]">Add a new student to your assigned cohort</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-14 h-14 bg-white border border-slate-100 rounded-[1.2rem] flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <form onSubmit={save} className="p-12 space-y-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField label="First Name" icon={User} value={form.user.first_name} onChange={e => setForm({...form, user: {...form.user, first_name: e.target.value}})} required />
                    <InputField label="Last Name" icon={User} value={form.user.last_name} onChange={e => setForm({...form, user: {...form.user, last_name: e.target.value}})} required />
                    <InputField label="Email" icon={Mail} value={form.user.email} onChange={e => setForm({...form, user: {...form.user, email: e.target.value}})} required type="email" />
                    <InputField label="Standard" icon={GraduationCap} value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} required placeholder="e.g. 10th" />
                    <InputField label="Guardian Name" icon={Users} value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} required />
                    <InputField label="Guardian Phone" icon={Phone} value={form.parent_contact} onChange={e => setForm({...form, parent_contact: e.target.value})} required />
                    
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
                    
                    <div className="flex flex-col gap-3">
                        <SelectField
                          label="Acquisition Source" icon={Target} 
                          value={form.lead_source}
                          onChange={e => setForm({...form, lead_source: e.target.value})}
                          options={[
                            {value: 'Walk-in', label: 'Direct Walk-in'},
                            {value: 'Parent Reference', label: 'Parent Referral'},
                            {value: 'Student Reference', label: 'Student Referral'},
                            {value: 'Teacher Referral', label: 'Staff Referral'},
                            {value: 'Other', label: 'Other Source'}
                          ]}
                        />
                        { ["Parent Reference", "Student Reference", "Teacher Referral"].includes(form.lead_source) && (
                          <input 
                            type="text"
                            value={form.reference_by}
                            onChange={e => setForm({...form, reference_by: e.target.value})}
                            placeholder="Referring Name..."
                            className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl px-5 py-4 text-sm font-bold text-emerald-900 outline-none"
                          />
                        )}
                    </div>

                    <div className="col-span-full space-y-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Subjects to Enroll</label>
                      <div className="flex flex-wrap gap-2 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        {subjects.map(s => (
                          <button
                            key={s.id} type="button"
                            onClick={() => {
                              const news = form.subject_ids.includes(s.id) 
                                ? form.subject_ids.filter(id => id !== s.id)
                                : [...form.subject_ids, s.id];
                              setForm({...form, subject_ids: news});
                            }}
                            className={`px-5 py-2.5 rounded-xl text-[12px] font-black transition-all border ${
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

                  <div className="pt-12 border-t border-slate-100 flex items-center gap-6">
                    <button type="submit" disabled={saving} className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                      {saving ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Complete Registration'}
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="px-12 py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-lg">Cancel</button>
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

const DetailItem = ({ icon: Icon, label, value, isLong }) => (
  <div className={`flex gap-4 ${isLong ? 'col-span-full' : ''}`}>
    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
       <Icon size={16} className="text-indigo-500" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-[14px] font-bold text-slate-800 ${isLong ? 'leading-relaxed max-w-3xl' : ''}`}>{value || '—'}</p>
    </div>
  </div>
);

export default TeacherStudentsView;
