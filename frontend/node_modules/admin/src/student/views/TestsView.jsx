import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Clock, BookOpen, CheckCircle, 
  AlertTriangle, ChevronRight, X, Sparkles,
  ShieldCheck, Trophy, ArrowRight
} from 'lucide-react';

const EXAMS = [
  { id: 1, title: 'Mathematics Mid-Term', subject: 'Math', duration: 60, questions: 30, type: 'MCQ', date: 'May 20, 2025', status: 'upcoming' },
  { id: 2, title: 'English Comprehension', subject: 'English', duration: 45, questions: 20, type: 'Mixed', date: 'May 22, 2025', status: 'upcoming' },
  { id: 3, title: 'Biology Quiz 3', subject: 'Biology', duration: 30, questions: 15, type: 'MCQ', date: 'Apr 28, 2025', status: 'completed', score: 88 },
];

const MCQ_SAMPLE = [
  { q: 'What is the quadratic formula?', opts: ['x = b±√(b²-4ac)/2a', 'x = -b±√(b²-4ac)/2a', 'x = b±√(b²+4ac)/2a', 'None'], ans: 1 },
  { q: 'Which of these is a prime number?', opts: ['9', '15', '17', '21'], ans: 2 },
  { q: 'Solve: 3x + 5 = 20. What is x?', opts: ['3', '4', '5', '6'], ans: 2 },
];

const FocusMode = ({ exam, onExit }) => {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    const prevent = (e) => e.preventDefault();
    document.addEventListener('copy', prevent);
    document.addEventListener('paste', prevent);
    document.addEventListener('contextmenu', prevent);
    return () => {
      clearInterval(timer);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('paste', prevent);
      document.removeEventListener('contextmenu', prevent);
    };
  }, [exam.duration]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (submitted) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="text-center bg-white rounded-[3.5rem] p-20 shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-slate-100 max-w-xl w-full"
      >
        <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 font-plus-jakarta mb-4 tracking-tight">Paper Submitted</h2>
        <p className="text-slate-400 font-bold mb-12 uppercase tracking-widest text-sm">Your assessment is now under review.</p>
        <button 
            onClick={onExit} 
            className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 uppercase tracking-[0.2em] text-[13px]"
        >
            Back to Dashboard
        </button>
      </motion.div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1000] bg-white overflow-y-auto select-none">
      {/* Premium Exam Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-3xl border-b border-slate-100/50 px-10 py-6 flex justify-between items-center z-[1100]">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-xl font-plus-jakarta leading-none">{exam.title}</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 italic">{exam.type} ASSESSMENT</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Time Remaining</span>
            <div className={`flex items-center gap-3 font-black text-3xl font-plus-jakarta ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                {String(mins).padStart(2,'0')}<span className="opacity-20">:</span>{String(secs).padStart(2,'0')}
            </div>
          </div>
          <div className="h-12 w-px bg-slate-100" />
          <div className="text-right">
             <p className="text-[14px] font-black text-slate-900">{Object.keys(answers).length} <span className="opacity-20">/</span> {MCQ_SAMPLE.length}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Answered</p>
          </div>
        </div>
      </div>

      {/* Exam Content */}
      <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col gap-12">
        {MCQ_SAMPLE.map((q, qi) => (
          <motion.div 
            key={qi} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: qi * 0.1 }} 
            className="bg-slate-50/50 rounded-[3rem] p-12 border border-slate-100/50 relative group"
          >
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 font-black text-[14px]">
               {qi + 1}
            </div>
            
            <h4 className="text-2xl font-extrabold text-slate-900 mb-10 font-plus-jakarta leading-relaxed">{q.q}</h4>
            
            <div className="grid grid-cols-1 gap-4">
              {q.opts.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                  className={`text-left px-8 py-6 rounded-[2rem] border-2 text-[15px] font-bold transition-all flex items-center justify-between group/opt ${
                    answers[qi] === oi 
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-xl shadow-blue-500/5' 
                        : 'border-white bg-white text-slate-600 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black transition-colors ${
                        answers[qi] === oi ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                    }`}>
                        {String.fromCharCode(65+oi)}
                    </span>
                    {opt}
                  </div>
                  {answers[qi] === oi && <CheckCircle className="w-5 h-5 text-blue-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSubmitted(true)}
          className="w-full py-6 bg-slate-900 text-white font-black text-[16px] rounded-[2.5rem] hover:bg-black transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] uppercase tracking-[0.3em] mt-10"
        >
          Submit Final Assessment
        </motion.button>
        
        <p className="text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-4">
            Secured Session · Copying is disabled
        </p>
      </div>
    </motion.div>
  );
};

const TestsView = ({ onFocusMode }) => {
  const [activeExam, setActiveExam] = useState(null);

  if (activeExam) return <FocusMode exam={activeExam} onExit={() => { setActiveExam(null); onFocusMode(false); }} />;

  return (
    <div className="flex flex-col gap-10 w-full pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-plus-jakarta">Assessments</h2>
          <p className="text-[15px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Exams & Monthly Quizzes</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl p-2 rounded-[2rem] border border-white/50 shadow-sm">
           <div className="flex items-center gap-2 px-6 py-2 bg-slate-900 rounded-[1.5rem] text-white">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-[12px] font-bold tracking-widest uppercase">Verified Account</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {EXAMS.map(exam => (
          <motion.div 
            key={exam.id} 
            whileHover={{ y: -5 }} 
            className="group bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-2xl transition-all flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex items-center gap-8 text-center md:text-left flex-grow">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shadow-lg ${
                exam.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
              }`}>
                {exam.status === 'completed' ? <Trophy className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
              </div>
              <div className="flex-grow">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h4 className="text-2xl font-extrabold text-slate-900 font-plus-jakarta">{exam.title}</h4>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">{exam.type}</span>
                </div>
                <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">{exam.subject} · {exam.date} · {exam.duration} min · {exam.questions} questions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {exam.status === 'completed' && (
                <div className="text-right">
                    <span className="text-3xl font-black text-emerald-500 font-plus-jakarta">{exam.score}%</span>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Final Score</p>
                </div>
              )}
              {exam.status === 'upcoming' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setActiveExam(exam); onFocusMode(true); }}
                  className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white text-[14px] font-black rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-[0.2em]"
                >
                  Begin Assessment <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Disclaimer */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-[2.5rem] p-8 flex items-start gap-6">
         <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
         </div>
         <div>
            <h5 className="text-[15px] font-extrabold text-amber-900 mb-1">Testing Protocol</h5>
            <p className="text-[13px] text-amber-700/70 font-medium leading-relaxed">
                Exams are proctored and recorded. Please ensure you are in a quiet environment with a stable internet connection before starting. Closing the window or switching tabs will result in automatic submission.
            </p>
         </div>
      </div>
    </div>
  );
};

export default TestsView;
