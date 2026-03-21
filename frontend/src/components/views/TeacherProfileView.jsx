import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, User, Briefcase, Hash, Mail, LogOut } from 'lucide-react';

const Field = ({ icon: Icon, label, value, accent = '#1e293b', bg = '#f8fafc' }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 18px', background: bg, border:'1px solid #e2e8f0', borderRadius:13 }}>
    <div style={{ display:'flex', alignItems:'center', gap:10, color:'#64748b' }}>
      <Icon size={15} /><span style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
    </div>
    <span style={{ color: accent, fontWeight:700, fontSize:14 }}>{value||'—'}</span>
  </div>
);

const TeacherProfileView = ({ user, onLogout }) => {
  const displayName = user?.user?.first_name
    ? `${user.user.first_name} ${user.user.last_name || ''}`.trim()
    : user?.user?.username || 'Teacher';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:680 }}>
      {/* Banner */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
        style={{ background:'linear-gradient(130deg,#ecfdf5 0%,#f0fdf4 100%)', border:'1px solid #bbf7d0', borderRadius:22, padding:'28px 32px', display:'flex', alignItems:'center', gap:22 }}>
        <div style={{ width:76, height:76, borderRadius:20, background:'linear-gradient(135deg,#059669,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', font:'700 30px sans-serif', color:'#fff', flexShrink:0, boxShadow:'0 6px 20px rgba(5,150,105,0.3)' }}>
          {displayName[0]?.toUpperCase()}
        </div>
        <div>
          <p style={{ color:'#059669', fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', margin:'0 0 5px' }}>Instructor Profile</p>
          <h2 style={{ color:'#1e293b', fontSize:24, fontWeight:900, margin:'0 0 3px' }}>{displayName}</h2>
          <p style={{ color:'#64748b', fontSize:13, margin:0 }}>{user?.specialization||'General'} Department</p>
        </div>
      </motion.div>

      {/* Fields */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <p style={{ color:'#94a3b8', fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 4px 4px' }}>Account Details</p>
        <Field icon={User}          label="Full Name"         value={displayName}              accent="#1e293b" />
        <Field icon={Mail}          label="Username / Email"  value={user?.user?.username}     accent="#6366f1" bg="#f5f3ff" />
        <Field icon={Hash}          label="Employee ID"       value={user?.employee_id}        accent="#059669" bg="#f0fdf4" />
        <Field icon={Briefcase}     label="Specialization"    value={user?.specialization||'General'} accent="#f59e0b" bg="#fffbeb" />
        <Field icon={GraduationCap} label="Role"              value="Teacher"                  accent="#059669" bg="#f0fdf4" />
      </motion.div>

      {/* Bio */}
      {user?.bio && (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'16px 18px' }}>
          <p style={{ color:'#94a3b8', fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Bio</p>
          <p style={{ color:'#475569', fontSize:14, lineHeight:1.65, margin:0 }}>{user.bio}</p>
        </div>
      )}

      {/* Logout */}
      <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }} onClick={onLogout}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'14px 24px', borderRadius:14, border:'1px solid #fca5a5', background:'#fef2f2', color:'#ef4444', fontWeight:700, fontSize:14, cursor:'pointer', width:'100%' }}>
        <LogOut size={17} /> Sign Out of Instructor Portal
      </motion.button>
    </div>
  );
};

export default TeacherProfileView;
