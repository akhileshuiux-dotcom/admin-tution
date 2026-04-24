import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Lock, Bell, Globe, 
  Moon, Shield, Smartphone, Save,
  Eye, EyeOff, CheckCircle
} from 'lucide-react';

const SettingToggle = ({ icon: Icon, label, desc, enabled, onChange }) => (
  <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-colors">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-[15px] font-bold text-slate-800">{label}</h4>
        <p className="text-[12px] text-slate-400 font-medium truncate max-w-[200px]">{desc}</p>
      </div>
    </div>
    <button 
      onClick={onChange}
      className={`w-14 h-7 rounded-full p-1 transition-all flex ${enabled ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`}
    >
      <motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-5 h-5 bg-white rounded-full shadow-md" />
    </button>
  </div>
);

const StudentSettingsView = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [settings, setSettings] = useState({
    emailNotifs: true,
    smsNotifs: false,
    appNotifs: true,
    darkMode: false,
    publicProfile: false,
    language: 'English (US)'
  });

  const toggle = (key) => setSettings({ ...settings, [key]: !settings[key] });

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">Manage your portal preferences and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Security */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Password Change Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/10">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Security & Credentials</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Keep your portal access safe</p>
              </div>
            </div>

            <form className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/5 transition-all font-bold"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors">
                    {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNew ? "text" : "password"} 
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                      {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirm ? "text" : "password"} 
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-300 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 mt-4">
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 mb-2"><CheckCircle size={14} /> Password Policy</p>
                 <ul className="text-[12px] text-slate-500 font-medium space-y-1 list-disc ml-5">
                   <li>Minimum 8 characters long</li>
                   <li>Must include one capital letter</li>
                   <li>Must include one special character (@#$%^&*)</li>
                 </ul>
              </div>

              <button type="button" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-4 flex items-center justify-center gap-3">
                <Save size={18} /> Update Access Key
              </button>
            </form>
          </motion.div>

          {/* Privacy Section */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Privacy & Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingToggle 
                icon={Shield} 
                label="Public Profile" 
                desc="Allow other batchmates to see your profile" 
                enabled={settings.publicProfile} 
                onChange={() => toggle('publicProfile')} 
              />
              <SettingToggle 
                icon={Smartphone} 
                label="Two-Factor Auth" 
                desc="Enhanced login security via email code" 
                enabled={false} 
                onChange={() => {}} 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Preferences */}
        <div className="flex flex-col gap-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Communications</h3>
             <SettingToggle icon={Bell} label="Email Alerts" desc="Exam results & reminders" enabled={settings.emailNotifs} onChange={() => toggle('emailNotifs')} />
             <SettingToggle icon={Bell} label="SMS Notifications" desc="Urgent campus updates" enabled={settings.smsNotifs} onChange={() => toggle('smsNotifs')} />
             <SettingToggle icon={Smartphone} label="App Badges" desc="New notes & chat alerts" enabled={settings.appNotifs} onChange={() => toggle('appNotifs')} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">App Personalization</h3>
             <SettingToggle icon={Moon} label="Dark Space" desc="Switch background color" enabled={settings.darkMode} onChange={() => toggle('darkMode')} />
             
             <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <h4 className="text-[15px] font-bold text-slate-800">Language</h4>
                </div>
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-orange-200 transition-all cursor-pointer"
                >
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Hindi (हिन्दी)</option>
                  <option>Kannada (ಕನ್ನಡ)</option>
                </select>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettingsView;
