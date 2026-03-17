import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal, CheckCircle, Clock, X, 
  PlayCircle, FileText, User, MapPin, 
  Calendar, SlidersHorizontal, ArrowUpRight,
  Plus, Search, Filter, Layout
} from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';

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

const STORAGE_KEY = 'eduway_student_tasks';

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

// TaskDetail component removed - now using shared TaskDetailModal

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
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (error) {
      console.error('Error parsing tasks from storage:', error);
      return INITIAL_TASKS;
    }
  });
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null); // Track which task's menu is open

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Click outside to close menu
  useEffect(() => {
    const handleClick = () => setActiveMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/40 backdrop-blur-xl border border-white/60 p-3 pl-12 pr-6 rounded-[1.5rem] text-[14px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all w-64"
              />
           </div>
           <button className="p-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[1.5rem] hover:bg-white transition-all">
              <Filter className="w-5 h-5 text-slate-600" />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        {Object.entries(tasks).map(([col, colTasks]) => {
          const filteredTasks = colTasks.filter(t => 
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return (
            <div key={col} className={`rounded-[3rem] p-6 border border-white/60 bg-gradient-to-b shadow-sm ${colStyles[col]} flex flex-col gap-6`}>
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${col === 'Done' ? 'bg-emerald-500' : col === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                   <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-700">{col}</h3>
                </div>
                <span className="text-[11px] font-black bg-white/60 text-slate-900 px-3 py-1 rounded-full shadow-sm">{filteredTasks.length}</span>
              </div>
              
              <div className="flex flex-col gap-5 min-h-[500px]">
                <AnimatePresence>
                  {filteredTasks.length > 0 ? (
                      filteredTasks.map(task => (
                        <div key={task.id} className="relative">
                          <TaskCard
                              task={task}
                              col={col}
                              onClick={() => setSelected({ task, col })}
                          />
                          <div className="absolute top-4 right-4 z-10">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === task.id ? null : task.id);
                              }}
                              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </button>
                            
                            <AnimatePresence>
                              {activeMenu === task.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[100]"
                                >
                                  {['View Details', 'Pin Task', 'Mark as High'].map(item => (
                                    <button 
                                      key={item}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenu(null);
                                        if (item === 'View Details') setSelected({ task, col });
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all"
                                    >
                                      {item}
                                    </button>
                                  ))}
                                    {col === 'In Progress' && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenu(null);
                                          setSelected({ task, col });
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-2"
                                      >
                                        <SlidersHorizontal className="w-4 h-4" /> Update Progress
                                      </button>
                                    )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      ))
                  ) : (
                      <div className="flex flex-col items-center justify-center flex-grow py-20 opacity-20">
                          <Layout className="w-16 h-16 mb-4" />
                          <p className="text-[14px] font-bold uppercase tracking-widest text-center px-10">
                            {searchTerm ? 'No matching tasks' : 'All clear in this section!'}
                          </p>
                      </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <TaskDetailModal
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
