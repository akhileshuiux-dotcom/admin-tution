import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Mail, Phone, Hash, BookOpen, Clock, 
  CreditCard, ClipboardList, CheckCircle, X,
  GraduationCap, Briefcase, MapPin, Calendar, Info,
  Search, Filter, Plus, Edit2, UserCheck, Shield, Trash2,
  Activity, Map, Eye, EyeOff, Lock
} from 'lucide-react';
import api from '../../api';

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
          fontSize: 14, outline: 'none', background: '#f8fafc', color: '#1e293b', boxSizing: 'border-box', resize: 'vertical'
        }}
      />
    </div>
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14,
      fontSize: 13, fontWeight: 700, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
      background: active ? '#0ea5e9' : 'transparent',
      color: active ? '#fff' : '#64748b',
      boxShadow: active ? '0 10px 15px -3px rgba(14, 165, 233, 0.3)' : 'none'
    }}
  >
    <Icon size={16} /> {label}
  </button>
);

const DetailItem = ({ label, value, icon: Icon, color = "#0ea5e9" }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: '#f8fafc', borderRadius: 20, border: '1px solid #f1f5f9' }}>
    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={20} />
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{value || 'Not provided'}</p>
    </div>
  </div>
);

const TeacherDetailsView = ({ teacherId, onBack, onEdit }) => {
  const [teacher, setTeacher] = useState(null);
  const [activeTab, setActiveTab] = useState('Profile');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loadingTabContent, setLoadingTabContent] = useState(false);
  
  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');

  // Salary Disbursement State
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseForm, setDisburseForm] = useState({
    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    total_amount: 0,
    gross_salary: 0,
    payment_mode: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    transaction_id: '',
    notes: ''
  });
  const [disbursing, setDisbursing] = useState(false);

  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPass, setResetPass] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);

  useEffect(() => {
    fetchTeacherDetails();
  }, [teacherId]);

  const fetchTeacherDetails = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/teachers/${teacherId}/`);
      setTeacher(resp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      // Fetch students who are NOT assigned to THIS teacher
      // Ideally backend supports filter, but for now we fetch all and filter or use specific query
      const resp = await api.get('/students/');
      const filtered = resp.data.filter(s => s.assigned_teacher !== teacherId);
      setAvailableStudents(filtered);
    } catch (e) { console.error(e); }
  };

  const assignStudent = async (studentId) => {
    setAssigning(true);
    try {
      await api.patch(`/students/${studentId}/`, { assigned_teacher: teacherId });
      fetchStudents(); // Refresh current list
      fetchAvailableStudents(); // Refresh modal list
    } catch (e) { alert("Failed to assign student"); }
    finally { setAssigning(false); }
  };

  const unassignStudent = async (studentId) => {
    if (!window.confirm("Unassign this student?")) return;
    try {
      await api.patch(`/students/${studentId}/`, { assigned_teacher: null });
      fetchStudents();
    } catch (e) { alert("Failed to unassign student"); }
  };

  const handleDisburse = async (e) => {
    e.preventDefault();
    setDisbursing(true);
    try {
      await api.post('/salaries/', { ...disburseForm, teacher: teacherId, status: 'paid' });
      setShowDisburseModal(false);
      fetchSalaries();
    } catch (e) { 
      alert(e.response?.data ? JSON.stringify(e.response.data) : "Failed to disburse salary. Check if record for this month already exists."); 
    } finally { setDisbursing(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPass) return;
    
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!strongRegex.test(resetPass)) {
      alert("Password must be 8+ chars with upper, lower, number & special char.");
      return;
    }

    setIsResetting(true);
    try {
      await api.post(`/teachers/${teacherId}/reset_password/`, { password: resetPass });
      alert("Password reset successfully. Teacher will be prompted to change it on next login.");
      setShowResetModal(false);
    } catch (e) {
      alert(e.response?.data?.error || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Students') fetchStudents();
    if (activeTab === 'Salary') fetchSalaries();
    if (activeTab === 'Attendance') fetchAttendance();
  }, [activeTab]);

  const fetchStudents = async () => {
    setLoadingTabContent(true);
    try {
      const resp = await api.get(`/students/?assigned_teacher=${teacherId}`);
      setStudents(resp.data);
    } catch (e) { console.error(e); } finally { setLoadingTabContent(false); }
  };

  const fetchSalaries = async () => {
    setLoadingTabContent(true);
    try {
      const resp = await api.get(`/salaries/?teacher=${teacherId}`);
      setSalaries(resp.data);
    } catch (e) { console.error(e); } finally { setLoadingTabContent(false); }
  };

  const fetchAttendance = async () => {
    setLoadingTabContent(true);
    try {
      const resp = await api.get(`/teacher-attendance/?teacher=${teacherId}`);
      setAttendance(resp.data);
    } catch (e) { console.error(e); } finally { setLoadingTabContent(false); }
  };

  if (loading || !teacher) return (
    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      <div className="animate-spin" style={{ width: 30, height: 30, border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%' }} />
    </div>
  );

  const displayName = `${teacher.user.first_name} ${teacher.user.last_name}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Card */}
      <div style={{ background: '#fff', borderRadius: 32, border: '1px solid #e2e8f0', padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <button 
              onClick={onBack}
              style={{ padding: 12, borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', display: 'flex' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 100, height: 100, borderRadius: 32, background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, shadow: '0 10px 25px -5px rgba(14,165,233,0.4)' }}>
                {teacher.profile_photo ? <img src={teacher.profile_photo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 32 }} /> : teacher.user.first_name[0]}
              </div>
              <div style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 10, background: teacher.status === 'active' ? '#10b981' : '#f43f5e', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={12} color="#fff" />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', margin: 0 }}>{displayName}</h2>
                <span style={{ padding: '4px 12px', background: teacher.status === 'active' ? '#f0fdf4' : '#fef2f2', color: teacher.status === 'active' ? '#15803d' : '#b91c1c', borderRadius: 10, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   {teacher.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Hash size={14} /> {teacher.employee_id}
                </span>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={14} /> {teacher.specialization}
                </span>
              </div>
            </div>
          </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => { setResetPass(''); setShowResetModal(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, color: '#64748b', fontWeight: 700, cursor: 'pointer' }}
              >
                <Shield size={16} /> Reset Password
              </button>
              <button 
                onClick={() => onEdit(teacher)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, color: '#1e293b', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 16, color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>
               Deactivate
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 8, marginTop: 40, background: '#f8fafc', padding: 8, borderRadius: 20, width: 'fit-content', border: '1px solid #f1f5f9' }}>
          <TabButton active={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} icon={Info} label="Core Profile" />
          <TabButton active={activeTab === 'Students'} onClick={() => setActiveTab('Students')} icon={Plus} label="Assigned Students" />
          <TabButton active={activeTab === 'Salary'} onClick={() => setActiveTab('Salary')} icon={CreditCard} label="Salary History" />
          <TabButton active={activeTab === 'Attendance'} onClick={() => setActiveTab('Attendance')} icon={Calendar} label="Attendance Logs" />
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           style={{ background: '#fff', borderRadius: 32, border: '1px solid #e2e8f0', padding: 32, minHeight: 400 }}
        >
          {activeTab === 'Profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {/* Category: Personal Info */}
              <div>
                <h4 style={{ margin: '0 0 20px', fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Personal Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  <DetailItem label="Full Name" value={displayName} icon={UserCheck} />
                  <DetailItem label="Email Address" value={teacher.user.email} icon={Mail} />
                  <DetailItem label="Phone Number" value={teacher.phone_number} icon={Phone} />
                  <DetailItem label="Gender" value={teacher.gender} icon={Shield} />
                  <DetailItem label="Date of Birth" value={teacher.dob} icon={Calendar} />
                </div>
              </div>

              {/* Category: Academic Info */}
              <div>
                <h4 style={{ margin: '0 0 20px', fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Professional Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  <DetailItem label="Qualification" value={teacher.qualification} icon={GraduationCap} color="#8b5cf6" />
                  <DetailItem label="Experience" value={`${teacher.experience_years} Years`} icon={Activity} color="#10b981" />
                  <DetailItem label="Joining Date" value={teacher.joining_date} icon={Calendar} color="#f59e0b" />
                  <DetailItem label="Assigned Classes" value={teacher.assigned_classes?.join(', ')} icon={BookOpen} color="#ec4899" />
                  <DetailItem label="Base Salary" value={`$${teacher.monthly_salary}`} icon={CreditCard} color="#2563eb" />
                </div>
              </div>

              {/* Category: Address & Bio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                <div>
                   <h4 style={{ margin: '0 0 20px', fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Address Information</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <DetailItem label="Permanent Address" value={teacher.permanent_address} icon={MapPin} color="#64748b" />
                      <DetailItem label="Current Address" value={teacher.current_address} icon={Map} color="#64748b" />
                   </div>
                </div>
                <div>
                   <h4 style={{ margin: '0 0 20px', fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Biography</h4>
                   <div style={{ padding: 24, background: '#f8fafc', borderRadius: 24, border: '1px solid #f1f5f9', color: '#475569', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{teacher.bio || "No biography provided for this instructor."}"
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Students' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#1e293b' }}>Assigned Students ({students.length})</h3>
                   <button 
                      onClick={() => { fetchAvailableStudents(); setShowAddModal(true); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#0ea5e9', color: '#fff', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}
                    >
                      <Plus size={16} /> Add Student
                   </button>
                </div>
                {loadingTabContent ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading Students...</div> : (
                  <div style={{ border: '1px solid #f1f5f9', borderRadius: 20, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                       <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                          <tr>
                             <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Student</th>
                             <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Grade</th>
                             <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Batch</th>
                             <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {students.map(s => (
                            <tr key={s.id}>
                              <td style={{ padding: '16px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{s.user.first_name[0]}</div>
                                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{s.user.first_name} {s.user.last_name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748b' }}>{s.grade}</td>
                              <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748b' }}>{s.batch}</td>
                              <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                <button 
                                  onClick={() => unassignStudent(s.id)}
                                  style={{ border: 'none', background: 'transparent', color: '#ef4444', fontWeight: 800, cursor: 'pointer', fontSize: 12 }}
                                >Unassign</button>
                              </td>
                            </tr>
                          ))}
                          {students.length === 0 && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No students assigned to this teacher yet.</td></tr>}
                       </tbody>
                    </table>
                  </div>
                )}
             </div>
          )}

          {activeTab === 'Salary' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#1e293b' }}>Payment History</h3>
                    <button 
                      onClick={() => {
                        setDisburseForm({ ...disburseForm, total_amount: teacher.monthly_salary, gross_salary: teacher.monthly_salary });
                        setShowDisburseModal(true);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#10b981', color: '#fff', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}
                    >
                       <Plus size={16} /> Disburse Salary
                    </button>
                 </div>
                {loadingTabContent ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading Salary...</div> : (
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                      {salaries.map(s => (
                        <div key={s.id} style={{ background: '#f8fafc', padding: 24, borderRadius: 24, border: '1px solid #f1f5f9' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                              <span style={{ fontSize: 14, fontWeight: 900, color: '#1e293b' }}>{s.month}</span>
                              <span style={{ padding: '4px 10px', background: s.status === 'paid' ? '#f0fdf4' : '#fef2f2', color: s.status === 'paid' ? '#15803d' : '#b91c1c', borderRadius: 8, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{s.status}</span>
                           </div>
                           <div style={{ fontSize: 24, fontWeight: 900, color: '#1e293b', marginBottom: 4 }}>${s.total_amount}</div>
                           <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Paid on: {s.payment_date || '-'}</p>
                           {s.transaction_id && <p style={{ margin: '8px 0 0', fontSize: 10, color: '#94a3b8', fontStyle: 'monospace' }}>TXN: {s.transaction_id}</p>}
                        </div>
                      ))}
                      {salaries.length === 0 && <div style={{ gridColumn: 'span 3', padding: 40, textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No salary records found for this instructor.</div>}
                   </div>
                )}
             </div>
          )}

          {activeTab === 'Attendance' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#1e293b' }}>Attendance Logs</h3>
                </div>
                {loadingTabContent ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading Logs...</div> : (
                  <div style={{ border: '1px solid #f1f5f9', borderRadius: 20, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                       <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                          <tr>
                             <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                             <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Check-in</th>
                             <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Check-out</th>
                             <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {attendance.map(a => (
                            <tr key={a.id}>
                              <td style={{ padding: '16px 24px', fontWeight: 700, color: '#1e293b' }}>{a.date}</td>
                              <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748b' }}>{a.check_in || '-'}</td>
                              <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748b' }}>{a.check_out || '-'}</td>
                              <td style={{ padding: '16px 24px' }}>
                                 <span style={{ padding: '4px 10px', background: a.status === 'present' ? '#f0fdf4' : '#fef2f2', color: a.status === 'present' ? '#15803d' : '#b91c1c', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{a.status}</span>
                              </td>
                            </tr>
                          ))}
                          {attendance.length === 0 && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No attendance logs recorded yet.</td></tr>}
                       </tbody>
                    </table>
                  </div>
                )}
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', padding: 20 }}>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               style={{ background: '#fff', borderRadius: 32, width: '100%', maxWidth: 600, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                   <div>
                      <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b', margin: 0 }}>Enroll New Students</h3>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Assigning to {displayName}</p>
                   </div>
                   <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 36, height: 36, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} color="#64748b" /></button>
                </div>
                <div style={{ padding: 32 }}>
                   <div style={{ position: 'relative', marginBottom: 24 }}>
                      <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                      <input 
                        value={searchStudent}
                        onChange={e => setSearchStudent(e.target.value)}
                        placeholder="Search student by name or grade..."
                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, outline: 'none', color: '#1e293b' }}
                      />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {availableStudents
                        .filter(s => `${s.user.first_name} ${s.user.last_name}`.toLowerCase().includes(searchStudent.toLowerCase()) || s.grade.toLowerCase().includes(searchStudent.toLowerCase()))
                        .map(s => (
                        <div key={s.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{s.user.first_name[0]}</div>
                              <div>
                                 <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{s.user.first_name} {s.user.last_name}</p>
                                 <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 600 }}>Grade {s.grade} • {s.batch}</p>
                              </div>
                           </div>
                           <button 
                             disabled={assigning}
                             onClick={() => assignStudent(s.id)}
                             style={{ padding: '8px 16px', background: '#0ea5e9', color: '#fff', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                           >Assign</button>
                        </div>
                      ))}
                      {availableStudents.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No additional students available for enrollment.</div>}
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Disburse Salary Modal */}
      <AnimatePresence>
        {showDisburseModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', padding: 20 }}>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               style={{ background: '#fff', borderRadius: 32, width: '100%', maxWidth: 500, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b', margin: 0 }}>Disburse Salary</h3>
                   <button onClick={() => setShowDisburseModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 36, height: 36, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} color="#64748b" /></button>
                </div>
                <form onSubmit={handleDisburse} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Month & Year</label>
                      <input 
                        value={disburseForm.month} onChange={e => setDisburseForm({ ...disburseForm, month: e.target.value })}
                        placeholder="e.g. April 2026" required
                        style={{ padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#1e293b' }}
                      />
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                         <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Net Amount ($)</label>
                         <input 
                           type="number" value={disburseForm.total_amount} onChange={e => setDisburseForm({ ...disburseForm, total_amount: e.target.value, gross_salary: e.target.value })}
                           required style={{ padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#1e293b' }}
                         />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                         <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Payment Mode</label>
                         <select 
                           value={disburseForm.payment_mode} onChange={e => setDisburseForm({ ...disburseForm, payment_mode: e.target.value })}
                           style={{ padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#1e293b' }}
                         >
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="upi">UPI</option>
                            <option value="card">Card</option>
                         </select>
                      </div>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                         <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Payment Date</label>
                         <input 
                           type="date" value={disburseForm.payment_date} onChange={e => setDisburseForm({ ...disburseForm, payment_date: e.target.value })}
                           required style={{ padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#1e293b' }}
                         />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                         <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Transaction ID</label>
                         <input 
                           value={disburseForm.transaction_id} onChange={e => setDisburseForm({ ...disburseForm, transaction_id: e.target.value })}
                           placeholder="MTN-..." style={{ padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#1e293b' }}
                         />
                      </div>
                   </div>
                   <button 
                     type="submit" disabled={disbursing}
                     style={{ marginTop: 10, padding: '16px', background: '#10b981', color: '#fff', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', shadow: '0 10px 15px -3px rgba(16,185,129,0.3)' }}
                   >
                     {disbursing ? 'Processing...' : 'Confirm Disbursement'}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', padding: 20 }}>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               style={{ background: '#fff', borderRadius: 32, width: '100%', maxWidth: 450, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b', margin: 0 }}>Reset Access Key</h3>
                   <button onClick={() => setShowResetModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 36, height: 36, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} color="#64748b" /></button>
                </div>
                <form onSubmit={handleResetPassword} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                   <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 16, border: '1px solid #e0f2fe' }}>
                      <p style={{ margin: 0, fontSize: 13, color: '#0369a1', fontWeight: 600, lineHeight: 1.5 }}>
                        Setting a new password will force the teacher to change it upon their next login for security compliance.
                      </p>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>New Temporary Password</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showResetPass ? "text" : "password"}
                          value={resetPass} onChange={e => setResetPass(e.target.value)}
                          placeholder="••••••••" required
                          style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, color: '#1e293b', boxSizing: 'border-box' }}
                        />
                        <button type="button" onClick={() => setShowResetPass(!showResetPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                          {showResetPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                   </div>
                   <button 
                     type="submit" disabled={isResetting}
                     style={{ padding: '16px', background: '#0ea5e9', color: '#fff', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', shadow: '0 10px 15px -3px rgba(14,165,233,0.3)' }}
                   >
                     {isResetting ? 'Updating...' : 'Confirm Reset'}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherDetailsView;
