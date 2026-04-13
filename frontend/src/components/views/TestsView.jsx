import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Clock, BookOpen, CheckCircle, AlertTriangle, ChevronRight, X,
  Wifi, WifiOff, MapPin, User, FileText, Download, Calendar, Hash,
  Printer, Info, AlertCircle
} from 'lucide-react';
import api from '../../api';

// ─────────────────────────────────────────────
// FOCUS MODE  (Online exam – unchanged)
// ─────────────────────────────────────────────
const FocusMode = ({ exam, onExit }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.duration_minutes * 60);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
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
  }, [exam.id]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/questions/?exam=${exam.id}`);
      setQuestions(resp.data);
    } catch (err) {
      console.error('Failed to fetch questions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    let score = 0;
    const submissionAnswers = [];
    questions.forEach((q, i) => {
      let ansText = '';
      if (q.q_type === 'mcq') {
        const selectedIdx = answers[i];
        ansText = selectedIdx !== undefined ? String.fromCharCode(65 + selectedIdx) : '';
        if (ansText === q.correct_option) score += q.points;
      } else {
        ansText = answers[i] || '';
      }
      submissionAnswers.push({ question: q.id, answer_text: String(ansText) });
    });
    try {
      await api.post('/exam-results/', {
        exam: exam.id, score, is_published: false, answers: submissionAnswers,
      });
      setSubmitted(true);
    } catch {
      alert('Failed to submit exam. Please try again.');
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (submitted) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center bg-white rounded-[2.5rem] p-16 shadow-xl">
        <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-3xl font-semibold text-slate-900">Exam Submitted!</h2>
        <p className="text-slate-400 mt-2 mb-8">Your answers have been recorded.</p>
        <button onClick={onExit} className="px-8 py-3 bg-slate-900 text-white font-normal rounded-2xl hover:bg-black transition-all">Back to Tests</button>
      </motion.div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto select-none">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <Lock className="w-5 h-5 text-slate-400" />
          <span className="font-semibold text-slate-900 text-lg">{exam.title}</span>
          <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-600 font-semibold rounded-full uppercase">{exam.exam_mode || 'Exam'}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-semibold text-lg ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
            <Clock className="w-5 h-5" />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <span className="text-sm text-slate-400">{Object.keys(answers).length}/{questions.length} answered</span>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No questions found for this exam.</div>
        ) : (
          questions.map((q, qi) => {
            const opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
            return (
              <motion.div key={qi} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <p className="text-[15px] font-normal text-slate-400 mb-2">Question {qi + 1}</p>
                <h4 className="text-[18px] font-semibold text-slate-900 mb-6">{q.text}</h4>
                {q.q_type === 'mcq' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {opts.map((opt, oi) => (
                      <button key={oi} onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                        className={`text-left px-5 py-4 rounded-2xl border-2 text-[14px] font-semibold transition-all ${answers[qi] === oi ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300'}`}>
                        <span className="font-semibold mr-3 opacity-50">{String.fromCharCode(65 + oi)}.</span>{opt}
                      </button>
                    ))}
                  </div>
                ) : q.q_type === 'short' ? (
                  <input type="text" placeholder="Type your answer here..."
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[14px] outline-none focus:border-slate-900 transition-all"
                    value={answers[qi] || ''} onChange={(e) => setAnswers(a => ({ ...a, [qi]: e.target.value }))} />
                ) : (
                  <textarea placeholder="Type your long answer here..." rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[14px] outline-none focus:border-slate-900 transition-all resize-none"
                    value={answers[qi] || ''} onChange={(e) => setAnswers(a => ({ ...a, [qi]: e.target.value }))} />
                )}
              </motion.div>
            );
          })
        )}
        {!loading && questions.length > 0 && (
          <button onClick={handleFinish}
            className="w-full py-4 bg-emerald-500 text-white font-semibold text-[15px] rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30">
            Submit Exam ({Object.keys(answers).length}/{questions.length} answered)
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// REVIEW MODE (Online exam – unchanged)
// ─────────────────────────────────────────────
const ReviewMode = ({ result, exam, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto select-none">
    <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10">
      <div className="flex items-center gap-4">
        <BookOpen className="w-5 h-5 text-slate-400" />
        <span className="font-semibold text-slate-900 text-lg">{exam.title} - Results</span>
        <span className={`text-[11px] px-2 py-0.5 font-semibold rounded-full uppercase ${result.status === 'evaluated' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {result.status}
        </span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold text-slate-900">Score: {result.score} / {result.total_marks || '?'}</span>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"><X size={16} /></button>
      </div>
    </div>
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
      {!result.student_answers || result.student_answers.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No answer details available.</div>
      ) : (
        result.student_answers.map((ans, qi) => {
          const isMcq = ans.q_type === 'mcq';
          const isCorrect = ans.is_correct === true;
          const isWrong = ans.is_correct === false;
          let bgColor = 'bg-white', borderColor = 'border-slate-100', statusText = 'Pending Grading';
          if (result.status === 'evaluated') {
            if (isCorrect) { bgColor = 'bg-emerald-50'; borderColor = 'border-emerald-200'; statusText = 'Correct'; }
            else if (isWrong) { bgColor = 'bg-red-50'; borderColor = 'border-red-200'; statusText = 'Wrong'; }
            else { bgColor = 'bg-slate-50'; borderColor = 'border-slate-200'; statusText = 'Skipped / Partial'; }
          }
          return (
            <motion.div key={ans.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.1 }}
              className={`${bgColor} rounded-3xl p-8 shadow-sm border ${borderColor}`}>
              <div className="flex justify-between items-start mb-4">
                <p className="text-[15px] font-semibold text-slate-500">Question {qi + 1} <span className="uppercase text-[10px] ml-2 bg-slate-200 px-2 py-1 rounded text-slate-600">{ans.q_type}</span></p>
                <div className="flex items-center gap-3">
                  {result.status === 'evaluated' && (
                    <span className={`text-[12px] font-bold px-2 py-1 rounded-md ${isCorrect ? 'bg-emerald-100 text-emerald-700' : isWrong ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>{statusText}</span>
                  )}
                  <span className="text-[13px] font-semibold text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-lg">Marks: {ans.marks_obtained || 0} / {ans.question_points || '?'}</span>
                </div>
              </div>
              <h4 className="text-[18px] font-semibold text-slate-900 mb-6">{ans.question_text}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 p-4 rounded-xl border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Your Answer</p>
                  <p className="text-[15px] font-medium text-slate-800">{ans.answer_text || <span className="italic text-slate-400">Skipped</span>}</p>
                </div>
                <div className="bg-white/60 p-4 rounded-xl border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Correct Answer</p>
                  <p className="text-[15px] font-medium text-slate-800">{isMcq ? `Option ${ans.correct_option}` : 'Evaluated by Teacher'}</p>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────
// HALL TICKET MODAL
// ─────────────────────────────────────────────
const HallTicketModal = ({ exam, regNumber, onClose }) => {
  const ticketRef = useRef(null);
  const examDate = exam.scheduled_date ? new Date(exam.scheduled_date) : null;
  const endTime = examDate ? new Date(examDate.getTime() + exam.duration_minutes * 60000) : null;

  const handlePrint = () => {
    const printContent = ticketRef.current?.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Hall Ticket – ${exam.title}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
            .ticket { border: 2px solid #1e293b; border-radius: 16px; padding: 32px; max-width: 640px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
            .school-name { font-size: 22px; font-weight: 800; color: #1e293b; }
            .ticket-title { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-top: 4px; }
            .badge { background: #1e293b; color: white; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
            .exam-name { font-size: 24px; font-weight: 800; margin: 0 0 4px; }
            .subject { font-size: 14px; color: #64748b; margin: 0 0 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
            .field label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 3px; }
            .field p { font-size: 15px; font-weight: 600; margin: 0; }
            .reg-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 12px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .reg-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
            .reg-number { font-size: 20px; font-weight: 800; font-family: monospace; color: #1e293b; letter-spacing: 2px; }
            .instructions { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px; font-size: 13px; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hall Ticket</h3>
              <p className="text-xs text-slate-400">Preview & Download</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-all">
              <Printer className="w-4 h-4" /> Download / Print
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Ticket content */}
        <div className="p-6 overflow-y-auto">
          <div ref={ticketRef}>
            <div className="ticket border-2 border-slate-800 rounded-2xl p-8">
              {/* Ticket header */}
              <div className="header flex justify-between items-start border-b-2 border-dashed border-slate-200 pb-5 mb-5">
                <div>
                  <p className="school-name text-[22px] font-black text-slate-900">EduWay Institute</p>
                  <p className="ticket-title text-[11px] uppercase tracking-[2px] text-slate-400 mt-1">Admit Card / Hall Ticket</p>
                </div>
                <span className="badge bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-[12px] font-bold uppercase">Offline Exam</span>
              </div>

              <h2 className="text-[22px] font-black text-slate-900 mb-1">{exam.title}</h2>
              <p className="text-[13px] text-slate-400 mb-5">{exam.course_name || 'General Subject'}</p>

              {/* Registration */}
              <div className="reg-box flex items-center justify-between bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl px-5 py-3 mb-5">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registration Number</p>
                  <p className="text-[20px] font-black font-mono text-slate-900 tracking-[3px] mt-1">{regNumber}</p>
                </div>
                <Hash className="w-8 h-8 text-slate-200" />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { label: 'Exam Date', value: examDate ? examDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                  { label: 'Exam Time', value: examDate ? `${examDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${endTime?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : '—' },
                  { label: 'Duration', value: `${exam.duration_minutes} minutes` },
                  { label: 'Classroom / Hall', value: exam.location || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">{label}</p>
                    <p className="text-[14px] font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>

              {exam.preparation_instructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-2">Instructions</p>
                  <p className="text-[13px] text-amber-900 leading-relaxed">{exam.preparation_instructions}</p>
                </div>
              )}

              <div className="footer text-center text-[11px] text-slate-400 border-t border-slate-100 pt-4 mt-2">
                This hall ticket must be presented at the examination center. Carry a valid photo ID.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// OFFLINE EXAM DETAIL MODAL
// ─────────────────────────────────────────────
const OfflineDetailModal = ({ exam, regNumber, onClose, onDownload }) => {
  const examDate = exam.scheduled_date ? new Date(exam.scheduled_date) : null;
  const endTime = examDate ? new Date(examDate.getTime() + exam.duration_minutes * 60000) : null;
  const now = new Date();
  let offlineStatus = 'Upcoming';
  let statusColor = 'bg-blue-100 text-blue-700';
  if (examDate) {
    if (now > endTime) { offlineStatus = 'Completed'; statusColor = 'bg-emerald-100 text-emerald-700'; }
    else if (now > examDate && now < endTime) { offlineStatus = 'In Progress'; statusColor = 'bg-amber-100 text-amber-700'; }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 px-6 py-5 border-b border-orange-100">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">Offline Exam</span>
                <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor}`}>{offlineStatus}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">{exam.title}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{exam.course_name || 'General Subject'}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/70 text-slate-400 transition-all"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Calendar, label: 'Exam Date', value: examDate ? examDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
              { icon: Clock, label: 'Time', value: examDate ? `${examDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} onwards` : '—' },
              { icon: Clock, label: 'Duration', value: `${exam.duration_minutes} minutes` },
              { icon: MapPin, label: 'Classroom / Hall', value: exam.location || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
                  <p className="text-[13px] font-semibold text-slate-800 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Registration number */}
          <div className="bg-slate-900 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Registration Number</p>
              <p className="text-[18px] font-black font-mono text-white tracking-[2px] mt-1">{regNumber}</p>
            </div>
            <Hash className="w-7 h-7 text-slate-600" />
          </div>

          {exam.preparation_instructions && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-[11px] font-black uppercase text-amber-700 tracking-widest">Instructions</p>
              </div>
              <p className="text-[13px] text-amber-900 leading-relaxed">{exam.preparation_instructions}</p>
            </div>
          )}

          {/* Actions */}
          <button onClick={onDownload}
            className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
            <Download className="w-4 h-4" /> Download Hall Ticket
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// OFFLINE EXAM CARD
// ─────────────────────────────────────────────
const OfflineExamCard = ({ exam, result, regNumber, onViewDetails, onDownload, onReview }) => {
  const examDate = exam.scheduled_date ? new Date(exam.scheduled_date) : null;
  const endTime = examDate ? new Date(examDate.getTime() + exam.duration_minutes * 60000) : null;
  const now = new Date();
  let status = 'Upcoming', statusStyle = 'bg-blue-50 text-blue-700 border-blue-200';
  if (result) { status = 'Graded'; statusStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200'; }
  else if (examDate && now > endTime) { status = 'Completed'; statusStyle = 'bg-slate-50 text-slate-700 border-slate-200'; }
  else if (examDate && now > examDate) { status = 'In Progress'; statusStyle = 'bg-amber-50 text-amber-700 border-amber-200'; }

  return (
    <motion.div whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-grow min-w-0">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-orange-100 flex-shrink-0">📋</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="text-[15px] font-semibold text-slate-900 truncate">{exam.title}</h4>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex-shrink-0">Offline</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle} flex-shrink-0`}>{status}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-400">
            <span className="font-medium text-slate-500">{exam.course_name || 'General'}</span>
            {examDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{examDate.toLocaleDateString()}</span>}
            {examDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{examDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
            {exam.duration_minutes && <span>{exam.duration_minutes} min</span>}
            {exam.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{exam.location}</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Hash className="w-3 h-3 text-slate-300" />
            <span className="text-[11px] font-mono font-semibold text-slate-400">{regNumber}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {result ? (
          <>
            <span className="text-[13px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Score: {result.score} pts
            </span>
            <button onClick={onReview}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-[12px] font-semibold rounded-xl hover:bg-slate-200 transition-all border border-slate-200">
              <BookOpen className="w-3.5 h-3.5" /> Review
            </button>
          </>
        ) : (
          <>
            <button onClick={onViewDetails}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-[12px] font-semibold rounded-xl hover:bg-slate-200 transition-all border border-slate-200">
              <Info className="w-3.5 h-3.5" /> Details
            </button>
            <button onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-[12px] font-semibold rounded-xl hover:bg-black transition-all">
              <Download className="w-3.5 h-3.5" /> Hall Ticket
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// MAIN TESTS VIEW
// ─────────────────────────────────────────────
const TestsView = ({ onFocusMode }) => {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState(null);
  const [reviewExam, setReviewExam] = useState(null);
  const [examTab, setExamTab] = useState('online');

  // Offline detail/hall-ticket state
  const [offlineDetail, setOfflineDetail] = useState(null);
  const [hallTicketExam, setHallTicketExam] = useState(null);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const [eResp, rResp] = await Promise.all([api.get('/exams/'), api.get('/exam-results/')]);
      setExams(eResp.data);
      setResults(rResp.data);
    } catch (err) {
      console.error('Failed to fetch exams', err);
    } finally {
      setLoading(false);
    }
  };

  // Build a deterministic registration number:  EXAM{id}-STU{student_id_seed}
  const buildRegNumber = (exam) => {
    const seed = String(exam.id).padStart(4, '0');
    const suffix = String((exam.course || 0) + exam.id * 7).slice(-3).padStart(3, '0');
    return `EXW-${seed}-${suffix}`;
  };

  const onlineExams = exams.filter(e => e.exam_mode === 'online');
  const offlineExams = exams.filter(e => e.exam_mode === 'offline');

  if (activeExam) return <FocusMode exam={activeExam} onExit={() => { setActiveExam(null); onFocusMode(false); fetchExams(); }} />;
  if (reviewExam) return <ReviewMode exam={reviewExam.exam} result={reviewExam.result} onClose={() => { setReviewExam(null); onFocusMode(false); }} />;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-[22px] font-semibold text-slate-900">Tests &amp; Exams</h2>
        <p className="text-sm text-slate-400 font-medium mt-0.5">
          View and attend your assigned exams · {exams.length} total
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100">
        {[
          { id: 'online', label: 'Online Exams', icon: Wifi, count: onlineExams.length },
          { id: 'offline', label: 'Offline Exams', icon: WifiOff, count: offlineExams.length },
        ].map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setExamTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-[13px] font-semibold border-b-2 transition-all ${
              examTab === id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${examTab === id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Online Exams List */}
      <AnimatePresence mode="wait">
        {examTab === 'online' && (
          <motion.div key="online" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="text-center py-16 text-slate-400">Loading exams...</div>
            ) : onlineExams.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center text-slate-400 font-medium">
                No online exams scheduled.
              </div>
            ) : (
              onlineExams.map(exam => {
                const result = results.find(r => r.exam === exam.id);
                const status = result ? 'completed' : 'upcoming';
                return (
                  <motion.div key={exam.id} whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-grow min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${status === 'completed' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                        {status === 'completed' ? '✅' : '📝'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-[15px] font-semibold text-slate-900 truncate">{exam.title}</h4>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">Online</span>
                        </div>
                        <p className="text-[12px] text-slate-400 font-medium">
                          {exam.course_name} · {new Date(exam.scheduled_date).toLocaleDateString()} · {exam.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {status === 'completed' ? (
                        <>
                          <span className="text-[13px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">Score: {result.score} pts</span>
                          <button onClick={() => { setReviewExam({ exam, result }); onFocusMode(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-[13px] font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200">
                            View Details
                          </button>
                        </>
                      ) : (
                        <button onClick={() => { setActiveExam(exam); onFocusMode(true); }}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[13px] font-normal rounded-xl hover:bg-black transition-all">
                          Start Exam <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Offline Exams List */}
        {examTab === 'offline' && (
          <motion.div key="offline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="text-center py-16 text-slate-400">Loading exams...</div>
            ) : offlineExams.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
                <WifiOff className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No offline exams scheduled.</p>
                <p className="text-slate-300 text-sm mt-1">Your teacher will assign offline exams here when available.</p>
              </div>
            ) : (
              offlineExams.map(exam => {
                const regNumber = buildRegNumber(exam);
                const result = results.find(r => r.exam === exam.id);
                return (
                  <OfflineExamCard key={exam.id} exam={exam} result={result} regNumber={regNumber}
                    onReview={() => { setReviewExam({ exam, result }); onFocusMode(true); }}
                    onViewDetails={() => setOfflineDetail({ exam, regNumber })}
                    onDownload={() => setHallTicketExam({ exam, regNumber })} />
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Detail Modal */}
      <AnimatePresence>
        {offlineDetail && (
          <OfflineDetailModal
            exam={offlineDetail.exam}
            regNumber={offlineDetail.regNumber}
            onClose={() => setOfflineDetail(null)}
            onDownload={() => { setHallTicketExam(offlineDetail); setOfflineDetail(null); }}
          />
        )}
      </AnimatePresence>

      {/* Hall Ticket Modal */}
      <AnimatePresence>
        {hallTicketExam && (
          <HallTicketModal
            exam={hallTicketExam.exam}
            regNumber={hallTicketExam.regNumber}
            onClose={() => setHallTicketExam(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestsView;
