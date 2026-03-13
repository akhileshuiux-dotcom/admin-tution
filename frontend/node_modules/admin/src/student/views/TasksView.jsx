import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal, CheckCircle, Clock, X, 
  PlayCircle, FileText, User, MapPin, 
  Calendar, SlidersHorizontal, ArrowUpRight,
  Plus, Search, Filter
} from 'lucide-react';

const INITIAL_TASKS = {
  'To Do': [
    { id: 1, title: 'Create a comic strip with a story', subject: 'Social Studies', due: 'May 17', teacher: 'Mrs. Murray', priority: 'medium', description: 'Create a 6-panel comic strip illustrating a historical event of your choice. Include dialogue and captions. Submit as PDF.', attachment: 'Comic_Template.pdf' },
    { id: 2, title: 'Prepare for the math test', subject: 'Math', due: 'May 11', teacher: 'Mrs. Goodman', priority: 'high', description: 'Study Chapter 3 (Linear Equations) and Chapter 4 (Quadratic Equations). Review examples from pages 45–72. Practice all end-of-chapter exercises.', attachment: null },
  ],
  'In Progress': [
    { id: 3, title: 'Read poem & answer questions', subject: 'English Literature', due: 'Apr 28', teacher: 'Ms. Melton', priority: 'high', progress: 45, description: 'Read "The Road Not Taken" by Robert Frost. Answer the 5 comprehension questions on the worksheet. Write a short reflection (150 words).', attachment: 'Poem_Worksheet.docx' },
  ],
  'Done': [
    { id: 4, title: 'Biology lab report', subject: 'Biology', due: 'Apr 20', teacher: 'Mr. Hodge', priority: 'low', submitted: true, description: 'Lab report on the cell structure experiment. Include methodology, observations, and conclusion.', attachment: 'Lab_Report_Template.docx' },
  ],
};

const priorityStyles = {
  high: 'bg-rose-100 text-rose-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-emerald-100 text-emerald-600',
};

const colStyles = {
  'To Do': 'from-slate-50 to-slate-100/50 border-slate-200/50',
  'In Progress': 'from-blue-50/50 to-indigo-50/50 border-blue-200/50',
  'Done': 'from-emerald-50/50 to-teal-50/50 border-emerald-200/50',
};

// ── Task Detail Panel ─────────────────────────────────────────────────────────
const TaskDetail = ({ task, col, onClose, onStart, onComplete, onProgressUpdate }) => {
  const [localProgress, setLocalProgress] = useState(task.progress ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] w-full max-w-2xl flex flex-col overflow-hidden border border-white/60"
      >
        <div className="px-10 pt-10 pb-8 flex items-start justify-between gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${priorityStyles[task.priority]}`}>
                {task.priority} priority
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">{task.subject}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight font-plus-jakarta">{task.title}</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            onClick={onClose} 
            className="p-3 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-900 transition-all flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="px-10 py-6 overflow-y-auto max-h-[60vh] custom-scrollbar flex flex-col gap-10">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Teacher', value: task.teacher, icon: User },
              { label: 'Due Date', value: task.due, icon: Calendar },
              { label: 'Platform', value: 'Guardian Learning', icon: MapPin },
              { label: 'Status', value: col, icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/50 border border-slate-100 p-5 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
                  <p className="text-[14px] font-bold text-slate-800 font-plus-jakarta">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
             <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Task Description</h3>
             <p className="text-[16px] text-slate-600 font-medium leading-[1.6] bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/50 italic">
               "{task.description}"
             </p>
          </div>

          {task.attachment && (
            <div className="flex items-center justify-between bg-blue-50/50 rounded-[2rem] p-6 border border-blue-100 group cursor-pointer hover:bg-blue-100/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-blue-900">{task.attachment}</p>
                  <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest">Resource File</p>
                </div>
              </div>
              <ArrowUpRight className="w-6 h-6 text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          )}

          {col === 'In Progress' && (
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
               <SlidersHorizontal className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />
               <div className="flex justify-between items-center mb-8 relative z-10">
                 <h3 className="text-xl font-bold font-plus-jakarta">Current Progress</h3>
                 <span className="text-3xl font-black text-blue-400">{localProgress}%</span>
               </div>
               <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-10 relative z-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${localProgress}%` }}
                    className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  />
               </div>
               <input
                 type="range"
                 min="0" max="100" step="1"
                 value={localProgress}
                 onChange={(e) => setLocalProgress(Number(e.target.value))}
                 className="w-full h-8 opacity-0 absolute inset-0 cursor-pointer z-20"
               />
               <button 
                  onClick={() => onProgressUpdate(task, localProgress)}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-white/90 transition-all relative z-10"
               >
                 Keep Saving Progress
               </button>
            </div>
          )}
        </div>

        <div className="px-10 pb-10 flex gap-4 mt-6">
          {col === 'To Do' && (
            <button
              onClick={() => onStart(task)}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[15px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20"
            >
              <PlayCircle className="w-5 h-5" /> Initiate Task
            </button>
          )}
          {col === 'In Progress' && (
            <button
              onClick={() => onComplete(task)}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-[15px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/20"
            >
              <CheckCircle className="w-5 h-5" /> Finalize & Submit
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Task Card ─────────────────────────────────────────────────────────────────
const TaskCard = ({ task, col, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.01 }}
    onClick={onClick}
    className="group bg-white/70 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all cursor-pointer relative"
  >
    <div className="flex justify-between items-start mb-4">
       <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${priorityStyles[task.priority]}`}>
         {task.priority}
       </span>
       <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded-xl">
         <MoreHorizontal className="w-4 h-4 text-slate-400" />
       </button>
    </div>
    
    <h4 className="text-[17px] font-extrabold text-slate-900 leading-tight mb-6 font-plus-jakarta group-hover:text-blue-600 transition-colors">{task.title}</h4>
    
    {task.progress !== undefined && (
      <div className="mb-6">
         <div className="flex justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
            <span className="text-[10px] font-black text-slate-900">{task.progress}%</span>
         </div>
         <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${task.progress}%` }}
               className="h-full bg-blue-500" 
            />
         </div>
      </div>
    )}

    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
       <div className="flex items-center gap-3 text-slate-400 font-bold text-[11px]">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {task.due}</span>
       </div>
       <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
          <ArrowUpRight className="w-4 h-4" />
       </div>
    </div>
  </motion.div>
);

// ── Main View ─────────────────────────────────────────────────────────────────
const TasksView = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selected, setSelected] = useState(null);

  const handleStart = (task) => {
    setTasks(prev => {
      const todo = prev['To Do'].filter(t => t.id !== task.id);
      const inProg = [...prev['In Progress'], { ...task, progress: 0 }];
      return { ...prev, 'To Do': todo, 'In Progress': inProg };
    });
    setSelected(null);
  };

  const handleComplete = (task) => {
    setTasks(prev => {
      const inProg = prev['In Progress'].filter(t => t.id !== task.id);
      const done = [...prev['Done'], { ...task, submitted: true }];
      return { ...prev, 'In Progress': inProg, 'Done': done };
    });
    setSelected(null);
  };

  const handleProgressUpdate = (task, newProgress) => {
    setTasks(prev => ({
      ...prev,
      'In Progress': prev['In Progress'].map(t =>
        t.id === task.id ? { ...t, progress: newProgress } : t
      ),
    }));
    setSelected(prev => ({ ...prev, task: { ...prev.task, progress: newProgress } }));
  };

  return (
    <div className="flex flex-col gap-10 w-full pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-plus-jakarta">Academic Tasks</h2>
          <p className="text-[15px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">{tasks['To Do'].length + tasks['In Progress'].length} Activities Pending</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Find a task..." 
                className="bg-white/40 backdrop-blur-xl border border-white/60 p-3 pl-12 pr-6 rounded-[1.5rem] text-[14px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all w-64"
              />
           </div>
           <button className="p-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[1.5rem] hover:bg-white transition-all">
              <Filter className="w-5 h-5 text-slate-600" />
           </button>
           <button className="px-6 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all">
              <Plus className="w-5 h-5" /> New Task
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        {Object.entries(tasks).map(([col, colTasks]) => (
          <div key={col} className={`rounded-[3rem] p-6 border border-white/60 bg-gradient-to-b shadow-sm ${colStyles[col]} flex flex-col gap-6`}>
            <div className="flex items-center justify-between px-4 pb-2">
              <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${col === 'Done' ? 'bg-emerald-500' : col === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                 <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-700">{col}</h3>
              </div>
              <span className="text-[11px] font-black bg-white/60 text-slate-900 px-3 py-1 rounded-full shadow-sm">{colTasks.length}</span>
            </div>
            
            <div className="flex flex-col gap-5 min-h-[500px]">
              <AnimatePresence>
                {colTasks.length > 0 ? (
                    colTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            col={col}
                            onClick={() => setSelected({ task, col })}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center flex-grow py-20 opacity-20">
                        <Layout className="w-16 h-16 mb-4" />
                        <p className="text-[14px] font-bold uppercase tracking-widest text-center px-10">All clear in this section!</p>
                    </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <TaskDetail
            task={selected.task}
            col={selected.col}
            onClose={() => setSelected(null)}
            onStart={handleStart}
            onComplete={handleComplete}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksView;
