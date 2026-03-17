import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, User, Calendar, MapPin, Clock, FileText, 
  ArrowUpRight, SlidersHorizontal, PlayCircle, CheckCircle 
} from 'lucide-react';

const priorityStyles = {
  high: 'bg-rose-100 text-rose-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-emerald-100 text-emerald-600',
};

const TaskDetailModal = ({ task, col, onClose, onStart, onComplete, onProgressUpdate }) => {
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
                {task.priority || 'medium'} priority
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
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden ring-1 ring-white/10">
               <SlidersHorizontal className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />
               <div className="flex justify-between items-center mb-8 relative z-10">
                 <div>
                    <h3 className="text-xl font-bold font-plus-jakarta italic">Current Progress</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Slide to adjust status</p>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-4xl font-black text-blue-400 leading-none">{localProgress}%</span>
                    <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-tighter">Live Update</span>
                 </div>
               </div>
               
               <div className="relative z-10 space-y-6">
                 <div className="relative pt-2 pb-6">
                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-white/10 rounded-full -translate-y-1/2 overflow-hidden">
                       <motion.div 
                          initial={false}
                          animate={{ width: `${localProgress}%` }}
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                       />
                    </div>
                    <input
                      type="range"
                      min="0" max="100" step="1"
                      value={localProgress}
                      onChange={(e) => setLocalProgress(Number(e.target.value))}
                      className="relative w-full h-6 bg-transparent appearance-none cursor-pointer z-20 
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                                [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full 
                                [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,255,255,0.5)]
                                [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-blue-600
                                [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                                [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full
                                [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-blue-600"
                    />
                    
                    {/* Tick Marks */}
                    <div className="absolute -bottom-1 left-0 w-full flex justify-between px-1">
                      {[0, 25, 50, 75, 100].map(p => (
                        <div key={p} className="flex flex-col items-center gap-2">
                          <div className={`w-1 h-1 rounded-full ${localProgress >= p ? 'bg-blue-400' : 'bg-white/20'}`} />
                          <button 
                            onClick={() => setLocalProgress(p)}
                            className={`text-[9px] font-black transition-colors ${localProgress === p ? 'text-blue-400' : 'text-white/30 hover:text-white/60'}`}
                          >
                            {p}%
                          </button>
                        </div>
                      ))}
                    </div>
                 </div>

                 <button 
                    onClick={() => onProgressUpdate(task, localProgress)}
                    className="group w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl hover:shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95"
                 >
                   <SlidersHorizontal className="w-4 h-4" />
                   Keep Saving Progress
                 </button>
               </div>
            </div>
          )}
        </div>

        <div className="px-10 pb-10 flex gap-4 mt-6">
          {onStart && col === 'To Do' && (
            <button
              onClick={() => onStart(task)}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[15px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20"
            >
              <PlayCircle className="w-5 h-5" /> Initiate Task
            </button>
          )}
          {onComplete && col === 'In Progress' && (
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

export default TaskDetailModal;
