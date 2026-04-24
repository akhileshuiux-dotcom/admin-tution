import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Hash, GraduationCap, Briefcase, Clock,
  Edit3, Save, X, Camera, Award, ShieldCheck,
  Languages, Globe, Lock, ShieldAlert, CheckCircle2, Eye, EyeOff, Loader2, AlertCircle
} from 'lucide-react';
import api from '../../api';

const ProfileField = ({ icon: Icon, label, value, isEditing, onChange, name, type = "text" }) => (
  <div className="flex flex-col gap-2 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/30 transition-all hover:border-teal-200 hover:bg-white shadow-sm group">
    <div className="flex items-center gap-2 text-slate-400 group-hover:text-teal-600 transition-colors">
      <Icon size={14} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    {isEditing ? (
      <input 
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/5 transition-all w-full"
      />
    ) : (
      <p className="text-sm font-bold text-slate-800 px-1 truncate">{value || 'N/A'}</p>
    )}
  </div>
);

const TeacherProfileView = ({ user, permissions }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [showPassCurrent, setShowPassCurrent] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);

  const hasPerm = (cat, key) => permissions?.[cat]?.[key] === true;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passForm.new !== passForm.confirm) {
      setPassError("New passwords do not match");
      return;
    }

    setPassLoading(true);
    try {
      await api.post('/profile/', {
        action: 'change_password',
        old_password: passForm.current,
        new_password: passForm.new
      });
      setPassSuccess("Access Key updated successfully");
      setPassForm({ current: '', new: '', confirm: '' });
      setTimeout(() => {
        setShowPassModal(false);
        setPassSuccess('');
      }, 2000);
    } catch (err) {
      setPassError(err.response?.data?.error || "Failed to update security credentials");
    } finally {
      setPassLoading(false);
    }
  };
  
  const displayName = user?.user?.first_name 
    ? `${user.user.first_name} ${user.user.last_name || ''}`.trim() 
    : user?.user?.username || 'Instructor';

  const [profileData, setProfileData] = useState({
    fullName: displayName,
    email: user?.user?.email || user?.user?.username || 'teacher@eduway.com',
    teacherId: user?.employee_id || 'TCH-2025-08',
    phone: '+1 (555) 012-3456',
    qualification: user?.qualification || 'Ph.D in Applied Mathematics',
    specialization: user?.specialization || 'Pure Mathematics & Calculus',
    assignedClasses: 'Grade 9A, Grade 10B, Grade 12 Advanced',
    experience: '12 Years in Academic Excellence',
    joiningDate: user?.joining_date || '15 Aug 2022',
    address: '45 Faculty Row, University Heights, Education District',
    gender: 'Female',
    dob: '24 Oct 1988',
    center: 'Main Regional Campus',
    status: 'Active / Senior Faculty',
    emergencyContact: '+1 (555) 999-8888'
  });

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-[1240px] mx-auto flex flex-col gap-10 pb-24">
      <PasswordModal 
        isOpen={showPassModal} 
        onClose={() => setShowPassModal(false)}
        form={passForm}
        setForm={setPassForm}
        error={passError}
        success={passSuccess}
        loading={passLoading}
        onSave={handlePasswordChange}
        showCurrent={showPassCurrent}
        setShowCurrent={setShowPassCurrent}
        showNew={showPassNew}
        setShowNew={setShowPassNew}
      />
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-teal-500/5 z-0" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-44 h-44 rounded-[3rem] bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-teal-500/20 ring-8 ring-white overflow-hidden">
               {profileData.fullName[0].toUpperCase()}
            </div>
            {isEditing && (
              <button className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-[3rem] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={28} />
              </button>
            )}
          </div>

          <div className="flex-grow text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Prof. {profileData.fullName}</h1>
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                {profileData.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-slate-500 font-bold mb-8">
               <span className="flex items-center gap-2"><Briefcase size={16} className="text-teal-500" /> {profileData.specialization}</span>
               <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
               <span className="flex items-center gap-2"><Hash size={16} className="text-teal-500" /> Employee ID: {profileData.teacherId}</span>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
               <div className="px-5 py-2.5 bg-teal-50 rounded-2xl border border-teal-100 text-[11px] font-black text-teal-700 uppercase tracking-widest flex items-center gap-2">
                  <GraduationCap size={16} /> {profileData.qualification}
               </div>
               <div className="px-5 py-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={16} /> {profileData.experience}
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
             {isEditing ? (
               <div className="flex flex-col gap-3">
                 <button onClick={() => setIsEditing(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl border border-slate-200 hover:bg-slate-200 transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                   <X size={18} /> Cancel
                 </button>
                 <button onClick={() => setIsEditing(false)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-200 flex items-center justify-center gap-2">
                   <Save size={18} /> Save Identity
                 </button>
               </div>
             ) : hasPerm('profile', 'edit_own_profile') ? (
               <div className="flex flex-col gap-3">
                 <button onClick={() => setIsEditing(true)} className="w-full px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] hover:bg-slate-800 transition-all font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-200 flex items-center justify-center gap-3">
                   <Edit3 size={18} /> Edit Profile Data
                 </button>
                 <button onClick={() => setShowPassModal(true)} className="w-full px-10 py-5 bg-emerald-50 text-emerald-600 rounded-[1.5rem] hover:bg-emerald-100 transition-all font-black uppercase text-xs tracking-widest border border-emerald-100 flex items-center justify-center gap-3">
                   <Lock size={18} /> Change Access Key
                 </button>
               </div>
             ) : (
                <div className="w-full px-10 py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 border border-slate-200 opacity-60 italic">
                    <ShieldCheck size={18} /> Editing Disabled
                </div>
             )}
          </div>
        </div>
      </motion.div>

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
        {/* Academic & Pro Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 flex flex-col gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30">
              <h3 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-8 border-b border-emerald-50 pb-4">Job & Professional Data</h3>
              <div className="flex flex-col gap-5">
                 <ProfileField icon={GraduationCap} label="Educational Degree" value={profileData.qualification} isEditing={isEditing} name="qualification" />
                 <ProfileField icon={Briefcase} label="Core Specialization" value={profileData.specialization} isEditing={isEditing} name="specialization" />
                 <ProfileField icon={Award} label="Teaching Experience" value={profileData.experience} isEditing={isEditing} name="experience" />
                 <ProfileField icon={ShieldCheck} label="Designated Center" value={profileData.center} isEditing={isEditing} name="center" />
                 
                 <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 border-dashed mt-2">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Globe size={14} /> Assigned Classes</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{profileData.assignedClasses}</p>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Contact & Personal Section */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-7 flex flex-col gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30">
              <h3 className="text-[12px] font-black text-teal-600 uppercase tracking-[0.2em] mb-8 border-b border-teal-50 pb-4">Personal Identifiers & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <ProfileField icon={Mail} label="Academic Email" value={profileData.email} isEditing={isEditing} name="email" type="email" />
                 <ProfileField icon={Phone} label="Mobile Number" value={profileData.phone} isEditing={isEditing} name="phone" />
                 <ProfileField icon={Calendar} label="Date of Birth" value={profileData.dob} isEditing={isEditing} name="dob" />
                 <ProfileField icon={User} label="Gender" value={profileData.gender} isEditing={isEditing} name="gender" />
                 <ProfileField icon={Clock} label="Joining Date" value={profileData.joiningDate} isEditing={isEditing} name="joiningDate" />
                 <ProfileField icon={ShieldCheck} label="Emergency Hash" value={profileData.emergencyContact} isEditing={isEditing} name="emergencyContact" />
                 <div className="col-span-full">
                    <ProfileField icon={MapPin} label="Residential Address" value={profileData.address} isEditing={isEditing} name="address" />
                 </div>
              </div>

              <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-500 shadow-sm"><Languages size={24} /></div>
                   <div>
                      <h4 className="text-sm font-black text-slate-800">Language Preferred</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">English, Hindi, Kannada</p>
                   </div>
                </div>
                <button className="text-xs font-black text-teal-600 uppercase tracking-widest hover:underline">Change Link</button>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

const PasswordModal = ({ isOpen, onClose, form, setForm, error, success, loading, onSave, showCurrent, setShowCurrent, showNew, setShowNew }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl shadow-slate-900/20 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Security Access</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={onSave} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Current Access Key</label>
                <div className="relative">
                  <input 
                    type={showCurrent ? "text" : "password"}
                    value={form.current}
                    onChange={e => setForm({...form, current: e.target.value})}
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:border-emerald-400 transition-all font-bold pr-12"
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors">
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">New Access Key</label>
                <div className="relative">
                  <input 
                    type={showNew ? "text" : "password"}
                    value={form.new}
                    onChange={e => setForm({...form, new: e.target.value})}
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:border-emerald-400 transition-all font-bold pr-12"
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Confirm New Key</label>
                <input 
                  type="password"
                  value={form.confirm}
                  onChange={e => setForm({...form, confirm: e.target.value})}
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 outline-none focus:border-emerald-400 transition-all font-bold"
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-[11px] font-bold">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-[11px] font-bold">
                <CheckCircle2 size={16} /> {success}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
              {loading ? 'Encrypting...' : 'Update Security Credentials'}
            </button>
          </form>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default TeacherProfileView;
