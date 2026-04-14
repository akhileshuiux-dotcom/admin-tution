import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Search, Filter, Save, Send, Eye, 
  User, BookOpen, GraduationCap, CheckCircle, 
  AlertCircle, Clock, MoreVertical, X, Plus, Trash2,
  ChevronRight, Award, Percent, Hash, Edit2
} from 'lucide-react';
import api from '../../api';

const StatusBadge = ({ status }) => {
  const styles = {
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

const AdminResultsView = ({ user }) => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Entry Form State
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [currentResult, setCurrentResult] = useState({
    student: '',
    exam: '',
    status: 'draft',
    subject_performance: []
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [examsResp, studentsResp, subjectsResp, resultsResp] = await Promise.all([
        api.get('/exams/'),
        api.get('/students/'),
        api.get('/subjects/'),
        api.get('/exam-results/')
      ]);
      setExams(examsResp.data);
      setStudents(studentsResp.data);
      setSubjects(subjectsResp.data);
      setResults(resultsResp.data);
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResult = () => {
    setCurrentResult({
      student: '',
      exam: selectedExam?.id || '',
      status: 'draft',
      subject_performance: subjects.map(s => ({
        subject: s.id,
        subject_name: s.name,
        marks_obtained: 0,
        max_marks: 100
      }))
    });
    setShowEntryModal(true);
  };

  const handleEditResult = (result) => {
    setCurrentResult({
      id: result.id,
      student: result.student,
      exam: result.exam,
      status: result.status,
      subject_performance: result.subject_performance || []
    });
    setShowEntryModal(true);
  };

  const handleMarkChange = (index, value) => {
    const updated = [...currentResult.subject_performance];
    updated[index].marks_obtained = parseFloat(value) || 0;
    setCurrentResult({ ...currentResult, subject_performance: updated });
  };

  const calculateTotals = () => {
    const total = currentResult.subject_performance.reduce((acc, curr) => acc + curr.marks_obtained, 0);
    const max = currentResult.subject_performance.reduce((acc, curr) => acc + curr.max_marks, 0);
    const pct = max > 0 ? (total / max) * 100 : 0;
    
    let grade = 'Fail';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B';
    else if (pct >= 60) grade = 'C';
    else if (pct >= 50) grade = 'D';

    return { total, max, pct, grade };
  };

  const saveResult = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      alert("Unauthorized: Only Super Admin can modify results.");
      return;
    }
    setSaving(true);
    try {
      if (currentResult.id) {
        await api.patch(`/exam-results/${currentResult.id}/`, currentResult);
      } else {
        await api.post('/exam-results/', currentResult);
      }
      setShowEntryModal(false);
      fetchInitialData();
    } catch (e) {
      alert("Failed to save result: " + JSON.stringify(e.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const publishResult = async (id) => {
    if (user?.role !== 'admin') return;
    try {
      await api.patch(`/exam-results/${id}/`, { status: 'published' });
      fetchInitialData();
    } catch (e) {
      alert("Failed to publish");
    }
  };

  const stats = calculateTotals();
  const availableYears = ['All', ...[...new Set(results.filter(r => r.submitted_at).map(r => new Date(r.submitted_at).getFullYear()))].sort((a,b) => b - a)];

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <Award className="text-indigo-600" size={40} />
            Exam Results
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1 italic">
            ERP Student Performance Management
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-between items-center bg-white rounded-3xl border border-slate-100 shadow-sm p-2 overflow-x-auto no-scrollbar gap-4">
        <div className="flex gap-2 min-w-max">
          {['All', ...new Set(students.map(s => s.grade))].sort().map(grade => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-6 py-2 rounded-2xl text-xs font-black transition-all ${
                selectedGrade === grade 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {grade === 'All' ? 'View All' : `Standard: ${grade}`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pr-2 min-w-max border-l border-slate-100 pl-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year / Session:</label>
           <select 
             value={selectedYear} 
             onChange={e => setSelectedYear(e.target.value)}
             className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-700 outline-none hover:border-indigo-200 transition-all cursor-pointer"
           >
             {availableYears.map(year => (
               <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Exam Name</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total / Max</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Percentage</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Grade</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={7} className="py-24 text-center text-slate-400">Loading records...</td></tr>
            ) : results
                .filter(r => {
                  if (selectedGrade !== 'All') {
                    const student = students.find(s => s.id === r.student);
                    if (student?.grade !== selectedGrade) return false;
                  }
                  if (selectedYear !== 'All') {
                    if (!r.submitted_at || new Date(r.submitted_at).getFullYear().toString() !== selectedYear.toString()) return false;
                  }
                  return true;
                })
                .map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 font-black">
                      {r.student_name?.[0] || 'S'}
                    </div>
                    <span className="font-black text-slate-900">{r.student_name || `ID: ${r.student}`}</span>
                  </div>
                </td>
                <td className="px-10 py-6 font-bold text-slate-600">{r.exam_title || `Exam: ${r.exam}`}</td>
                <td className="px-10 py-6">
                  <span className="font-black text-slate-900">{r.score}</span>
                  <span className="text-slate-400 font-bold ml-1">/ {r.total_marks}</span>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-20">
                      <div className="h-full bg-indigo-500" style={{ width: `${r.percentage}%` }} />
                    </div>
                    <span className="font-black text-slate-700">{r.percentage.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-center">
                  <span className={`px-4 py-1 rounded-lg font-black text-sm ${
                    r.grade === 'Fail' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {r.grade}
                  </span>
                </td>
                <td className="px-10 py-6 text-center">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleEditResult(r)}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Entry Modal */}
      <AnimatePresence>
        {showEntryModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Enter Exam Performance</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">Automatic Score & Grade Computation</p>
                </div>
                <button onClick={() => setShowEntryModal(false)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"><X size={20} color="#64748b" /></button>
              </div>

              <form onSubmit={saveResult} className="flex-1 overflow-y-auto p-10 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Student</label>
                    <select 
                      required
                      value={currentResult.student} 
                      onChange={e => setCurrentResult({...currentResult, student: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 outline-none focus:border-indigo-400 transition-all"
                    >
                      <option value="">Select Student...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.user.first_name} {s.user.last_name} ({s.student_id})</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Examination Name</label>
                    <select 
                      required
                      value={currentResult.exam} 
                      onChange={e => setCurrentResult({...currentResult, exam: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 outline-none focus:border-indigo-400 transition-all"
                    >
                      <option value="">Select Exam...</option>
                      {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                    </select>
                  </div>
                </div>

                {/* Marks Entry Table */}
                <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <BookOpen size={14} /> Subject-Wise Mark Entry
                  </h4>
                  <div className="space-y-4">
                    {currentResult.subject_performance.map((perf, idx) => (
                      <div key={perf.subject} className="flex items-center gap-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-100">
                        <div className="flex-1">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{perf.subject_name}</p>
                          <p className="text-[10px] font-bold text-slate-400">Core Subject Item</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <input 
                              type="number" step="0.5" required
                              value={perf.marks_obtained}
                              onChange={e => handleMarkChange(idx, e.target.value)}
                              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center text-sm font-black text-indigo-600 outline-none focus:border-indigo-500"
                            />
                            <div className="absolute -top-6 left-0 right-0 text-center text-[8px] font-black text-slate-400 uppercase">Obtained</div>
                          </div>
                          <div className="text-slate-300 font-light text-xl">/</div>
                          <div className="relative">
                            <input 
                              type="number" required
                              value={perf.max_marks}
                              onChange={e => {
                                const up = [...currentResult.subject_performance];
                                up[idx].max_marks = parseFloat(e.target.value) || 100;
                                setCurrentResult({...currentResult, subject_performance: up});
                              }}
                              className="w-24 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-center text-sm font-bold text-slate-500 outline-none"
                            />
                            <div className="absolute -top-6 left-0 right-0 text-center text-[8px] font-black text-slate-400 uppercase">Maximum</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculation Summary Card */}
                <div className="grid grid-cols-4 gap-4">
                   <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Marks</p>
                      <h5 className="text-3xl font-black">{stats.total} <span className="text-lg opacity-40">/ {stats.max}</span></h5>
                   </div>
                   <div className="bg-white p-6 rounded-3xl border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
                      <h5 className="text-3xl font-black text-slate-900">{stats.pct.toFixed(1)}%</h5>
                   </div>
                   <div className="bg-white p-6 rounded-3xl border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected Grade</p>
                      <h5 className={`text-3xl font-black ${stats.grade === 'Fail' ? 'text-rose-600' : 'text-indigo-600'}`}>{stats.grade}</h5>
                   </div>
                   <div className="bg-slate-900 p-6 rounded-3xl text-white flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Result Status</p>
                        <select 
                          value={currentResult.status}
                          onChange={e => setCurrentResult({...currentResult, status: e.target.value})}
                          className="bg-transparent border-none outline-none font-black text-sm uppercase text-indigo-400 cursor-pointer"
                        >
                          <option value="draft">Draft</option>
                          <option value="submitted">Submitted</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-100 hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {saving ? 'Synchronizing Neural Data...' : 'Finalize & Store Result'}
                  </button>
                  <button 
                    type="button" onClick={() => setShowEntryModal(false)}
                    className="px-12 py-5 bg-slate-100 text-slate-600 rounded-[2rem] font-bold"
                  >
                    Discard Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminResultsView;
