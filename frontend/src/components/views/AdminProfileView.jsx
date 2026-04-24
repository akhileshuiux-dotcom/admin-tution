import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Calendar, Hash, ShieldCheck, 
  Edit3, Save, X, Camera, MapPin, Briefcase
} from 'lucide-react';
import api from '../../api';

const InputField = ({ label, icon: Icon, value, onChange, disabled, type = "text", placeholder }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 ${disabled ? 'text-slate-300' : 'text-slate-400'}`} size={16} />
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full rounded-2xl pl-11 pr-4 py-3 text-sm font-bold transition-all border ${
          disabled 
            ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5'
        }`}
      />
    </div>
  </div>
);

const AdminProfileView = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.user?.first_name || '',
    last_name: user?.user?.last_name || '',
    display_name: user?.user?.username || '',
    email: user?.user?.email || '',
    phone: user?.phone || '+1 (555) 000-0000',
    dob: user?.dob || '1990-01-01',
    admin_id: user?.admin_id || 'ADM-001-ALPHA',
    role: 'Super Admin',
    location: user?.location || 'Main Campus, London'
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
    }, 1000);
  };

  const displayName = profileData.first_name 
    ? `${profileData.first_name} ${profileData.last_name}`.trim() 
    : profileData.display_name;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Banner Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="h-40 bg-gradient-to-r from-slate-900 to-indigo-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        </div>
        
        <div className="px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row gap-8 items-end -mt-16">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-indigo-600 border-8 border-white flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-indigo-200 overflow-hidden">
                {profileData.first_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <button className="absolute bottom-2 right-2 p-3 bg-white border border-slate-100 rounded-2xl shadow-xl text-slate-500 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100">
                <Camera size={20} />
              </button>
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{displayName}</h1>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200">
                  {profileData.role}
                </span>
              </div>
              <p className="text-slate-500 font-bold flex items-center gap-2 mt-2">
                <Hash size={16} className="text-slate-300" /> {profileData.admin_id}
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mx-2" />
                <ShieldCheck size={16} className="text-emerald-500" /> Authorized Access
              </p>
            </div>

            <div className="flex gap-3 pb-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all"
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                    Save Changes
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                >
                  <Edit3 size={18} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Basic Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30"
        >
          <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
            <User size={22} className="text-indigo-600" /> Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField 
              label="First Name" icon={User} 
              value={profileData.first_name} 
              onChange={e => setProfileData({...profileData, first_name: e.target.value})}
              disabled={!isEditing} 
            />
            <InputField 
              label="Last Name" icon={User} 
              value={profileData.last_name} 
              onChange={e => setProfileData({...profileData, last_name: e.target.value})}
              disabled={!isEditing} 
            />
            <InputField 
              label="Display Name" icon={User} 
              value={profileData.display_name} 
              onChange={e => setProfileData({...profileData, display_name: e.target.value})}
              disabled={!isEditing} 
            />
            <InputField 
              label="Date of Birth" icon={Calendar} type="date"
              value={profileData.dob} 
              onChange={e => setProfileData({...profileData, dob: e.target.value})}
              disabled={!isEditing} 
            />
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50">
            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
              <Mail size={22} className="text-indigo-600" /> Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputField 
                label="Email Address" icon={Mail} type="email"
                value={profileData.email} 
                onChange={e => setProfileData({...profileData, email: e.target.value})}
                disabled={!isEditing} 
              />
              <InputField 
                label="Phone Number" icon={Phone} 
                value={profileData.phone} 
                onChange={e => setProfileData({...profileData, phone: e.target.value})}
                disabled={!isEditing} 
              />
            </div>
          </div>
        </motion.div>

        {/* Status / Role Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-4 flex flex-col gap-8"
        >
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <h3 className="text-lg font-black mb-6 flex items-center gap-3">
              <ShieldCheck size={22} className="text-emerald-400" /> System Identity
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned Role</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl"><ShieldCheck size={18} className="text-emerald-400" /></div>
                  <p className="text-sm font-black tracking-tight">{profileData.role}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Administrative Location</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl"><MapPin size={18} className="text-indigo-400" /></div>
                  <p className="text-sm font-black tracking-tight leading-relaxed">{profileData.location}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Status</p>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black tracking-widest uppercase border border-emerald-500/30">
                  Active Session
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30 flex-1">
             <h3 className="text-md font-black text-slate-900 mb-6 flex items-center gap-3">
              <Briefcase size={20} className="text-indigo-600" /> Quick Stats
            </h3>
            <div className="space-y-6">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
                  <p className="text-sm font-black text-slate-800">January 12, 2024</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Login</p>
                  <p className="text-sm font-black text-slate-800">12 minutes ago</p>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminProfileView;
