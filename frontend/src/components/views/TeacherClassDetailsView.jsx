import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Users, Calendar, Clock, 
  Target, BookOpen, Save, Search, 
  CheckCircle, AlertCircle, TrendingUp,
  Layout, ClipboardList, Info
} from 'lucide-react';
import api from '../../api';

const TeacherClassDetailsView = ({ cls, onBack, onUpdateProgress }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [progressValue, setProgressValue] = useState(cls.progress);
  const [completedTopics, setCompletedTopics] = useState(cls.completedTopics || 0);
  const [pendingTopics, setPendingTopics] = useState(cls.pendingTopics || 0);
  const [lastTopic, setLastTopic] = useState(cls.lastTopic || '');
  const [currentModule, setCurrentModule] = useState(cls.module || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch students and filter by grade/batch if available
    api.get('/students/')
      .then(r => {
        const filtered = r.data.filter(s => {
            // Match by grade (e.g., "Mathematics - Grade 9A" -> Extract "9")
            const gradeMatch = cls.name.match(/Grade\s+(\d+[A-Z]?)/i);
            const targetGrade = gradeMatch ? gradeMatch[1] : '';
            return !targetGrade || s.grade === targetGrade;
        });
        setStudents(filtered);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [cls.name]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
        onUpdateProgress({
            ...cls,
            progress: parseInt(progressValue),
            completedTopics: parseInt(completedTopics),
            pendingTopics: parseInt(pendingTopics),
            lastTopic,
            module: currentModule
        });
        setIsSaving(false);
    }, 800);
  };

  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase();
    const name = `${s.user?.first_name || ''} ${s.user?.last_name || ''}`.toLowerCase();
    return name.includes(q) || s.student_id?.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm transition-colors group"
        >
          <div className="p-2 bg-white rounded-xl border border-slate-100 group-hover:bg-emerald-50 transition-colors">
            <ChevronLeft size={18} />
          </div>
          Back to Records
        </button>
        <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                {cls.status}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                ID: {cls.code}
            </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Class Summary & Progress Management */}
        <div className="lg:col-span-12">
            <div className="bg-emerald-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48" />
                
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-5xl font-black">
                        {cls.name[0]}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black mb-2">{cls.name}</h1>
                        <div className="flex flex-wrap gap-4 items-center">
                            <span className="flex items-center gap-2 text-emerald-200 text-sm font-bold">
                                <Calendar size={16} /> {cls.timing}
                            </span>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="flex items-center gap-2 text-emerald-200 text-sm font-bold">
                                <Users size={16} /> {cls.students} Enrolled
                            </span>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="flex items-center gap-2 text-emerald-200 text-sm font-bold">
                                <Layout size={16} /> {cls.batch}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-2 min-w-[200px]">
                    <div className="text-sm font-black text-emerald-300 uppercase tracking-widest">Overall Completion</div>
                    <div className="text-6xl font-black">{progressValue}%</div>
                    <div className="w-full h-3 bg-white/10 rounded-full mt-2 overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressValue}%` }}
                            className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Mid Section: Stats & Progress Update */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/30">
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
                    <Target className="text-emerald-500" /> Progress Management
                </h3>
                
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Adjust Progress</label>
                            <span className="text-lg font-black text-emerald-600">{progressValue}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="100" 
                            value={progressValue}
                            onChange={(e) => setProgressValue(e.target.value)}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Completed Topics</label>
                            <input 
                                type="number" 
                                value={completedTopics}
                                onChange={(e) => setCompletedTopics(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Pending Topics</label>
                            <input 
                                type="number" 
                                value={pendingTopics}
                                onChange={(e) => setPendingTopics(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Current Module</label>
                        <div className="relative">
                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="text"
                                value={currentModule}
                                onChange={(e) => setCurrentModule(e.target.value)}
                                placeholder="e.g. Algebra Fundamentals"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Last Taught Topic</label>
                        <div className="relative">
                            <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="text"
                                value={lastTopic}
                                onChange={(e) => setLastTopic(e.target.value)}
                                placeholder="e.g. Quadratic Equations"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all shadow-xl ${isSaving ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-[0.98]'}`}
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                Save Progress Updates
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Analytics Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col gap-6">
                    <h4 className="text-[13px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp size={16} /> Course Insights
                    </h4>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold">avg</div>
                                <span className="text-sm font-bold text-slate-300">Class Avg Score</span>
                            </div>
                            <span className="text-lg font-black">84%</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-bold">att</div>
                                <span className="text-sm font-bold text-slate-300">Avg Attendance</span>
                            </div>
                            <span className="text-lg font-black">92%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Section: Student Roster */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col h-full">
                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.15em] flex items-center gap-3">
                            <Users className="text-emerald-500" /> Student Roster
                        </h3>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{filteredStudents.length} Students active in this batch</p>
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or ID..."
                            className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all w-[240px]"
                        />
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[600px] custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Class Roster...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                <Users size={40} />
                            </div>
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No students found matching your search</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filteredStudents.map((s, i) => (
                                <motion.div 
                                    key={s.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all cursor-default"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg font-black text-emerald-600 shadow-sm">
                                            {(s.user?.first_name || s.user?.username || "?")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">{s.user?.first_name} {s.user?.last_name}</h4>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.student_id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-black text-slate-900">Present</span>
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase">95% Growth</span>
                                        </div>
                                        <button className="p-2.5 bg-white rounded-lg text-slate-300 hover:text-emerald-500 border border-slate-100 shadow-sm transition-all">
                                            <Info size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center gap-4">
                    <AlertCircle size={18} className="text-amber-500" />
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed capitalize">Note: Only students currently assigned to your <span className="font-black text-slate-800">{cls.name}</span> class are shown above. For full roster management, visit the students module.</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherClassDetailsView;
