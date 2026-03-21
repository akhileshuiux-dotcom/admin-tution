import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, CheckCircle, Clock, X, PlayCircle, FileText, User, MapPin, Calendar, SlidersHorizontal } from 'lucide-react';

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

const STORAGE_KEY = 'eduway_tasks';

const loadTasks = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : INITIAL_TASKS;
};

const priorityColors = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-emerald-100 text-emerald-600',
};

const colStyles = {
  'To Do': 'bg-slate-50 border-slate-200',
  'In Progress': 'bg-blue-50 border-blue-200',
  'Done': 'bg-emerald-50 border-emerald-200',
};

const TaskDetail = ({ task, col, onClose, onStart, onComplete, onProgressUpdate }) => {
  const [localProgress, setLocalProgress] = useState(task.progress ?? 0);

  const progressColor =
    localProgress >= 75 ? 'bg-emerald-500' :
    localProgress >= 40 ? 'bg-blue-500' : 'bg-amber-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
      >
        <div className="px-7 pt-7 pb-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className={`self-start text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase ${priorityColors[task.priority]}`}>
              {task.priority} priority
            </span>
            <h2 className="text-[18px] font-semibold text-slate-900 leading-snug">{task.title}</h2>
          </div>
          <button onClick={onClose} className="mt-1 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-7 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-4 py-3">
              <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Teacher</p>
                <p className="text-[13px] font-medium text-slate-700">{task.teacher}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-4 py-3">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Due Date</p>
                <p className="text-[13px] font-medium text-slate-700">{task.due}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-4 py-3">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Subject</p>
                <p className="text-[13px] font-medium text-slate-700">{task.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-4 py-3">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Status</p>
                <p className="text-[13px] font-medium text-slate-700">{col}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold mb-2">Task Description</p>
            <p className="text-[14px] text-slate-600 leading-relaxed">{task.description}</p>
          </div>

          {task.attachment && (
            <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-[13px] text-blue-700 font-medium flex-grow">{task.attachment}</span>
              <button className="text-[11px] text-blue-600 font-semibold hover:underline">Download</button>
            </div>
          )}

          {col === 'In Progress' && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <p className="text-[13px] font-semibold text-slate-700">Update Progress</p>
                </div>
                <span className={`text-[14px] font-semibold px-3 py-0.5 rounded-full text-white ${
                  localProgress >= 75 ? 'bg-emerald-500' : localProgress >= 40 ? 'bg-blue-500' : 'bg-amber-400'
                }`}>{localProgress}%</span>
              </div>

              <input
                type="range"
                min="0" max="100" step="5"
                value={localProgress}
                onChange={(e) => setLocalProgress(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-500"
              />

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${progressColor}`}
                  animate={{ width: `${localProgress}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
              </div>

              <div className="flex gap-2">
                {[25, 50, 75, 100].map(v => (
                  <button
                    key={v}
                    onClick={() => setLocalProgress(v)}
                    className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
                      localProgress === v
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>

              <button
                onClick={() => onProgressUpdate(task, localProgress)}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-semibold hover:bg-blue-700 transition-all"
              >
                Save Progress
              </button>
            </div>
          )}
        </div>

        <div className="px-7 pb-7 flex gap-3">
          {col === 'To Do' && (
            <button
              onClick={() => onStart(task)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl font-medium text-[14px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <PlayCircle className="w-4 h-4" /> Start Task
            </button>
          )}
          {col === 'In Progress' && (
            <button
              onClick={() => onComplete(task)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-2xl font-medium text-[14px] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle className="w-4 h-4" /> Mark as Complete
            </button>
          )}
          {col === 'Done' && (
            <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-medium text-[14px] border border-emerald-200">
              <CheckCircle className="w-4 h-4" /> Submitted
            </div>
          )}
          <button
            onClick={onClose}
            className="px-5 py-3 border border-slate-200 text-slate-600 rounded-2xl font-medium text-[14px] hover:bg-slate-50 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const TaskCard = ({ task, col, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
    onClick={onClick}
    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3 cursor-pointer"
  >
    <div className="flex justify-between items-start">
      <div className="flex-grow pr-2">
        <h4 className="text-[14px] font-medium text-slate-900 leading-tight">{task.title}</h4>
        <p className="text-[11px] text-slate-400 mt-0.5">{task.subject} · {task.teacher}</p>
      </div>
      <MoreHorizontal className="w-4 h-4 text-slate-300 flex-shrink-0" />
    </div>
    {task.progress !== undefined && (
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${task.progress}%` }} />
      </div>
    )}
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${priorityColors[task.priority]}`}>{task.priority}</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400"><Clock className="w-3 h-3" />{task.due}</span>
      </div>
      {col === 'Done' ? (
        <CheckCircle className="w-4 h-4 text-emerald-500" />
      ) : col === 'In Progress' ? (
        <button 
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[11px] font-semibold hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1"
        >
          <SlidersHorizontal className="w-3 h-3" /> Update
        </button>
      ) : (
        <span className="text-[11px] text-blue-500 font-medium">View →</span>
      )}
    </div>
  </motion.div>
);

const TasksView = () => {
  const [tasks, setTasks] = useState(loadTasks());
  const [selected, setSelected] = useState(null);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

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
    setSelected(prev => ({
      ...prev,
      task: { ...prev.task, progress: newProgress },
    }));
  };

  const totalPending = tasks['To Do'].length + tasks['In Progress'].length;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h2 className="text-[22px] font-semibold text-slate-900">My Tasks</h2>
        <p className="text-sm text-slate-400 font-medium mt-0.5">{totalPending} tasks pending · click any card to view details</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {Object.entries(tasks).map(([col, colTasks]) => (
          <div key={col} className={`rounded-3xl p-4 border-2 ${colStyles[col]} flex flex-col gap-3`}>
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[13px] font-semibold uppercase tracking-widest text-slate-600">{col}</h3>
              <span className="text-[11px] font-semibold bg-white text-slate-700 w-6 h-6 rounded-full flex items-center justify-center shadow-sm">{colTasks.length}</span>
            </div>
            <AnimatePresence>
              {colTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  col={col}
                  onClick={() => setSelected({ task, col })}
                />
              ))}
            </AnimatePresence>
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
