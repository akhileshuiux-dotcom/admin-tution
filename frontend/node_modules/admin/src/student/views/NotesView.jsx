import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Bookmark, FileText, Video, Image as ImageIcon, Tag, Plus, ChevronRight, Hash, ArrowUpRight } from 'lucide-react';

const NOTES = [
  { id: 1, title: 'Math Conspect – Linear Equations', subject: 'Mathematics', chapter: 'Chapter 3', date: 'May 05, 2025', type: 'pdf', color: 'from-blue-500 to-indigo-600', tag: 'conspectus', content: 'A linear equation is ax+b=c, where x is the unknown variable...' },
  { id: 2, title: 'Biology – Cell Structure', subject: 'Biology', chapter: 'Chapter 1', date: 'Apr 29, 2025', type: 'pdf', color: 'from-emerald-400 to-teal-600', tag: 'notes', content: 'A cell is the basic structural, functional, and biological unit of all living organisms...' },
  { id: 3, title: 'English – Poem Analysis', subject: 'English Literature', chapter: 'Chapter 5', date: 'Apr 20, 2025', type: 'doc', color: 'from-violet-500 to-purple-600', tag: 'summary', content: 'The poem explores themes of loss, hope, and resilience through rich imagery...' },
  { id: 4, title: 'Social Studies – Industrial Revolution', subject: 'Social Studies', chapter: 'Chapter 8', date: 'Apr 15, 2025', type: 'video', color: 'from-orange-400 to-amber-600', tag: 'resource', content: 'Overview of the Industrial Revolution 1760–1840 including key events and inventors...' },
  { id: 5, title: 'Math – Quadratic Equations', subject: 'Mathematics', chapter: 'Chapter 4', date: 'May 10, 2025', type: 'pdf', color: 'from-blue-500 to-indigo-600', tag: 'conspectus', content: 'The quadratic formula solves ax²+bx+c=0: x = (-b±√(b²-4ac))/2a...' },
  { id: 6, title: 'Biology – Photosynthesis', subject: 'Biology', chapter: 'Chapter 4', date: 'May 03, 2025', type: 'pdf', color: 'from-emerald-400 to-teal-600', tag: 'notes', content: 'Photosynthesis converts CO₂ and H₂O into glucose and oxygen using sunlight...' },
];

const tagColors = { 
    conspectus: 'bg-blue-100 text-blue-600', 
    notes: 'bg-slate-100 text-slate-600', 
    summary: 'bg-violet-100 text-violet-600', 
    resource: 'bg-amber-100 text-amber-600' 
};
const typeIcons = { pdf: FileText, doc: FileText, video: Video, image: ImageIcon };

const NotesView = () => {
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const subjects = ['All', ...new Set(NOTES.map(n => n.subject))];

  const filtered = NOTES.filter(n =>
    (activeSubject === 'All' || n.subject === activeSubject) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-10 w-full pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-plus-jakarta">Library</h2>
          <p className="text-[15px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">{NOTES.length} Academic Resources</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-900/10 hover:bg-black transition-all">
              <Plus className="w-5 h-5" /> Create Note
           </button>
        </div>
      </div>

      {/* Modern Search & Categorization */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative group w-full lg:w-[400px]">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[1.8rem] text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            placeholder="Search resources..." 
          />
        </div>
        <div className="flex items-center gap-2 p-2 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm overflow-x-auto no-scrollbar w-full lg:w-auto">
          {subjects.map(s => (
            <button key={s} onClick={() => setActiveSubject(s)}
              className={`px-6 py-2.5 rounded-[1.2rem] text-[13px] font-black transition-all whitespace-nowrap ${
                activeSubject === s 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-white'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((note, i) => {
            const TypeIcon = typeIcons[note.type] || FileText;
            return (
              <motion.div 
                key={note.id} 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8 }} 
                className="group bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-2xl transition-all flex flex-col gap-6 cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center bg-gradient-to-br ${note.color} shadow-lg shadow-blue-500/10`}>
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  <button className="p-3 bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-900 hover:bg-slate-100 transition-all">
                      <Bookmark className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-grow flex flex-col gap-3 relative z-10">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{note.subject}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{note.chapter}</span>
                   </div>
                   <h4 className="text-[18px] font-extrabold text-slate-900 leading-tight font-plus-jakarta pr-4 group-hover:text-blue-600 transition-colors">
                      {note.title}
                   </h4>
                   <p className="text-[14px] text-slate-500 font-medium leading-relaxed line-clamp-2 italic">
                      "{note.content}"
                   </p>
                </div>

                <div className="flex items-center justify-between mt-4 relative z-10">
                   <div className="flex gap-2">
                       <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${tagColors[note.tag]}`}>
                           {note.tag}
                       </span>
                   </div>
                   <motion.button 
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg transition-transform"
                   >
                      <Download className="w-4 h-4" />
                   </motion.button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase tracking-widest border-t border-slate-50 pt-5 relative z-10">
                   <span>Archived: {note.date}</span>
                   <div className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                       Read More <ChevronRight className="w-3 h-3" />
                   </div>
                </div>
                
                {/* Decorative Pattern */}
                <Hash className="absolute -bottom-10 -right-10 w-40 h-40 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action Banner */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="mt-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3.5rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group"
      >
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="relative z-10">
              <h3 className="text-3xl font-black font-plus-jakarta mb-4 tracking-tight">Need specific help?</h3>
              <p className="text-white/50 font-bold max-w-lg leading-relaxed text-[15px]">
                  Our AI personal tutor can help you summarize these notes or generate practice questions based on the content.
              </p>
          </div>
          <button className="bg-white text-slate-900 px-12 py-5 rounded-[2rem] font-black text-[14px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-50 transition-all relative z-10 flex items-center gap-3">
              Ask AI Assistant <ArrowUpRight className="w-5 h-5" />
          </button>
      </motion.div>
    </div>
  );
};

export default NotesView;
