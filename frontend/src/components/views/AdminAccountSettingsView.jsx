import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Monitor, Layout, Globe, Clock, 
  ChevronRight, Save, LayoutDashboard, Palette
} from 'lucide-react';

const SettingItem = ({ icon: Icon, title, description, children }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
    <div className="flex gap-5 items-start">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-[15px] font-black text-slate-900 mb-1">{title}</h4>
        <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-md">{description}</p>
      </div>
    </div>
    <div className="min-w-[200px]">
      {children}
    </div>
  </div>
);

const AdminAccountSettingsView = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    displayTitle: 'Super Admin Portal',
    defaultLanding: 'Overview',
    language: 'English (US)',
    timezone: '(GMT+00:00) UTC',
    sidebarMode: 'Expanded',
    autoRefresh: true
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-end bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
             <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200">
                <Settings size={28} />
             </div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h2>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] ml-1">Configure your administrative workspace experience</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="relative flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[12px] tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6">
        <SettingItem 
          icon={Monitor} 
          title="Display Title" 
          description="The title displayed in your browser tab and header area."
        >
          <input 
            type="text" 
            value={settings.displayTitle}
            onChange={e => setSettings({...settings, displayTitle: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all" 
          />
        </SettingItem>

        <SettingItem 
          icon={LayoutDashboard} 
          title="Default Landing Page" 
          description="The first module you see after logging in."
        >
          <select 
            value={settings.defaultLanding}
            onChange={e => setSettings({...settings, defaultLanding: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none"
          >
            <option>Overview</option>
            <option>Students</option>
            <option>Finance</option>
            <option>Teachers</option>
          </select>
        </SettingItem>

        <SettingItem 
          icon={Globe} 
          title="System Language" 
          description="Set your preferred language for the administrative interface."
        >
          <select 
            value={settings.language}
            onChange={e => setSettings({...settings, language: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none"
          >
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </SettingItem>

        <SettingItem 
          icon={Clock} 
          title="Timezone" 
          description="Used for scheduling and activity log timestamps."
        >
          <select 
            value={settings.timezone}
            onChange={e => setSettings({...settings, timezone: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none"
          >
            <option>(GMT+00:00) UTC</option>
            <option>(GMT+05:30) Mumbai</option>
            <option>(GMT-05:00) New York</option>
            <option>(GMT+01:00) London</option>
          </select>
        </SettingItem>

        <SettingItem 
          icon={Layout} 
          title="Default Sidebar State" 
          description="How the sidebar appears when you first load the dashboard."
        >
          <div className="flex gap-3 bg-slate-50 p-1.5 rounded-2xl">
            {['Expanded', 'Collapsed'].map(mode => (
              <button
                key={mode}
                onClick={() => setSettings({...settings, sidebarMode: mode})}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  settings.sidebarMode === mode 
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </SettingItem>

        <SettingItem 
          icon={Palette} 
          title="User Interface Visuals" 
          description="Adjust experimental UI features for better visibility."
        >
           <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.autoRefresh}
                  onChange={e => setSettings({...settings, autoRefresh: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-3 text-sm font-bold text-slate-700">Auto-Refresh Stats</span>
              </label>
           </div>
        </SettingItem>
      </div>
    </div>
  );
};

export default AdminAccountSettingsView;
