import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Download, Clock, Star, TrendingUp, Filter, FileText, Lock, PlayCircle } from 'lucide-react';
import api from '../../api';

// Simple modal for Paper Attempt
const PaperAttemptModal = ({ paper, onClose }) => {
  const [started, setStarted] = useState(false);
  
  if (!started) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6 overflow-y-auto">
         <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 text-center shadow-2xl relative">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
               <BookOpen size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">{paper.title}</h2>
            <p className="font-bold text-slate-500 mb-8">{paper.mode === 'exam' ? 'Timed Assessment' : 'Practice Session'}</p>
            
            <div className="flex gap-4 p-6 bg-slate-50 rounded-3xl mb-8">
               <div className="flex-1 text-center border-r border-slate-200">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Duration</p>
                  <p className="text-xl font-black text-slate-900">{paper.duration_minutes}m</p>
               </div>
               <div className="flex-1 text-center">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Marks</p>
                  <p className="text-xl font-black text-slate-900">{paper.total_marks}</p>
               </div>
            </div>

            <div className="flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 rounded-3xl font-bold bg-slate-100 text-slate-600">Cancel</button>
              <button onClick={() => setStarted(true)} className="flex-1 py-4 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700">Start Attempt</button>
            </div>
         </div>
      </div>
    );
  }

  // Very basic interactive mock for V1.
  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-slate-50">
       <div className="bg-white px-8 py-5 flex justify-between items-center border-b border-slate-200 shadow-sm">
          <div>
            <h3 className="font-black text-xl text-slate-900">{paper.title}</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interactive Attempt in Progress</span>
          </div>
          <div className="flex items-center gap-6">
             {paper.mode === 'exam' && (
                <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-black tracking-widest">
                  <Clock size={16} /> {paper.duration_minutes}:00
                </div>
             )}
             <button onClick={onClose} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 uppercase text-sm tracking-widest">Submit Paper</button>
          </div>
       </div>

       <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
             <BookOpen size={64} className="mx-auto mb-6 text-slate-300" />
             <p className="text-slate-500 font-bold mb-4">The interactive MCQ engine will load paper questions here based on the Teacher's converted metadata.</p>
             <p className="text-xs text-slate-400">For Phase 1, you can download the raw PDF from the main dashboard to study offline.</p>
          </div>
       </div>
    </div>
  )
}

const StudentPapersView = ({ user }) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [attemptPaper, setAttemptPaper] = useState(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/previous-papers/');
      setPapers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const years = [...new Set(papers.map(p => p.year))].sort((a,b) => b - a);
  const subjects = [...new Set(papers.map(p => p.subject_name).filter(Boolean))].sort();

  const filteredPapers = papers.filter(p => {
    const matchMode = filterMode === 'all' || p.mode === filterMode;
    const matchYear = filterYear === 'all' || p.year?.toString() === filterYear.toString();
    const matchSubject = filterSubject === 'all' || p.subject_name === filterSubject;
    return matchMode && matchYear && matchSubject;
  });

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto p-4 md:p-8">
      
      {/* Header Area */}
      <div className="relative overflow-hidden rounded-[3rem] bg-indigo-600 text-white p-12 shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div className="max-w-xl">
             <h1 className="text-5xl font-black mb-4 tracking-tight">Question Bank</h1>
             <p className="text-indigo-100 text-lg font-medium leading-relaxed">Access previous year papers, take interactive tests, and track your performance curve entirely online.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 hidden md:flex items-center gap-6">
             <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-1">Available Papers</p>
                <p className="text-3xl font-black">{papers.length}</p>
             </div>
             <div className="w-px h-12 bg-white/20"></div>
             <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-1">Your Attempts</p>
                <p className="text-3xl font-black">0</p>
             </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Dropdowns */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-4">
          {['all', 'practice', 'exam'].map(mode => (
            <button 
              key={mode} onClick={() => setFilterMode(mode)}
              className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                filterMode === mode ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-100'
              }`}
            >
              {mode === 'all' ? 'All Archives' : `${mode} Mode`}
            </button>
          ))}
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={filterYear} 
            onChange={e => setFilterYear(e.target.value)}
            className="flex-1 md:flex-none px-6 py-4 rounded-full font-bold text-sm bg-white border border-slate-100 shadow-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          <select 
            value={filterSubject} 
            onChange={e => setFilterSubject(e.target.value)}
            className="flex-1 md:flex-none px-6 py-4 rounded-full font-bold text-sm bg-white border border-slate-100 shadow-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 font-bold text-slate-400">Fetching Archives...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map(p => (
            <div key={p.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl transition-all group flex flex-col">
               <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${p.mode === 'exam' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {p.mode === 'exam' ? <Clock size={24} /> : <BookOpen size={24} />}
                  </div>
                  <div className="text-right">
                     <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-1">{p.year}</span>
                  </div>
               </div>
               
               <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{p.title}</h3>
               <p className="text-sm font-bold text-slate-400 mb-6">{p.exam_name}</p>
               
               <div className="flex gap-4 mb-8">
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">Duration</p>
                    <p className="text-sm font-black text-slate-700">{p.duration_minutes}m</p>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">Total Marks</p>
                    <p className="text-sm font-black text-slate-700">{p.total_marks}</p>
                  </div>
               </div>

               <div className="mt-auto flex gap-2">
                 {p.file && (
                    <a href={p.file} target="_blank" rel="noreferrer" className="p-4 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center">
                       <Download size={20} />
                    </a>
                 )}
                 <button 
                  onClick={() => setAttemptPaper(p)}
                  className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${
                    p.is_premium 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xl shadow-orange-200'
                      : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700'
                  }`}
                 >
                   {p.is_premium ? <><Lock size={16}/> Unlock</> : <><PlayCircle size={16}/> Attempt</>}
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {attemptPaper && <PaperAttemptModal paper={attemptPaper} onClose={() => setAttemptPaper(null)} />}
    </div>
  );
};

export default StudentPapersView;
