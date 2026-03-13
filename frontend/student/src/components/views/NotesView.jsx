import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Bookmark, FileText, Video, Image as ImageIcon, Tag, Plus } from 'lucide-react';

const NOTES = [
  { id: 1, title: 'Math Conspect – Linear Equations', subject: 'Mathematics', chapter: 'Chapter 3', date: 'May 05, 2025', type: 'pdf', color: 'bg-blue-100 text-blue-700', tag: 'conspectus', content: 'A linear equation is ax+b=c, where x is the unknown variable...' },
  { id: 2, title: 'Biology – Cell Structure', subject: 'Biology', chapter: 'Chapter 1', date: 'Apr 29, 2025', type: 'pdf', color: 'bg-emerald-100 text-emerald-700', tag: 'notes', content: 'A cell is the basic structural, functional, and biological unit of all living organisms...' },
  { id: 3, title: 'English – Poem Analysis', subject: 'English Literature', chapter: 'Chapter 5', date: 'Apr 20, 2025', type: 'doc', color: 'bg-violet-100 text-violet-700', tag: 'summary', content: 'The poem explores themes of loss, hope, and resilience through rich imagery...' },
  { id: 4, title: 'Social Studies – Industrial Revolution', subject: 'Social Studies', chapter: 'Chapter 8', date: 'Apr 15, 2025', type: 'video', color: 'bg-orange-100 text-orange-700', tag: 'resource', content: 'Overview of the Industrial Revolution 1760–1840 including key events and inventors...' },
  { id: 5, title: 'Math – Quadratic Equations', subject: 'Mathematics', chapter: 'Chapter 4', date: 'May 10, 2025', type: 'pdf', color: 'bg-blue-100 text-blue-700', tag: 'conspectus', content: 'The quadratic formula solves ax²+bx+c=0: x = (-b±√(b²-4ac))/2a...' },
  { id: 6, title: 'Biology – Photosynthesis', subject: 'Biology', chapter: 'Chapter 4', date: 'May 03, 2025', type: 'pdf', color: 'bg-emerald-100 text-emerald-700', tag: 'notes', content: 'Photosynthesis converts CO₂ and H₂O into glucose and oxygen using sunlight...' },
];

const tagColors = { conspectus: 'bg-blue-100 text-blue-600', notes: 'bg-slate-100 text-slate-600', summary: 'bg-violet-100 text-violet-600', resource: 'bg-amber-100 text-amber-600' };
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
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h2 className="text-[22px] font-semibold text-slate-900">Notes Library</h2>
        <p className="text-sm text-slate-400 font-medium mt-0.5">{NOTES.length} resources · searchable</p>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-[13px] placeholder:text-slate-300 focus:outline-none shadow-sm"
            placeholder="Search by title, subject..." />
        </div>
        <div className="flex gap-2 bg-white rounded-2xl p-1 border border-slate-100 shadow-sm">
          {subjects.map(s => (
            <button key={s} onClick={() => setActiveSubject(s)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-normal transition-all ${activeSubject === s ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((note, i) => {
          const TypeIcon = typeIcons[note.type] || FileText;
          return (
            <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3 cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${note.color.split(' ')[0]}`}>
                  <TypeIcon className={`w-5 h-5 ${note.color.split(' ')[1]}`} />
                </div>
                <Bookmark className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
              </div>
              <div className="flex-grow">
                <h4 className="text-[14px] font-semibold text-slate-900 leading-snug">{note.title}</h4>
                <p className="text-[12px] text-slate-400 font-medium mt-1 line-clamp-2">{note.content}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors[note.tag]}`}>{note.tag}</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{note.chapter}</span>
                </div>
                <button className="flex items-center gap-1 text-[11px] font-normal text-slate-400 hover:text-slate-900 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[10px] text-slate-300 font-medium border-t border-slate-50 pt-2">{note.date}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default NotesView;
