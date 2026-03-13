import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Clock, BookOpen, CheckCircle, AlertTriangle, ChevronRight, X } from 'lucide-react';

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
    // Prevent clipboard
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-white rounded-[2.5rem] p-16 shadow-xl">
        <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-3xl font-semibold text-slate-900">Exam Submitted!</h2>
        <p className="text-slate-400 mt-2 mb-8">Your answers have been recorded.</p>
        <button onClick={onExit} className="px-8 py-3 bg-slate-900 text-white font-normal rounded-2xl hover:bg-black transition-all">Back to Tests</button>
      </motion.div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto select-none">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Lock className="w-5 h-5 text-slate-400" />
          <span className="font-semibold text-slate-900 text-lg">{exam.title}</span>
          <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-600 font-semibold rounded-full uppercase">{exam.type}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-semibold text-lg ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
            <Clock className="w-5 h-5" />
            {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
          </div>
          <span className="text-sm text-slate-400">{Object.keys(answers).length}/{MCQ_SAMPLE.length} answered</span>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
        {MCQ_SAMPLE.map((q, qi) => (
          <motion.div key={qi} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.1 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <p className="text-[15px] font-normal text-slate-400 mb-2">Question {qi + 1}</p>
            <h4 className="text-[18px] font-semibold text-slate-900 mb-6">{q.q}</h4>
            <div className="grid grid-cols-2 gap-3">
              {q.opts.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                  className={`text-left px-5 py-4 rounded-2xl border-2 text-[14px] font-semibold transition-all ${answers[qi] === oi ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <span className="font-semibold mr-3 opacity-50">{String.fromCharCode(65+oi)}.</span>{opt}
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        <button
          onClick={() => setSubmitted(true)}
          className="w-full py-4 bg-emerald-500 text-white font-semibold text-[15px] rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
        >
          Submit Exam ({Object.keys(answers).length}/{MCQ_SAMPLE.length} answered)
        </button>
      </div>
    </motion.div>
  );
};

const TestsView = ({ onFocusMode }) => {
  const [activeExam, setActiveExam] = useState(null);

  if (activeExam) return <FocusMode exam={activeExam} onExit={() => { setActiveExam(null); onFocusMode(false); }} />;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h2 className="text-[22px] font-semibold text-slate-900">Tests & Exams</h2>
        <p className="text-sm text-slate-400 font-medium mt-0.5">2 upcoming · 1 completed</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {EXAMS.map(exam => (
          <motion.div key={exam.id} whileHover={{ y: -2 }} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${exam.status === 'completed' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                {exam.status === 'completed' ? '✅' : '📝'}
              </div>
              <div>
                <h4 className="text-[15px] font-semibold text-slate-900">{exam.title}</h4>
                <p className="text-[12px] text-slate-400 font-medium">{exam.subject} · {exam.date} · {exam.duration} min · {exam.questions} questions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {exam.status === 'completed' && (
                <span className="text-[13px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">{exam.score}%</span>
              )}
              {exam.status === 'upcoming' && (
                <button
                  onClick={() => { setActiveExam(exam); onFocusMode(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[13px] font-normal rounded-xl hover:bg-black transition-all"
                >
                  Start Exam <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TestsView;
