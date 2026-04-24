import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  Hash, ShieldCheck, Clock, Award, 
  Edit3, Save, X, Camera, Briefcase, Heart
} from 'lucide-react';

const ProfileField = ({ icon: Icon, label, value, isEditing, onChange, name, type = "text" }) => (
  <div className="flex flex-col gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 transition-all hover:border-indigo-100 hover:bg-white shadow-sm group">
    <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
      <Icon size={14} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    {isEditing ? (
      <input 
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all w-full"
      />
    ) : (
      <p className="text-sm font-bold text-slate-800 px-1 truncate">{value || 'N/A'}</p>
    )}
  </div>
);

const StudentProfileView = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || 'Akhilesh',
    lastName: user?.last_name || 'Kumar',
    email: user?.email || 'student@eduway.com',
    studentId: user?.student_id || 'STU-2026-001',
    admissionNum: 'ADM/2025/124',
    phone: '+91 98765 43210',
    parentName: 'Mr. Rajesh Kumar',
    parentPhone: '+91 98765 00000',
    class: user?.grade || '9th Standard',
    division: 'Batch A - Evening',
    rollNum: '24',
    dob: '12 May 2011',
    gender: 'Male',
    address: '123, EduWay Layout, Tech Park Road, Bengaluru',
    bloodGroup: 'B+',
    joiningDate: '01 April 2024',
    center: 'Main Campus - HSR Layout',
    assignedTeacher: 'Mrs. Goodman',
    emergencyContact: '+91 98765 11111',
    status: 'Active'
  });

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const displayName = `${profileData.firstName} ${profileData.lastName}`;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-20">
      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8 mt-4">
          <div className="relative group">
            <div className="w-36 h-36 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-500/30 overflow-hidden ring-8 ring-white">
              {profileData.firstName[0]}{profileData.lastName[0]}
            </div>
            {isEditing && (
              <button className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} />
              </button>
            )}
          </div>

          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{displayName}</h1>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                {profileData.status}
              </span>
            </div>
            <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2 text-sm italic">
              <Hash size={16} /> Student ID: {profileData.studentId}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <ShieldCheck size={16} className="text-indigo-500" />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{profileData.class}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <Briefcase size={16} className="text-indigo-500" />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{profileData.division}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
             {isEditing ? (
               <>
                 <button onClick={() => setIsEditing(false)} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all font-black uppercase text-xs tracking-widest flex items-center gap-2">
                   <X size={18} /> Cancel
                 </button>
                 <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2">
                   <Save size={18} /> Save Changes
                 </button>
               </>
             ) : (
               <button onClick={() => setIsEditing(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-200 flex items-center gap-2">
                 <Edit3 size={18} /> Edit Profile
               </button>
             )}
          </div>
        </div>
      </motion.div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Academic Details Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg flex flex-col gap-6">
            <h3 className="text-xl font-black text-slate-900 mb-2 border-l-4 border-indigo-500 pl-4 uppercase tracking-[0.2em] text-[12px]">Academic Info</h3>
            <ProfileField icon={Hash} label="Admission Number" value={profileData.admissionNum} isEditing={isEditing} name="admissionNum" />
            <ProfileField icon={Award} label="Roll Number" value={profileData.rollNum} isEditing={isEditing} name="rollNum" />
            <ProfileField icon={Clock} label="Joining Date" value={profileData.joiningDate} isEditing={isEditing} name="joiningDate" />
            <ProfileField icon={User} label="Invigilator / Teacher" value={profileData.assignedTeacher} isEditing={isEditing} name="assignedTeacher" />
          </div>
        </motion.div>

        {/* Personal Details Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
            <h3 className="col-span-full text-xl font-black text-slate-900 mb-2 border-l-4 border-purple-500 pl-4 uppercase tracking-[0.2em] text-[12px]">Personal Particulars</h3>
            
            <ProfileField icon={Mail} label="Official Email" value={profileData.email} isEditing={isEditing} name="email" type="email" />
            <ProfileField icon={Phone} label="Contact Number" value={profileData.phone} isEditing={isEditing} name="phone" />
            <ProfileField icon={Calendar} label="Date of Birth" value={profileData.dob} isEditing={isEditing} name="dob" />
            <ProfileField icon={Heart} label="Blood Group" value={profileData.bloodGroup} isEditing={isEditing} name="bloodGroup" />
            
            <div className="col-span-full">
              <ProfileField icon={MapPin} label="Permanent Address" value={profileData.address} isEditing={isEditing} name="address" />
            </div>

            <div className="col-span-full mt-6 flex flex-col gap-4">
              <h3 className="text-xl font-black text-slate-900 mb-2 border-l-4 border-rose-500 pl-4 uppercase tracking-[0.2em] text-[12px]">Emergency & Guardian Hub</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <ProfileField icon={User} label="Guardian Name" value={profileData.parentName} isEditing={isEditing} name="parentName" />
                 <ProfileField icon={Phone} label="Guardian Contact" value={profileData.parentPhone} isEditing={isEditing} name="parentPhone" />
                 <ProfileField icon={Phone} label="Emergency Contact" value={profileData.emergencyContact} isEditing={isEditing} name="emergencyContact" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfileView;
