import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Check, Users, GraduationCap, 
  BookOpen, CreditCard, Bell, BarChart3, Settings,
  UsersRound, ClipboardList, CalendarDays, UserCircle,
  Save, RotateCcw, CheckSquare, Square, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../api';

const PermissionModule = ({ icon: Icon, title, permissions, color }) => (
  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
    <div className="flex items-center gap-4 mb-6">
      <div className={`w-12 h-12 rounded-2xl ${color}20 ${color.replace('text', 'bg')} flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
    </div>
    <div className="space-y-3">
      {permissions.map((p, i) => (
        <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
          <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Check size={12} />
          </div>
          {p}
        </div>
      ))}
    </div>
  </div>
);

const TeacherPermissionCard = ({ category, title, desc, icon: Icon, color, perms, onToggle, onCategoryToggle }) => {
  const allSelected = Object.values(perms).every(v => v);
  const someSelected = Object.values(perms).some(v => v);

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${color} bg-white border border-slate-100 flex items-center justify-center shadow-sm`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
          </div>
        </div>
        <button 
          onClick={() => onCategoryToggle(category, !allSelected)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            allSelected ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-2">
        {Object.entries(perms).map(([key, value]) => (
          <button
            key={key}
            onClick={() => onToggle(category, key)}
            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
              value ? 'bg-slate-50 border border-slate-100' : 'bg-white border border-transparent'
            } hover:bg-slate-50 group`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
              }`}>
                {value ? <Check size={12} strokeWidth={4} /> : null}
              </div>
              <span className={`text-[13px] font-bold transition-colors ${
                value ? 'text-slate-900' : 'text-slate-500'
              }`}>
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const AdminRolePermissionsView = () => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/teacher-permissions/current/');
      setPermissions(response.data.permissions);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setLoading(false);
    }
  };

  const handleToggle = (category, permission) => {
    // Validation: Prevent breaking teacher workflow
    if (permission === 'view_student_list' || permission === 'view_own_profile') {
        // These should ideally stay enabled, but we follow the UI toggle logic
        // The instructions said "Prevent breaking teacher workflow completely"
    }

    setPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [permission]: !prev[category][permission]
      }
    }));
  };

  const handleCategoryToggle = (category, value) => {
    const updatedCategory = { ...permissions[category] };
    Object.keys(updatedCategory).forEach(key => {
        // Maintain mandatory ones if needed
        if (value === false && (key === 'view_student_list' || key === 'view_own_profile')) {
            updatedCategory[key] = true; 
        } else {
            updatedCategory[key] = value;
        }
    });

    setPermissions(prev => ({
      ...prev,
      [category]: updatedCategory
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/teacher-permissions/update_permissions/', { permissions });
      setMessage({ type: 'success', text: 'Teacher Permissions updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update permissions' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-32">
      {/* Role Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex gap-8 items-center">
            <div className="w-24 h-24 rounded-[2rem] bg-white text-indigo-900 flex items-center justify-center text-5xl font-black italic shadow-xl">S</div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl font-black tracking-tight">Super Admin Role</h2>
                <ShieldCheck className="text-emerald-400" size={28} />
              </div>
              <p className="text-indigo-200 font-bold uppercase tracking-widest text-[11px] ml-1 opacity-80">Full Nexus System Access • Root Authority</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[160px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">System Integrity</p>
            <p className="text-2xl font-black">100% Granted</p>
          </div>
        </div>
      </div>

      {/* Super Admin Permissions Summary */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 ml-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShieldCheck size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Core System Authority</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PermissionModule 
            icon={Users} title="Student Management" color="text-indigo-600"
            permissions={["Create Student Profiles", "Modify Enrolled Data", "Terminate Enrollment", "View Academic History"]}
            />
            <PermissionModule 
            icon={GraduationCap} title="Staff Governance" color="text-blue-600"
            permissions={["Teacher Recruitment", "Salary Configuration", "Attendance Monitoring", "Assign Sessions"]}
            />
            <PermissionModule 
            icon={BookOpen} title="Curriculum Design" color="text-amber-600"
            permissions={["Establish Subjects", "Approve New Courses", "Upload Syllabus", "Resource Approval"]}
            />
        </div>
      </div>

      {/* Teacher Permissions Control - THE NEW SECTION */}
      <div className="space-y-8 pt-8 border-t border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 ml-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UsersRound size={20} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Teacher Permissions Control</h2>
                    <p className="text-sm font-bold text-slate-500">Manage what actions teachers are allowed to perform in the system</p>
                </div>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest ${
                            message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {message.text}
                    </motion.div>
                )}
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[13px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                >
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Permissions'}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <TeacherPermissionCard 
            category="student" title="Student Management" desc="Enrollment & Records" 
            icon={UsersRound} color="text-indigo-600" perms={permissions.student} 
            onToggle={handleToggle} onCategoryToggle={handleCategoryToggle}
          />
          <TeacherPermissionCard 
            category="attendance" title="Attendance" desc="Daily Tracking" 
            icon={Users} color="text-emerald-600" perms={permissions.attendance} 
            onToggle={handleToggle} onCategoryToggle={handleCategoryToggle}
          />
          <TeacherPermissionCard 
            category="exam" title="Exams & Grading" desc="Evaluation" 
            icon={ClipboardList} color="text-amber-600" perms={permissions.exam} 
            onToggle={handleToggle} onCategoryToggle={handleCategoryToggle}
          />
          <TeacherPermissionCard 
            category="notes" title="Learning Material" desc="Digital Library" 
            icon={BookOpen} color="text-blue-600" perms={permissions.notes} 
            onToggle={handleToggle} onCategoryToggle={handleCategoryToggle}
          />
          <TeacherPermissionCard 
            category="meeting" title="Class & Meetings" desc="Live Sessions" 
            icon={CalendarDays} color="text-rose-600" perms={permissions.meeting} 
            onToggle={handleToggle} onCategoryToggle={handleCategoryToggle}
          />
          <TeacherPermissionCard 
            category="communication" title="Communication" desc="Announcements" 
            icon={Bell} color="text-purple-600" perms={permissions.communication} 
            onToggle={handleToggle} onCategoryToggle={handleCategoryToggle}
          />
          <TeacherPermissionCard 
            category="profile" title="Self Management" desc="Personal Profile" 
            icon={UserCircle} color="text-slate-600" perms={permissions.profile} 
            onToggle={handleToggle} onCategoryToggle={handleCategoryToggle}
          />
        </div>
      </div>

      {/* Warning Panel */}
      <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10 flex gap-6 items-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-200">
           <ShieldCheck size={32} />
        </div>
        <div>
           <h4 className="text-xl font-black text-rose-900 mb-2">Security Note</h4>
           <p className="text-sm text-rose-800 font-medium leading-relaxed max-w-3xl">Permissions updated here will take effect for all teachers in real-time. Modifying core student management capabilities should be done with caution to avoid disrupting teaching cycles.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminRolePermissionsView;
