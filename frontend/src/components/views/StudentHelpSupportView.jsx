import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, MessageSquare, Phone, Mail, 
  Clock, ChevronDown, Send, CheckCircle2,
  LifeBuoy, AlertCircle, Bookmark, History
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
            <div className="px-8 pb-6 pt-2 text-[14px] text-slate-500 font-medium leading-relaxed border-t border-slate-50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StudentHelpSupportView = () => {
  const [ticketStatus, setTicketStatus] = useState('idle'); // idle, sending, success
  const [formData, setFormData] = useState({ subject: '', category: 'Technical issue', message: '' });

  const faqs = [
    { question: "How can I download my academic records?", answer: "Go to your Profile Dropdown and select 'Academic Records'. You will see a 'Download PDF' button at the top right of the page." },
    { question: "Where do I join my live classes?", answer: "Live classes appear in your 'Schedule' module. When a class is live, it will show a 'LIVE NOW' badge and a 'Join Now' button." },
    { question: "I missed a deadline, what should I do?", answer: "Contact your assigned teacher immediately through the 'Chat' module to discuss extensions or alternative submissions." },
    { question: "Can I change my registered email address?", answer: "For security reasons, email changes must be requested through the administration office. You can navigate to 'Settings' to view your current details." }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setTicketStatus('sending');
    setTimeout(() => setTicketStatus('success'), 1500);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-24">
      {/* Header Context */}
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-2">
           <LifeBuoy size={32} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Support Universe</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] italic">How can the EduWay team assist you today?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: FAQs and Contact Info */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          <section className="flex flex-col gap-6">
             <div className="flex items-center justify-between px-4">
                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Bookmark size={16} /> Frequency Asked Questions</h3>
                <button className="text-xs font-bold text-indigo-600 hover:underline">View all FAQ →</button>
             </div>
             <div className="flex flex-col gap-3">
               {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
             </div>
          </section>

          <section className="bg-indigo-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-20 -mb-20" />
             <div className="relative flex flex-col gap-8">
                <div>
                   <h3 className="text-2xl font-black mb-2">Need Urgent Assistance?</h3>
                   <p className="text-indigo-200 text-sm font-medium">Our student support lines are active during office hours.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <div className="p-3 bg-white/20 rounded-xl"><Phone size={20} /></div>
                      <div>
                         <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Call Today</p>
                         <p className="text-[15px] font-black">+1 (800) EDU-HELP</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <div className="p-3 bg-white/20 rounded-xl"><Mail size={20} /></div>
                      <div>
                         <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Drop a Mail</p>
                         <p className="text-[15px] font-black">support@eduway.com</p>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 bg-black/20 rounded-2xl self-start">
                   <Clock size={16} className="text-indigo-400" />
                   <span className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Office Hours: Mon - Sat | 9:00 AM - 6:00 PM</span>
                </div>
             </div>
          </section>
        </div>

        {/* Right: Raise Ticket Form */}
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
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Ticket Successfully Raised!</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Your request UID <b>#EW-4921</b> has been logged.<br/>Our representative will contact you within 24 hours.</p>
                 </div>
                 <button onClick={() => setTicketStatus('idle')} className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest mt-6">Log New Query</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">Raise a Support Ticket</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct link to admin desk</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Concern Subject</label>
                     <input 
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      type="text" placeholder="Briefly define the issue..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all" />
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Request Category</label>
                     <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 transition-all cursor-pointer">
                        <option>Technical issue</option>
                        <option>Academic issue</option>
                        <option>Payment issue</option>
                        <option>General enquiry</option>
                     </select>
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Detailed Message</label>
                     <textarea 
                      required
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      rows="5" placeholder="Help us understand better..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none" />
                   </div>

                   {ticketStatus === 'sending' ? (
                     <button disabled className="w-full py-5 bg-slate-200 text-slate-400 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> Loging Request...
                     </button>
                   ) : (
                     <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                        <Send size={18} /> Submit Concern
                     </button>
                   )}
                </form>

                <div className="mt-auto px-4 py-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-400 transition-colors hover:text-indigo-500 cursor-pointer">
                      <History size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest pt-0.5">Ticket History</span>
                   </div>
                   <div className="flex items-center gap-2 text-rose-500 transition-colors hover:text-rose-600 cursor-pointer">
                      <AlertCircle size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest pt-0.5">Urgent?</span>
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

export default StudentHelpSupportView;
