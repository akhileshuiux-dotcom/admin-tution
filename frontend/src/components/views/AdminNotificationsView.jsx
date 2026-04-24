import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Users, GraduationCap, CreditCard, 
  ShieldAlert, Mail, Smartphone, Globe
} from 'lucide-react';

const NotificationSwitch = ({ icon: Icon, title, description, checked, onChange, color }) => (
  <div className="flex items-center justify-between p-7 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
    <div className="flex gap-5 items-center">
      <div className={`w-12 h-12 rounded-2xl ${color}20 ${color.replace('text', 'bg')} flex items-center justify-center ${color} shrink-0`}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-[14px] font-black text-slate-900 mb-0.5">{title}</h4>
        <p className="text-[12px] text-slate-500 font-medium leading-tight max-w-xs">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
        className="sr-only peer" 
      />
      <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
    </label>
  </div>
);

const AdminNotificationsView = () => {
  const [channels, setChannels] = useState({
    email: true,
    push: false,
    sms: false
  });

  const [alerts, setAlerts] = useState({
    studentReg: true,
    teacherOnboard: true,
    paymentSuccess: true,
    systemAlerts: true,
    backupComplete: false,
    securityWarning: true
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
       {/* Global Channels */}
       <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-[120px] -mr-40 -mt-40 opacity-20" />
          <div className="relative z-10">
             <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                   <Bell size={28} className="text-indigo-300" />
                </div>
                <h2 className="text-4xl font-black tracking-tight">Notification Channels</h2>
             </div>
             <p className="text-indigo-300 font-bold uppercase tracking-widest text-[11px] ml-1">Configure how the system communicates with you</p>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[
                  { id: 'email', icon: Mail, label: 'Email Alerts', color: 'text-indigo-300' },
                  { id: 'push', icon: Smartphone, label: 'Push Notifications', color: 'text-emerald-300' },
                  { id: 'sms', icon: Globe, label: 'SMS Gateway', color: 'text-amber-300' }
                ].map(channel => (
                  <button 
                    key={channel.id}
                    onClick={() => setChannels({...channels, [channel.id]: !channels[channel.id]})}
                    className={`flex items-center gap-4 p-6 rounded-3xl border transition-all ${
                      channels[channel.id] 
                        ? 'bg-white/10 border-white/20' 
                        : 'bg-black/20 border-white/5 opacity-40'
                    }`}
                  >
                     <div className={`p-3 bg-white/5 rounded-xl ${channel.color}`}><channel.icon size={20} /></div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{channel.label}</p>
                        <p className="text-sm font-black">{channels[channel.id] ? 'Connected' : 'Offline'}</p>
                     </div>
                  </button>
                ))}
             </div>
          </div>
       </div>

       {/* Specific Event Alerts */}
       <div className="space-y-6">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Event Subscription</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <NotificationSwitch 
               icon={Users} title="New Student Registration" description="Get notified immediately when a new lead registers."
               checked={alerts.studentReg} onChange={() => setAlerts({...alerts, studentReg: !alerts.studentReg})}
               color="text-indigo-600"
             />
             <NotificationSwitch 
               icon={GraduationCap} title="Teacher Onboarding" description="Alerts for new teacher account creation & approvals."
               checked={alerts.teacherOnboard} onChange={() => setAlerts({...alerts, teacherOnboard: !alerts.teacherOnboard})}
               color="text-blue-600"
             />
             <NotificationSwitch 
               icon={CreditCard} title="Direct Payments" description="Instant notifications for all successful fee payments."
               checked={alerts.paymentSuccess} onChange={() => setAlerts({...alerts, paymentSuccess: !alerts.paymentSuccess})}
               color="text-emerald-600"
             />
             <NotificationSwitch 
               icon={ShieldAlert} title="Security Warnings" description="Unauthorized login attempts or sensitive changes."
               checked={alerts.securityWarning} onChange={() => setAlerts({...alerts, securityWarning: !alerts.securityWarning})}
               color="text-rose-600"
             />
             <NotificationSwitch 
               icon={Bell} title="System Maintenance" description="Alerts for scheduled downtime or snapshot completions."
               checked={alerts.backupComplete} onChange={() => setAlerts({...alerts, backupComplete: !alerts.backupComplete})}
               color="text-amber-600"
             />
             <NotificationSwitch 
               icon={Globe} title="Notice Board Updates" description="Get pinged when a staff member publishes a notice."
               checked={alerts.systemAlerts} onChange={() => setAlerts({...alerts, systemAlerts: !alerts.systemAlerts})}
               color="text-slate-600"
             />
          </div>
       </div>

       {/* Footer Note */}
       <div className="text-center py-6 border-t border-slate-50">
          <p className="text-slate-400 text-[11px] font-bold italic">Note: Changes may take up to 2 minutes to propagate across neural gateway.</p>
       </div>
    </div>
  );
};

export default AdminNotificationsView;
