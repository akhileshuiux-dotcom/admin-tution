import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Lock, Key, Eye, EyeOff, 
  Smartphone, Monitor, History, AlertTriangle, CheckCircle2
} from 'lucide-react';

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length > 8) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9]/.test(password)) s += 1;
    if (/[^A-Za-z0-9]/.test(password)) s += 1;
    return s;
  };
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strength = getStrength();
  const colors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  
  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
         <span className="text-slate-400">Security Strength</span>
         <span className={strength > 0 ? `text-${colors[strength].split('-')[1]}-600` : 'text-slate-400'}>{labels[strength]}</span>
      </div>
      <div className="flex gap-1.5 h-1.5">
         {[1, 2, 3, 4].map(i => (
           <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i <= strength ? colors[strength] : 'bg-slate-100'}`} />
         ))}
      </div>
    </div>
  );
};

const AdminSecurityView = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
       {/* Section 1: Password Management */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
             <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-200 mb-6">
                <Lock size={32} />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Secure Your Administrative Access</h2>
             <p className="text-slate-500 font-medium leading-relaxed">
                Update your access key regularly to maintain top-tier system safety. We recommend using a mix of symbols, numbers, and capital letters.
             </p>
             
             <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex gap-4 mt-8">
                <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                <div>
                   <h5 className="font-black text-amber-900 text-sm mb-1 uppercase tracking-tight">Security Protocol</h5>
                   <p className="text-[13px] text-amber-800 leading-relaxed font-medium">Changing your password will terminate all other active sessions for your account across all devices.</p>
                </div>
             </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative"
          >
             <AnimatePresence>
               {success && (
                 <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-10 left-10 right-10 bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-center gap-4 z-10"
                 >
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    <p className="text-emerald-800 font-black text-sm uppercase tracking-tight">Access Key Updated Successfully!</p>
                 </motion.div>
               )}
             </AnimatePresence>

             <form onSubmit={handleUpdate} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Legacy Access Key</label>
                   <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        required
                        type={showCurrent ? "text" : "password"} 
                        value={formData.current}
                        onChange={e => setFormData({...formData, current: e.target.value})}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-14 py-4 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition-all" 
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                        {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">New Neural Access Key</label>
                   <div className="relative">
                      <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        required
                        type={showNew ? "text" : "password"} 
                        value={formData.new}
                        onChange={e => setFormData({...formData, new: e.target.value})}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-14 py-4 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition-all" 
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600">
                        {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                   </div>
                   <PasswordStrength password={formData.new} />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirm Neural Access Key</label>
                   <div className="relative">
                      <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        required
                        type="password" 
                        value={formData.confirm}
                        onChange={e => setFormData({...formData, confirm: e.target.value})}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition-all" 
                      />
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading || !formData.new || formData.new !== formData.confirm}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Validating Handshake...
                    </div>
                  ) : "Initialize Access Key Update"}
                </button>
             </form>
          </motion.div>
       </div>

       {/* Section 2: Active Sessions */}
       <div className="space-y-8">
          <div className="flex justify-between items-center">
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Authorized Active Sessions</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time device monitoring</p>
             </div>
             <button className="text-[11px] font-black text-rose-500 uppercase tracking-widest px-6 py-3 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100">
                Terminate All Other Sessions
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6">
                <div className="flex justify-between">
                   <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Monitor size={24} /></div>
                   <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest self-start border border-emerald-200">Current Device</span>
                </div>
                <div>
                   <h4 className="font-black text-slate-900 text-lg">Apple iMac Pro</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">macOS • Chrome Browser</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <History size={14} /> Active now
                   </div>
                   <span className="text-[10px] font-bold text-slate-300">IP: 192.168.1.1</span>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 opacity-60">
                <div className="flex justify-between">
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><Smartphone size={24} /></div>
                </div>
                <div>
                   <h4 className="font-black text-slate-900 text-lg">iPhone 15 Pro</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">iOS • EduWay App</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <History size={14} /> 4 hours ago
                   </div>
                   <button className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Logout</button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default AdminSecurityView;
