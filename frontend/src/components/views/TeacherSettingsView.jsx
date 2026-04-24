import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Lock, Bell, Moon, 
  ShieldCheck, Smartphone, Save,
  Eye, EyeOff, CheckCircle2, Globe, AlertCircle, Loader2
} from 'lucide-react';
import api from '../../api';

const SettingToggle = ({ icon: Icon, label, desc, enabled, onChange }) => (
  <div 
    style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    className="flex items-center justify-between p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 transition-colors">
        <Icon size={20} />
      </div>
      <div>
        <h4 style={{ color: 'var(--text-main)' }} className="text-[15px] font-bold">{label}</h4>
        <p style={{ color: 'var(--text-muted)' }} className="text-[12px] font-medium truncate max-w-[200px]">{desc}</p>
      </div>
    </div>
    <button 
      onClick={onChange}
      className={`w-14 h-7 rounded-full p-1 transition-all flex ${enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-200 justify-start'}`}
    >
      <motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
    </button>
  </div>
);

const TeacherSettingsView = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [settings, setSettings] = useState({
    emailNotifs: true,
    classAlerts: true,
    examAlerts: true,
    darkMode: false,
    language: 'English (US)'
  });

  const [form, setForm] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggle = (key) => {
    const newVal = !settings[key];
    setSettings({ ...settings, [key]: newVal });
    
    if (key === 'darkMode') {
      if (newVal) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.new !== form.confirm) {
      setError("New passwords do not match");
      return;
    }

    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!strongRegex.test(form.new)) {
      setError("Password must be 8+ chars with upper, lower, number & symbol.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/profile/', {
        action: 'change_password',
        old_password: form.current,
        new_password: form.new
      });
      setSuccess("Security credentials updated successfully.");
      setForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-2">
        <h2 style={{ color: 'var(--text-main)' }} className="text-3xl font-black tracking-tight">Staff Portal Settings</h2>
        <p style={{ color: 'var(--text-muted)' }} className="font-bold uppercase tracking-widest text-[10px] italic">Configure your professional preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Security Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', boxShadow: 'var(--card-shadow)' }}
            className="p-10 rounded-[3rem] border"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/10">
                <Lock size={24} />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-main)' }} className="text-xl font-black">Access Key & Security</h3>
                <p style={{ color: 'var(--text-muted)' }} className="text-[10px] font-black uppercase tracking-widest mt-1">Manage your faculty credentials</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Current Portal Password</label>
                <div className="relative">
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    placeholder="••••••••"
                    required
                    value={form.current}
                    onChange={e => setForm({...form, current: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/5 transition-all font-bold"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500 transition-colors">
                    {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">New Security Code</label>
                  <div className="relative">
                    <input 
                      type={showNew ? "text" : "password"} 
                      placeholder="••••••••"
                      required
                      value={form.new}
                      onChange={e => setForm({...form, new: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors">
                      {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Confirm Code</label>
                  <div className="relative">
                    <input 
                      type={showConfirm ? "text" : "password"} 
                      placeholder="••••••••"
                      required
                      value={form.confirm}
                      onChange={e => setForm({...form, confirm: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors">
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 size={16} /> {success}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                {loading ? 'Processing...' : 'Update Staff Credentials'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Preferences */}
        <div className="flex flex-col gap-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Notifications</h3>
             <SettingToggle icon={Bell} label="Email Summaries" desc="Weekly student reports" enabled={settings.emailNotifs} onChange={() => toggle('emailNotifs')} />
             <SettingToggle icon={CheckCircle2} label="Class Reminders" desc="Before every session" enabled={settings.classAlerts} onChange={() => toggle('classAlerts')} />
             <SettingToggle icon={Smartphone} label="App Notifications" desc="Chat & Leave requests" enabled={settings.examAlerts} onChange={() => toggle('examAlerts')} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">App Personalization</h3>
             <SettingToggle icon={Moon} label="Dark Theme" desc="Low light UI mode" enabled={settings.darkMode} onChange={() => toggle('darkMode')} />
             
             <div 
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                className="p-6 rounded-3xl border shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <h4 style={{ color: 'var(--text-main)' }} className="text-[15px] font-bold">Language</h4>
                </div>
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-main)' }}
                  className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-200 transition-all cursor-pointer"
                >
                  <option>English (US)</option>
                  <option>German (Deutsch)</option>
                  <option>French (Français)</option>
                </select>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettingsView;
