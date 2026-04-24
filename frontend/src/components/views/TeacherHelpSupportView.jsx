import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, MessageSquare, Phone, Mail, 
  Clock, ChevronDown, Send, CheckCircle2,
  LifeBuoy, AlertCircle, Bookmark, History,
  ShieldAlert, Settings
} from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-5 flex items-center justify-between text-left transition-colors hover:bg-slate-50"
      >
        <span className="text-[15px] font-bold text-slate-800">{question}</span>
        <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} size={20} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-6 pt-2 text-[14px] text-slate-500 font-medium leading-relaxed border-t border-slate-50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeacherHelpSupportView = () => {
  const [ticketStatus, setTicketStatus] = useState('idle');
  const [formData, setFormData] = useState({ subject: '', category: 'Technical issue', message: '' });

  const faqs = [
    { question: "How do I mark student attendance?", answer: "Navigate to the 'Attendance' module from the sidebar, select your class, and mark the students present or absent. Don't forget to click 'Save Attendance' at the bottom." },
    { question: "Can I edit an exam after it's published?", answer: "Once results are published, editing is restricted to avoid data inconsistency. If you need to fix a grading error, please contact the Super Admin." },
    { question: "How do I schedule a staff meeting?", answer: "Staff meetings are typically scheduled by admins. However, you can use the 'Meetings' module to request a sync with your fellow faculty members." },
    { question: "Where can I upload course materials?", answer: "Use the 'Notes' module to upload PDF, Doc, or Video materials for your assigned classes. Students will see these in their 'Notes' section instantly." }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setTicketStatus('sending');
    setTimeout(() => setTicketStatus('success'), 1500);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-24">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-2">
           <LifeBuoy size={32} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Faculty Support Desk</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] italic">How can we assist our educators today?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 flex flex-col gap-10">
          <section className="flex flex-col gap-6">
             <div className="flex items-center justify-between px-4">
                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Bookmark size={16} /> Faculty FAQ Library</h3>
                <button className="text-xs font-bold text-emerald-600 hover:underline">Full Resource Center →</button>
             </div>
             <div className="flex flex-col gap-3">
               {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
             </div>
          </section>

          <section className="bg-emerald-950 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[100px] -mr-40 -mt-40" />
             <div className="relative flex flex-col gap-8">
                <div>
                   <h3 className="text-2xl font-black mb-2">Administrative Priority Line</h3>
                   <p className="text-emerald-200 text-sm font-medium">Direct contact for faculty emergencies and campus coordination.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <div className="p-3 bg-white/20 rounded-xl"><Phone size={20} /></div>
                      <div>
                         <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1">Internal Extension</p>
                         <p className="text-[15px] font-black">Ext: 402 (Admin Desk)</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <div className="p-3 bg-white/20 rounded-xl"><Mail size={20} /></div>
                      <div>
                         <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1">Priority Email</p>
                         <p className="text-[15px] font-black">admin-help@eduway.com</p>
                      </div>
                   </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl">
                     <Clock size={16} className="text-emerald-400" />
                     <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest text-[10px]">Priority Sync: 8 AM - 8 PM</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/20 rounded-2xl text-emerald-300">
                     <ShieldAlert size={16} />
                     <span className="text-xs font-black uppercase tracking-widest text-[10px]">Security Incident Line: 24/7</span>
                  </div>
                </div>
             </div>
          </section>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col h-full"
          >
            {ticketStatus === 'success' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-10">
                 <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 size={48} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Request Logged</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Reference ID: <b>#TCH-ADMIN-022</b>.<br/>The administrative desk has been notified of your request.</p>
                 </div>
                 <button onClick={() => setTicketStatus('idle')} className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest mt-6">Create New Log</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">Admin Outreach Form</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Staff-to-Admin direct link</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Request Subject</label>
                     <input 
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      type="text" placeholder="Title of your concern..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all" />
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Category</label>
                     <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-400 transition-all cursor-pointer">
                        <option>Technical issue</option>
                        <option>Academic/Class coordination</option>
                        <option>Leave Request</option>
                        <option>General Support</option>
                     </select>
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Context</label>
                     <textarea 
                      required
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      rows="5" placeholder="Narrate the requirement..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none" />
                   </div>

                   {ticketStatus === 'sending' ? (
                     <button disabled className="w-full py-5 bg-emerald-50 text-emerald-200 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> Recording...
                     </button>
                   ) : (
                     <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3">
                        <Send size={18} /> Transmit Request
                     </button>
                   )}
                </form>

                <div className="mt-auto px-4 py-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-400 transition-colors hover:text-emerald-500 cursor-pointer">
                      <History size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest pt-0.5">Interaction History</span>
                   </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHelpSupportView;
