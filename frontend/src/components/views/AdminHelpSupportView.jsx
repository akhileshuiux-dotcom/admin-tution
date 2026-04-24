import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, MessageSquare, Phone, Mail, 
  Clock, ChevronDown, Send, CheckCircle2,
  LifeBuoy, AlertCircle, Bookmark, History, ShieldCheck
} from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left transition-colors hover:bg-slate-50"
      >
        <span className="text-[15px] font-black text-slate-800">{question}</span>
        <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} size={20} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 pt-2 text-[14px] text-slate-500 font-bold leading-relaxed border-t border-slate-50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminHelpSupportView = () => {
  const [ticketStatus, setTicketStatus] = useState('idle'); // idle, sending, success
  const [formData, setFormData] = useState({ subject: '', category: 'System maintenance', message: '' });

  const faqs = [
    { question: "How do I audit financial transactions?", answer: "Navigate to 'Payment & Finance' and use the 'Audit Log' tab to view all system-generated financial records. Every entry is linked to its originating module (Student Payment, Salary, or Expense)." },
    { question: "Can I recover a deleted student record?", answer: "For security reasons, records deleted by a Super Admin are permanently purged. We recommend using 'Inactive' status instead of deletion for auditing purposes." },
    { question: "How to update system-wide tuition fee tiers?", answer: "Go to 'Curriculum' -> 'Settings' to update global pricing. Note that this only affects new enrollments; existing student fees must be updated manually in their profiles." },
    { question: "Where can I view all scheduled admin meetings?", answer: "Select 'Admin Meetings' from the primary sidebar. You can manage attendees, upload minutes of meeting (MOM), and set mandatory attendance flags." }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setTicketStatus('sending');
    setTimeout(() => setTicketStatus('success'), 1500);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-14 pb-24">
      {/* Header Context */}
      <div className="text-center flex flex-col items-center gap-4 bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
        <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl mb-2 relative">
           <LifeBuoy size={38} />
           <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-4 border-white"><ShieldCheck size={14} /></div>
        </div>
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight">Enterprise Infrastructure Support</h2>
           <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] italic mt-2">Dedicated Neural Support Line for Super Administrators</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: FAQs and Contact Info */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          <section className="flex flex-col gap-8">
             <div className="flex items-center justify-between px-6">
                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3"><Bookmark size={18} className="text-indigo-500" /> Admin Knowledge Base</h3>
                <button className="text-xs font-black text-indigo-600 hover:underline px-4 py-2 bg-indigo-50 rounded-xl">Portal Documentation</button>
             </div>
             <div className="flex flex-col gap-4">
               {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
             </div>
          </section>

          <section className="bg-slate-950 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/5">
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] -mr-48 -mb-48 opacity-20" />
             <div className="relative flex flex-col gap-10">
                <div>
                   <h3 className="text-3xl font-black mb-2 tracking-tight">Direct Priority Response</h3>
                   <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Global Support Status: <span className="text-emerald-400">Online</span></p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="flex items-center gap-5 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                      <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl"><Phone size={24} /></div>
                      <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">VIP Priority Line</p>
                         <p className="text-lg font-black tracking-tight">+1-800-SUPER-ADMIN</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-5 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
                      <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl"><Mail size={24} /></div>
                      <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Encrypted Mail</p>
                         <p className="text-lg font-black tracking-tight">nexus@eduway.com</p>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-4 px-8 py-5 bg-white/5 rounded-2xl self-start border border-white/5">
                   <Clock size={18} className="text-indigo-400" />
                   <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Average Wait Time: ~2 Minutes for Super Admin Requests</span>
                </div>
             </div>
          </section>
        </div>

        {/* Right: Raise Ticket Form */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col h-full sticky top-32"
          >
            {ticketStatus === 'success' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 py-10">
                 <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/10 relative">
                    <CheckCircle2 size={56} />
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-emerald-100"><ShieldCheck size={20} /></motion.div>
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">Nexus Ticket Logged</h3>
                    <p className="text-slate-500 text-sm font-bold leading-relaxed px-4 italic">Request <b>#NXS-482-9Q</b> has been tagged with "High Priority". The core development team is reviewing your log.</p>
                 </div>
                 <button onClick={() => setTicketStatus('idle')} className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest mt-6 shadow-xl hover:bg-slate-800 transition-all">Raise New Nexus Ticket</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-5 mb-12">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">Nexus Support Desk</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct bridge to infrastructure core</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                   <div className="flex flex-col gap-2.5">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Context Subject</label>
                     <input 
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      type="text" placeholder="e.g. Finance module latency..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-5 text-[15px] font-bold text-slate-800 outline-none focus:border-indigo-400 focus:ring-8 focus:ring-indigo-500/5 transition-all" />
                   </div>
                   <div className="flex flex-col gap-2.5">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Support Category</label>
                     <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-5 text-[15px] font-bold text-slate-800 outline-none focus:border-indigo-400 transition-all cursor-pointer appearance-none">
                        <option>System maintenance</option>
                        <option>Database audit</option>
                        <option>Financial mismatch</option>
                        <option>Feature request</option>
                        <option>Security incident</option>
                     </select>
                   </div>
                   <div className="flex flex-col gap-2.5">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Detailed Technical Report</label>
                     <textarea 
                      required
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      rows="6" placeholder="Help us understand the situation..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-[15px] font-bold text-slate-800 outline-none focus:border-indigo-400 focus:ring-8 focus:ring-indigo-500/5 transition-all resize-none" />
                   </div>

                   {ticketStatus === 'sending' ? (
                     <button disabled className="w-full py-6 bg-slate-200 text-slate-400 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4">
                        <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> Synchronizing Request...
                     </button>
                   ) : (
                     <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 active:scale-95">
                        <Send size={20} className="mb-0.5" /> Submit Nexus Concern
                     </button>
                   )}
                </form>

                <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between px-4">
                   <div className="flex items-center gap-3 text-slate-400 transition-colors hover:text-indigo-500 cursor-pointer">
                      <History size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] pt-0.5">Nexus Log</span>
                   </div>
                   <div className="flex items-center gap-3 text-rose-500 transition-colors hover:text-rose-600 cursor-pointer">
                      <AlertCircle size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] pt-0.5">Critical Emergency?</span>
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

export default AdminHelpSupportView;
