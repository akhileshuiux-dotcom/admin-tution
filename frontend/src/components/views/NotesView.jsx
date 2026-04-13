import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, CheckCircle, Clock, X, PlayCircle, FileText, User, MapPin, Calendar, SlidersHorizontal, Search, Video, Link as LinkIcon, Download, Bookmark, Eye, ExternalLink } from 'lucide-react';
import api from '../../api';

const typeIcons = { pdf: FileText, doc: FileText, video: LinkIcon, video_file: Video, link: LinkIcon };

const STORAGE_KEY = 'eduway_notes_tracking';

const getTracking = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
};

const saveTracking = (tracking) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracking));
};

const colStyles = {
  'To Do': 'bg-slate-50 border-slate-200',
  'In Progress': 'bg-blue-50 border-blue-200',
  'Done': 'bg-emerald-50 border-emerald-200',
};

const NoteDetail = ({ note, col, onClose, onStart, onProgressUpdate }) => {
  const [localProgress, setLocalProgress] = useState(note.progress ?? 0);

  const progressColor =
    localProgress >= 100 ? 'bg-emerald-500' :
    localProgress >= 40 ? 'bg-blue-500' : 'bg-amber-400';

  const isCompleted = col === 'Done' || localProgress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onClose}
      style={{ pointerEvents: 'auto' }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col overflow-hidden m-auto" 
        style={{ maxHeight: '95vh', height: '100%' }}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shadow-sm z-10 bg-white">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900">{note.title}</h3>
            <p className="text-sm text-slate-500">{note.subject} • {note.type.toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-4">
            
            {(col === 'To Do' || col === 'In Progress') && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full text-white ${progressColor}`}>
                    {localProgress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0" max="100" step="5"
                  value={localProgress}
                  onChange={(e) => setLocalProgress(Number(e.target.value))}
                  className="w-32 h-2 rounded-full appearance-none bg-slate-200 accent-blue-600 cursor-pointer"
                />
                <button
                  onClick={() => {
                    const finalStatus = localProgress >= 100 ? 'Done' : 'In Progress';
                    onProgressUpdate(note, localProgress, finalStatus);
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
                >
                  Save Progress
                </button>
              </div>
            )}
            
            {isCompleted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-sm border border-emerald-200">
                <CheckCircle className="w-4 h-4" /> Completed
              </div>
            )}

            {(note.type === 'pdf' || note.type === 'video_file') && (
              <a href={note.file} download className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors">
                <Download className="w-4 h-4" /> Download
              </a>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-hidden bg-slate-50 flex flex-col relative">
          {col === 'To Do' && (
             <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
                <div className="p-8 bg-white rounded-3xl shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Start Note Tracking</h3>
                    <p className="text-sm text-slate-500">Begin viewing this resource and we will track your progress automatically in the 'In Progress' column.</p>
                  </div>
                  <button 
                    onClick={() => {
                      onStart(note);
                    }}
                    className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 mt-2 shadow-lg hover:shadow-blue-500/20 transition-all"
                  >
                    Start Reading
                  </button>
                </div>
             </div>
          )}

          <div className="w-full h-full flex items-center justify-center p-0 m-0 overflow-y-auto">
             {note.type === 'pdf' && (
                <iframe src={note.file} style={{ width: '100%', height: '100%', border: 'none' }} title={note.title} />
             )}
             {note.type === 'video_file' && (
                <video controls autoPlay className="max-w-full max-h-full shadow-sm bg-black object-contain w-full h-full">
                  <source src={note.file} />
                  Your browser does not support the video tag.
                </video>
             )}
             {(note.type === 'video' || note.type === 'link') && (
                <div className="text-center">
                    <p className="text-slate-600 mb-4">This resource is an external link.</p>
                    <a href={note.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg">
                      <ExternalLink className="w-4 h-4" /> Open Link Automatically
                    </a>
                </div>
             )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NoteCard = ({ note, col, onClick }) => {
  const TypeIcon = typeIcons[note.type] || FileText;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3 cursor-pointer group"
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow pr-2">
          <h4 className="text-[14px] font-medium text-slate-900 leading-tight">{note.title}</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">{note.subject}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${note.color.split(' ')[0]} ${note.color.split(' ')[1]}`}>
           <TypeIcon className="w-4 h-4" />
        </div>
      </div>
      
      {note.progress !== undefined && col !== 'To Do' && (
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
          <div className={`h-full ${col === 'Done' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${col === 'Done' ? 100 : note.progress}%` }} />
        </div>
      )}

      <div className="flex justify-between items-center mt-1">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
          <span className="uppercase">{note.type}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{note.date}</span>
        </div>
        {col === 'Done' ? (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        ) : col === 'In Progress' ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[11px] font-semibold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 opacity-0 group-hover:opacity-100"
          >
            <SlidersHorizontal className="w-3 h-3" /> Update
          </button>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[11px] font-semibold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
          >
            Start
          </button>
        )}
      </div>
    </motion.div>
  );
};

const NotesView = () => {
  const [columns, setColumns] = useState({ 'To Do': [], 'In Progress': [], 'Done': [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [selectedNote, setSelectedNote] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/resources/');
      const tracking = getTracking();
      
      const newColumns = { 'To Do': [], 'In Progress': [], 'Done': [] };
      const subjects = new Set(['All']);

      resp.data.forEach(n => {
        const tr = tracking[n.id] || { progress: 0, status: 'To Do' };
        
        let status = tr.status;
        if (!newColumns[status]) status = 'To Do';
        
        const subject = n.course_name || 'General';
        subjects.add(subject);

        newColumns[status].push({
          id: n.id,
          title: n.title,
          subject: subject,
          date: new Date(n.created_at || Date.now()).toLocaleDateString(),
          type: n.file_type,
          color: n.file_type === 'pdf' ? 'bg-blue-100 text-blue-700' : 
                 (n.file_type === 'video' || n.file_type === 'video_file') ? 'bg-orange-100 text-orange-700' : 
                 'bg-emerald-100 text-emerald-700',
          url: n.url,
          file: n.file,
          progress: tr.progress,
          status: status
        });
      });

      setAllSubjects(Array.from(subjects));
      setColumns(newColumns);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (note) => {
    const tr = getTracking();
    tr[note.id] = { progress: 0, status: 'In Progress' };
    saveTracking(tr);
    
    setColumns(prev => {
      const todo = prev['To Do'].filter(t => t.id !== note.id);
      const inProg = [...prev['In Progress'], { ...note, progress: 0, status: 'In Progress' }];
      return { ...prev, 'To Do': todo, 'In Progress': inProg };
    });
    
    if (note.type === 'video' || note.type === 'link') {
       window.open(note.url, '_blank', 'noopener,noreferrer');
       setSelectedNote(null);
    } else {
       setSelectedNote({ note: { ...note, progress: 0, status: 'In Progress' }, col: 'In Progress' });
    }
  };

  const handleProgressUpdate = (note, newProgress, finalStatus) => {
    const tr = getTracking();
    tr[note.id] = { progress: newProgress, status: finalStatus };
    saveTracking(tr);

    setColumns(prev => {
      const oldCol = note.status;
      const strippedOldCol = prev[oldCol].filter(t => t.id !== note.id);
      
      const newNote = { ...note, progress: newProgress, status: finalStatus };
      const targetCol = [...prev[finalStatus], newNote];
      
      return {
         ...prev,
         [oldCol]: strippedOldCol,
         [finalStatus]: targetCol
      };
    });
  };

  const processColumn = (colName, colTasks) => {
    return colTasks.filter(n =>
      (activeSubject === 'All' || n.subject === activeSubject) &&
      (n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()))
    );
  };

  const totalPending = columns['To Do'].length + columns['In Progress'].length;

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-6rem)]">
      <div>
        <h2 className="text-[22px] font-semibold text-slate-900">My Notes</h2>
        <p className="text-sm text-slate-400 font-medium mt-0.5">Track your notes progress and completion status · {totalPending} pending</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-[13px] placeholder:text-slate-300 focus:outline-none shadow-sm"
            placeholder="Search notes, subjects..." />
        </div>
        <div className="flex gap-2 bg-white rounded-2xl p-1 border border-slate-100 shadow-sm flex-wrap overflow-x-auto max-w-[50%] no-scrollbar">
          {allSubjects.map(s => (
            <button key={s} onClick={() => setActiveSubject(s)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-normal transition-all whitespace-nowrap ${activeSubject === s ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-grow overflow-hidden h-full">
        {loading ? (
             <div className="col-span-full py-20 text-center text-slate-400">Loading notes tracking board...</div>
        ) : Object.entries(columns).map(([col, colTasks]) => {
          const filtered = processColumn(col, colTasks);
          return (
            <div key={col} className={`rounded-3xl p-4 border-2 ${colStyles[col]} flex flex-col gap-3 h-full overflow-y-auto no-scrollbar`}>
              <div className="flex items-center justify-between px-1 sticky top-0 bg-transparent z-10 backdrop-blur-sm pb-2">
                <h3 className="text-[13px] font-semibold uppercase tracking-widest text-slate-600">{col}</h3>
                <span className="text-[11px] font-semibold bg-white text-slate-700 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">{filtered.length}</span>
              </div>
              <AnimatePresence>
                {filtered.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    col={col}
                    onClick={() => setSelectedNote({ note, col })}
                  />
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200/50 rounded-2xl">
                  No notes in this column.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedNote && (
          <NoteDetail
            note={selectedNote.note}
            col={selectedNote.col}
            onClose={() => setSelectedNote(null)}
            onStart={handleStart}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesView;
