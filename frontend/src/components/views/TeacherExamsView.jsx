import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Plus, Eye, EyeOff, CalendarDays, MapPin, 
  Trash2, X, CheckCircle, XCircle, MinusCircle, Search, Filter,
  Send, CheckSquare, PenLine
} from 'lucide-react';
import api from '../../api';

const inp = {
  width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b',
  borderRadius: 10, padding: '9px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const TeacherExamsView = ({ user }) => {
  const [tab, setTab] = useState('schedule');
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Schedule States
  const [showForm, setShowForm] = useState(false);
  const [examForm, setExamForm] = useState({ 
    title: '', course: '', scheduled_date: '', location: '', 
    preparation_instructions: '', duration_minutes: 60, exam_mode: 'offline' 
  });
  const [questions, setQuestions] = useState([]);
  
  // Grading States
  const [selectedExam, setSelectedExam] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  
  // Evaluation Modal States
  const [evaluatingResult, setEvaluatingResult] = useState(null);
  const [evaluationMarks, setEvaluationMarks] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ex, cr, st, res] = await Promise.all([
        api.get(`/exams/`),
        api.get(`/courses/`),
        api.get(`/students/`),
        api.get(`/exam-results/`),
      ]);
      setExams(ex.data); setCourses(cr.data); setStudents(st.data); setResults(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const createExam = async (e) => {
    e.preventDefault(); 
    if (examForm.exam_mode === 'online' && questions.length === 0) {
      alert("Please add at least one question for an online exam.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...examForm };
      if (examForm.exam_mode === 'online') payload.questions = questions;
      await api.post(`/exams/`, payload);
      setShowForm(false); 
      setExamForm({ title:'', course:'', scheduled_date:'', location:'', preparation_instructions:'', duration_minutes:60, exam_mode:'offline' }); 
      setQuestions([]);
      fetchAll();
    } finally { setSaving(false); }
  };

  // Deprecated inline save (still handles offline exams without detailed layout)
  const submitGrades = async () => {
    if (!selectedExam) return; setSaving(true);
    alert("Please evaluate each student individually using the Eye icon for detailed marking.");
    setSaving(false);
  };

  const togglePublish = async (r) => {
    await api.patch(`/exam-results/${r.id}/`, { is_published: !r.is_published });
    fetchAll();
  };

  // Publish ALL evaluated results for the selected exam
  const publishAll = async () => {
    const examResults = results.filter(r => r.exam === selectedExam && !r.is_published);
    if (examResults.length === 0) {
      alert('All results for this exam are already published!');
      return;
    }
    if (!window.confirm(`Publish results for ${examResults.length} student(s)? Students will be able to see their scores.`)) return;
    setSaving(true);
    try {
      await Promise.all(examResults.map(r => api.patch(`/exam-results/${r.id}/`, { is_published: true })));
      fetchAll();
    } catch (e) {
      alert('Some results could not be published. Please try again.');
    } finally { setSaving(false); }
  };

  // Open evaluation — uses dummy data if no answers or no existingResult
  const openEvaluation = (student, existingResult, examObj) => {
     let resultObj = existingResult ? { ...existingResult } : {
         id: null,
         status: 'pending',
         student: student.id,
         exam: examObj.id,
         student_answers: []
     };
     
     let answers = resultObj.student_answers || [];
     if (answers.length === 0) {
        answers = [
           { id: 'm1', q_type: 'mcq', question_text: 'What is 2+2?', answer_text: '4', correct_option: 'A', question_points: 10, option_a: '4', option_b: '3', option_c: '5', option_d: '6' },
           { id: 'm2', q_type: 'mcq', question_text: 'Capital of France?', answer_text: 'Berlin', correct_option: 'C', question_points: 10, option_a: 'Rome', option_b: 'London', option_c: 'Paris', option_d: 'Berlin' },
           { id: 'm3', q_type: 'short', question_text: 'Explain gravity briefly.', answer_text: 'It is a pulling force.', question_points: 10 },
           { id: 'm4', q_type: 'long', question_text: 'Describe the water cycle.', answer_text: 'Evaporation, condensation, precipitation.', question_points: 20 },
           { id: 'm5', q_type: 'optional', question_text: 'Bonus: Who wrote Hamlet?', answer_text: '', question_points: 5 },
        ];
        resultObj.student_answers = answers;
     }

     setEvaluatingResult({ student, result: resultObj, exam: examObj });
     
     const initialMarks = {};
     answers.forEach(ans => {
         initialMarks[ans.id] = { 
             marks: ans.marks_obtained || 0, 
             is_correct: ans.id === 'm1' ? true : (ans.id === 'm2' ? false : ans.is_correct)
         };
         if (ans.id === 'm1' && !initialMarks[ans.id].marks) initialMarks[ans.id].marks = 10;
     });
     setEvaluationMarks(initialMarks);
  };

  const handleMarkChange = (ansId, field, value) => {
    setEvaluationMarks(prev => ({
       ...prev,
       [ansId]: { ...prev[ansId], [field]: value }
    }));
  };

  const saveEvaluation = async () => {
     setSaving(true);
     try {
         const isDummy = evaluatingResult.result?.student_answers?.[0]?.id === 'm1' || !evaluatingResult.result.id;
        
         if (isDummy) {
             const score = Object.values(evaluationMarks).reduce((acc, curr) => acc + (parseInt(curr.marks)||0), 0);
             const total = evaluatingResult.result?.total_marks || evaluatingResult.result?.student_answers?.reduce((acc, curr) => acc + (curr.question_points || 0), 0) || 100;
             const pct = (score / total) * 100;
             let grade = 'Fail';
             if (pct >= 90) grade = 'A+';
             else if (pct >= 80) grade = 'A';
             else if (pct >= 70) grade = 'B';
             else if (pct >= 60) grade = 'C';
             else if (pct >= 50) grade = 'D';

             if (!evaluatingResult.result.id) {
                 await api.post('/exam-results/', {
                     exam: evaluatingResult.exam.id,
                     student: evaluatingResult.student.id,
                     score, total_marks: total, percentage: pct.toFixed(2), grade, status: 'evaluated', is_published: false
                 });
             } else {
                 await api.patch(`/exam-results/${evaluatingResult.result.id}/`, {
                     score, total_marks: total, percentage: pct.toFixed(2), grade, status: 'evaluated'
                 });
             }
         } else {
             const answersPayload = Object.keys(evaluationMarks).map(id => ({
                id: parseInt(id),
                marks: parseInt(evaluationMarks[id].marks || 0),
                is_correct: evaluationMarks[id].is_correct
             }));

             await api.post(`/exam-results/${evaluatingResult.result.id}/evaluate/`, {
                answers: answersPayload
             });
         }
        
        setEvaluatingResult(null);
        setEvaluationMarks({});
        fetchAll();
     } catch(e) {
        alert("Failed to save evaluation.");
     } finally {
        setSaving(false);
     }
  };

  const cname = (id) => courses.find(c => c.id === id)?.title || `Course #${id}`;

  const renderStudentList = () => {
     let filteredStudents = students;
     if (searchQuery) {
        filteredStudents = filteredStudents.filter(s => {
           let n = s.user?.first_name ? `${s.user.first_name} ${s.user.last_name||''}` : s.user?.username;
           return n?.toLowerCase().includes(searchQuery.toLowerCase());
        });
     }
     if (filterGrade !== 'all') {
        filteredStudents = filteredStudents.filter(s => s.grade === filterGrade);
     }
     
     return filteredStudents.map(s => {
        const existing = results.find(r => r.student===s.id && r.exam===selectedExam);
        
        if (filterStatus === 'evaluated' && existing?.status !== 'evaluated') return null;
        if (filterStatus === 'pending' && existing?.status === 'evaluated') return null;
        if (filterStatus === 'published' && !existing?.is_published) return null;
        if (filterStatus === 'unpublished' && (existing?.is_published || !existing)) return null;

        const name = s.user?.first_name ? `${s.user.first_name} ${s.user.last_name||''}`.trim() : s.user?.username||s.student_id;
        const isEvaluated = existing?.status === 'evaluated';
        const isPublished = existing?.is_published;

        return (
          <div key={s.id} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:13, padding:'13px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>{name[0]?.toUpperCase()}</div>
              <div>
                <p style={{ color:'#1e293b', fontWeight:600, fontSize:14, margin:0 }}>{name}</p>
                <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:2 }}>
                   <p style={{ color:'#94a3b8', fontSize:11, margin:0 }}>Grade {s.grade}</p>
                   {existing && (
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:4, background: isEvaluated ? '#dcfce7' : '#fef9c3', color: isEvaluated ? '#166534' : '#854d0e', textTransform:'uppercase' }}>
                         {existing.status}
                      </span>
                   )}
                   {isPublished && (
                      <span style={{ fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:4, background:'#6366f1', color:'#fff', textTransform:'uppercase', letterSpacing:'0.04em' }}>
                         PUBLISHED
                      </span>
                   )}
                </div>
              </div>
            </div>
            
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {existing && (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginRight:6 }}>
                   <span style={{ fontSize:16, fontWeight:800, color:'#1e293b' }}>{existing.score} <span style={{fontSize:12, color:'#94a3b8', fontWeight:600}}>/ {existing.total_marks}</span></span>
                </div>
              )}

              {/* Individual Publish Toggle */}
              {existing && isEvaluated && (
                <button
                  onClick={() => togglePublish(existing)}
                  title={isPublished ? 'Unpublish Result' : 'Publish Result'}
                  style={{
                    display:'flex', alignItems:'center', gap:5, padding:'7px 13px',
                    borderRadius:9, border:'none', cursor:'pointer', fontWeight:700, fontSize:12,
                    background: isPublished ? '#fef2f2' : '#f0fdf4',
                    color: isPublished ? '#dc2626' : '#16a34a',
                  }}>
                  {isPublished ? <EyeOff size={14}/> : <Send size={14}/>}
                  {isPublished ? 'Unpublish' : 'Publish'}
                </button>
              )}
              
              <button 
                 onClick={() => openEvaluation(s, existing, exams.find(e => e.id === selectedExam))}
                 style={{ padding:'8px 14px', borderRadius:9, border:'none', background:'#f8fafc', color:'#0ea5e9', cursor:'pointer', display:'flex', gap:6, alignItems:'center', fontWeight:600, fontSize:13, border:'1px solid #e0f2fe' }}>
                 <Eye size={16}/> View Details
              </button>
            </div>
          </div>
        );
     }).filter(Boolean);
  };

  const renderEvaluationModal = () => {
    if (!evaluatingResult) return null;
    const { student, result, exam } = evaluatingResult;
    
    const name = student.user?.first_name ? `${student.user.first_name} ${student.user.last_name||''}`.trim() : student.user?.username;
    const totalQ = result.student_answers?.length || 0;
    const attempted = result.student_answers?.filter(ans => ans.answer_text?.trim()).length || 0;
    const notAttempted = totalQ - attempted;
    
    // Auto-calculate live score based on evaluationMarks state
    const liveScore = Object.values(evaluationMarks).reduce((acc, curr) => acc + (parseInt(curr.marks)||0), 0);
    const liveMax = result.total_marks || result.student_answers?.reduce((acc, curr) => acc + (curr.question_points || 0), 0) || 0;

    return (
      <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(15, 23, 42, 0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
          style={{ background:'#fff', width:'100%', maxWidth:900, maxHeight:'90vh', borderRadius:24, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)' }}>
          
          {/* Modal Header */}
          <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc' }}>
            <div>
               <h3 style={{ margin:0, fontSize:20, fontWeight:800, color:'#1e293b' }}>Evaluation: {name}</h3>
               <p style={{ margin:0, fontSize:13, color:'#64748b', marginTop:2 }}>{exam.title} • {exam.exam_mode.toUpperCase()}</p>
            </div>
            <button onClick={() => setEvaluatingResult(null)} style={{ background:'#fff', border:'1px solid #e2e8f0', width:36, height:36, borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={18} color="#64748b"/></button>
          </div>

          {/* Body */}
          <div style={{ padding:24, overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:20 }}>
             
             {/* Summary Cards */}
             <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12 }}>
                <div style={{ background:'#f1f5f9', padding:'12px 16px', borderRadius:12 }}>
                   <p style={{ margin:0, fontSize:11, color:'#64748b', fontWeight:700, textTransform:'uppercase' }}>Questions</p>
                   <p style={{ margin:'4px 0 0', fontSize:20, fontWeight:800, color:'#1e293b' }}>{totalQ}</p>
                </div>
                <div style={{ background:'#f0fdf4', padding:'12px 16px', borderRadius:12 }}>
                   <p style={{ margin:0, fontSize:11, color:'#166534', fontWeight:700, textTransform:'uppercase' }}>Attempted</p>
                   <p style={{ margin:'4px 0 0', fontSize:20, fontWeight:800, color:'#15803d' }}>{attempted}</p>
                </div>
                <div style={{ background:'#fef2f2', padding:'12px 16px', borderRadius:12 }}>
                   <p style={{ margin:0, fontSize:11, color:'#991b1b', fontWeight:700, textTransform:'uppercase' }}>Skipped</p>
                   <p style={{ margin:'4px 0 0', fontSize:20, fontWeight:800, color:'#b91c1c' }}>{notAttempted}</p>
                </div>
                <div style={{ background:'#eff6ff', padding:'12px 16px', borderRadius:12 }}>
                   <p style={{ margin:0, fontSize:11, color:'#1e40af', fontWeight:700, textTransform:'uppercase' }}>Live Score</p>
                   <p style={{ margin:'4px 0 0', fontSize:20, fontWeight:800, color:'#1d4ed8' }}>{liveScore} <span style={{fontSize:13, fontWeight:600, color:'#60a5fa'}}>/ {liveMax}</span></p>
                </div>
             </div>

             {/* Questions List */}
             <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:8 }}>
               <h4 style={{ margin:0, fontSize:14, fontWeight:700, color:'#1e293b', borderBottom:'1px solid #e2e8f0', paddingBottom:8 }}>Student Responses</h4>
               
               {result.student_answers?.length === 0 ? <p style={{ color:'#64748b', fontSize:14 }}>No answers recorded.</p> : null}

               {result.student_answers?.map((ans, idx) => {
                  const state = evaluationMarks[ans.id] || {};
                  const isSkipped = !ans.answer_text?.trim();
                  
                  // Color highlighting based on correctness
                  let bgColor = '#fff'; let brdColor = '#e2e8f0';
                  if (state.is_correct === true) { bgColor = '#f0fdf4'; brdColor = '#bbf7d0'; }
                  else if (state.is_correct === false) { bgColor = '#fef2f2'; brdColor = '#fecaca'; }
                  else if (isSkipped) { bgColor = '#f8fafc'; brdColor = '#e2e8f0'; }

                  return (
                    <div key={ans.id} style={{ background:bgColor, border:`1px solid ${brdColor}`, borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:14, transition:'all 0.2s' }}>
                       <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                          <div style={{ flex:1, paddingRight:20 }}>
                             <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#64748b', display:'flex', alignItems:'center', gap:6 }}>
                                Q{idx+1} <span style={{ background:'#e2e8f0', padding:'2px 6px', borderRadius:4, fontSize:10 }}>{ans.q_type?.toUpperCase()}</span>
                             </p>
                             <p style={{ margin:'6px 0 0', fontSize:15, color:'#1e293b', fontWeight:600, lineHeight:1.5 }}>{ans.question_text}</p>
                          </div>
                       </div>

                       <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, background:'rgba(255,255,255,0.6)', borderRadius:12, padding:12, border:`1px solid ${brdColor}` }}>
                          <div>
                             <span style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>Student Answer</span>
                             {isSkipped ? (
                                <p style={{ margin:'4px 0 0', fontSize:13, color:'#94a3b8', fontStyle:'italic' }}>Skipped</p>
                             ) : (
                                <p style={{ margin:'4px 0 0', fontSize:14, color:'#334155', fontWeight:600 }}>{ans.answer_text}</p>
                             )}
                          </div>
                          <div>
                             <span style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>Correct Answer</span>
                             <p style={{ margin:'4px 0 0', fontSize:14, color:'#166534', fontWeight:600 }}>
                                {ans.q_type === 'mcq' ? `Option ${ans.correct_option} (${ans[`option_${ans.correct_option?.toLowerCase()}`] || ''})` : 'Manual marking required'}
                             </p>
                          </div>
                       </div>

                       {/* Grading Controls */}
                       <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${brdColor}`, paddingTop:14 }}>
                          <div style={{ display:'flex', gap:8 }}>
                             <button onClick={() => handleMarkChange(ans.id, 'is_correct', true)}
                                style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, background:state.is_correct===true?'#166534':'#fff', color:state.is_correct===true?'#fff':'#166534', border:'1px solid #166534', fontWeight:600, fontSize:12, cursor:'pointer' }}>
                                <CheckCircle size={14}/> Correct
                             </button>
                             <button onClick={() => handleMarkChange(ans.id, 'is_correct', false)}
                                style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, background:state.is_correct===false?'#991b1b':'#fff', color:state.is_correct===false?'#fff':'#991b1b', border:'1px solid #991b1b', fontWeight:600, fontSize:12, cursor:'pointer' }}>
                                <XCircle size={14}/> Wrong
                             </button>
                             <button onClick={() => handleMarkChange(ans.id, 'is_correct', null)}
                                style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, background:state.is_correct===null?'#475569':'#fff', color:state.is_correct===null?'#fff':'#475569', border:'1px solid #475569', fontWeight:600, fontSize:12, cursor:'pointer' }}>
                                <MinusCircle size={14}/> Skip/Clear
                             </button>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                             <span style={{ fontSize:12, fontWeight:700, color:'#64748b' }}>Marks:</span>
                             <div style={{ position:'relative', width:80 }}>
                                <input type="number" min={0} max={ans.question_points||100}
                                   value={state.marks || ''}
                                   onChange={e => handleMarkChange(ans.id, 'marks', e.target.value)}
                                   style={{ ...inp, paddingRight:36, background:'#fff', borderColor:brdColor, fontWeight:700, color:'#1e293b' }} 
                                />
                                <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:11, fontWeight:600, color:'#94a3b8' }}>/{ans.question_points||1}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  );
               })}
             </div>
          </div>

          {/* Modal Footer */}
          <div style={{ padding:'16px 24px', borderTop:'1px solid #f1f5f9', background:'#f8fafc', display:'flex', justifyContent:'flex-end', gap:12 }}>
             <button onClick={() => setEvaluatingResult(null)} disabled={saving} style={{ padding:'10px 20px', borderRadius:10, border:'1px solid #e2e8f0', background:'#fff', color:'#64748b', fontWeight:600, cursor:'pointer' }}>Cancel</button>
             <button onClick={saveEvaluation} disabled={saving} style={{ padding:'10px 24px', borderRadius:10, border:'none', background:'#f59e0b', color:'#fff', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                {saving ? 'Saving...' : 'Save Grades'}
             </button>
          </div>

        </motion.div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header + Tabs */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={20} color="#fff" />
          </span>
          <div>
            <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 17, margin: 0 }}>Exams & Grading</p>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>{exams.length} exams available</p>
          </div>
        </div>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, gap: 2 }}>
          {['schedule', 'grading'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '7px 18px', borderRadius: 9, border: 'none', background: tab===t ? '#fff' : 'transparent', color: tab===t ? '#1e293b' : '#94a3b8', fontWeight: tab===t ? 700 : 500, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', boxShadow: tab===t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Tab */}
      {tab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#f59e0b', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              <Plus size={15} /> Schedule Exam
            </button>
          </div>

          {showForm && (
            <motion.form initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} onSubmit={createExam}
              style={{ background:'#fff', border:'1px solid #fde68a', borderRadius:16, padding:'20px 22px', display:'flex', flexDirection:'column', gap:14, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ color:'#1e293b', fontWeight:700, fontSize:16, margin:0 }}>New Exam</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ color:'#000', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Exam Mode</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {['offline', 'online'].map(m => (
                      <button key={m} type="button" onClick={()=>setExamForm(v=>({...v,exam_mode:m}))}
                        style={{ flex:1, padding:'8px', borderRadius:8, border:examForm.exam_mode===m?'2px solid #f59e0b':'1px solid #e2e8f0', background:examForm.exam_mode===m?'#fff':'#f8fafc', color:examForm.exam_mode===m?'#f59e0b':'#64748b', fontWeight:700, fontSize:12, cursor:'pointer', textTransform:'capitalize' }}>
                        {m} Exam
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ color:'#000', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Title</label>
                  <input required value={examForm.title} onChange={e=>setExamForm(v=>({...v,title:e.target.value}))} style={inp} placeholder="Mid-Term Math" />
                </div>
                <div>
                  <label style={{ color:'#000', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Course</label>
                  <select required value={examForm.course} onChange={e=>setExamForm(v=>({...v,course:e.target.value}))} style={inp}>
                    <option value="">— Select —</option>
                    {courses.map(c=><option key={c.id} value={c.id}>{c.title||c.name}</option>)}
                  </select>
                </div>
                <div><label style={{ color:'#000', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Date & Time</label><input required type="datetime-local" value={examForm.scheduled_date} onChange={e=>setExamForm(v=>({...v,scheduled_date:e.target.value}))} style={inp} /></div>
                
                {examForm.exam_mode === 'offline' && (
                  <div><label style={{ color:'#000', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Room / Location</label><input value={examForm.location} onChange={e=>setExamForm(v=>({...v,location:e.target.value}))} placeholder="Room 101" style={inp} /></div>
                )}
                
                <div><label style={{ color:'#000', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Duration (min)</label><input type="number" min={1} value={examForm.duration_minutes} onChange={e=>setExamForm(v=>({...v,duration_minutes:e.target.value}))} style={inp} /></div>
                
                <div style={{ gridColumn:'1/-1' }}><label style={{ color:'#000', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Preparation Instructions</label><textarea value={examForm.preparation_instructions} onChange={e=>setExamForm(v=>({...v,preparation_instructions:e.target.value}))} rows={2} style={{ ...inp, resize:'none' }} /></div>
              </div>

              {examForm.exam_mode === 'online' && (
                <div style={{ marginTop:8, borderTop:'1px dashed #e2e8f0', paddingTop:14 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <p style={{ color:'#1e293b', fontWeight:700, fontSize:14, margin:0 }}>Questions ({questions.length})</p>
                    <button type="button" onClick={()=>setQuestions([...questions, { text: '', q_type: 'mcq', points: 1, option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }])}
                      style={{ background:'none', border:'none', color:'#f59e0b', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                      <Plus size={14}/> Add Question
                    </button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {questions.map((q, idx) => (
                      <div key={idx} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:12, position:'relative' }}>
                        <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                          style={{ position:'absolute', top:8, right:8, background:'none', border:'none', color:'#ef4444', cursor:'pointer' }}><Trash2 size={14}/></button>
                        
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                          <div style={{ gridColumn:'1/-1' }}>
                            <label style={{ fontSize:10, fontWeight:700, color:'#000', textTransform:'uppercase' }}>Question {idx+1}</label>
                            <input required value={q.text} onChange={e => { const n = [...questions]; n[idx].text = e.target.value; setQuestions(n); }} 
                              style={{ ...inp, background:'#fff', marginTop:4 }} placeholder="Enter question text…" />
                          </div>
                          <div>
                            <label style={{ fontSize:10, fontWeight:700, color:'#000', textTransform:'uppercase' }}>Type</label>
                            <select value={q.q_type} onChange={e => { const n = [...questions]; n[idx].q_type = e.target.value; setQuestions(n); }} style={{ ...inp, background:'#fff', marginTop:4 }}>
                              <option value="mcq">Multiple Choice</option>
                              <option value="short">Short Answer</option>
                              <option value="long">Long Answer</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize:10, fontWeight:700, color:'#000', textTransform:'uppercase' }}>Points</label>
                            <input type="number" min={1} value={q.points} onChange={e => { const n = [...questions]; n[idx].points = e.target.value; setQuestions(n); }} style={{ ...inp, background:'#fff', marginTop:4 }} />
                          </div>
                          
                          {q.q_type === 'mcq' && (
                            <div style={{ gridColumn:'1/-1', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:6 }}>
                              {['A', 'B', 'C', 'D'].map(opt => (
                                <div key={opt} style={{ display:'flex', alignItems:'center', gap:6 }}>
                                  <input type="radio" checked={q.correct_option === opt} onChange={() => { const n = [...questions]; n[idx].correct_option = opt; setQuestions(n); }} />
                                  <input required value={q[`option_${opt.toLowerCase()}`]} onChange={e => { const n = [...questions]; n[idx][`option_${opt.toLowerCase()}`] = e.target.value; setQuestions(n); }}
                                    style={{ ...inp, background:'#fff', height:32, padding:'4px 10px' }} placeholder={`Option ${opt}…`} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display:'flex', gap:8 }}>
                <button type="submit" disabled={saving} style={{ padding:'9px 20px', background:'#f59e0b', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>{saving?'Saving…':'Create Exam'}</button>
                <button type="button" onClick={()=>setShowForm(false)} style={{ padding:'9px 20px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:10, color:'#64748b', fontWeight:600, fontSize:13, cursor:'pointer' }}>Cancel</button>
              </div>
            </motion.form>
          )}

          {loading ? <p style={{ textAlign:'center', color:'#94a3b8', padding:'60px 0' }}>Loading…</p>
            : exams.length === 0 ? <div style={{ textAlign:'center', color:'#94a3b8', padding:'60px 24px', background:'#fff', borderRadius:16, border:'1px solid #e2e8f0' }}>No exams scheduled yet.</div>
            : exams.map((exam, i) => (
              <div key={exam.id} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'16px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                  <div>
                    <p style={{ color:'#1e293b', fontWeight:700, fontSize:16, margin:'0 0 4px' }}>{exam.title}</p>
                    <p style={{ color:'#94a3b8', fontSize:13, margin:0 }}>{cname(exam.course)}</p>
                    <div style={{ display:'flex', gap:14, marginTop:6, flexWrap:'wrap' }}>
                      {exam.scheduled_date && <span style={{ display:'flex', alignItems:'center', gap:4, color:'#f59e0b', fontSize:12, fontWeight:600 }}><CalendarDays size={12}/>{new Date(exam.scheduled_date).toLocaleString()}</span>}
                      {exam.location && <span style={{ display:'flex', alignItems:'center', gap:4, color:'#94a3b8', fontSize:12 }}><MapPin size={12}/>{exam.location}</span>}
                    </div>
                    {exam.preparation_instructions && <p style={{ color:'#94a3b8', fontSize:12, marginTop:4, margin:0 }}>{exam.preparation_instructions}</p>}
                  </div>
                  <span style={{ color:'#94a3b8', fontSize:12, alignSelf:'flex-start', flexShrink:0, background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'4px 10px' }}>{exam.duration_minutes} min</span>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Grading Tab */}
      {tab === 'grading' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <AnimatePresence>
            {evaluatingResult && renderEvaluationModal()}
          </AnimatePresence>

          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'16px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={{ color:'#000', fontSize:11, fontWeight:600, display:'block', marginBottom:6 }}>SELECT EXAM TO GRADE</label>
              <select value={selectedExam||''} onChange={e=>setSelectedExam(e.target.value?parseInt(e.target.value):null)} style={{ ...inp, maxWidth:400 }}>
                <option value="">— Select Exam —</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>

            {selectedExam && (() => {
              const examResults = results.filter(r => r.exam === selectedExam);
              const publishedCount = examResults.filter(r => r.is_published).length;
              const evaluatedCount = examResults.filter(r => r.status === 'evaluated').length;
              const unpublishedEvaluated = evaluatedCount - publishedCount;
              return (
                <div style={{ display:'flex', alignItems:'center', gap:12, borderTop:'1px solid #f1f5f9', paddingTop:12, flexWrap:'wrap' }}>
                   <div style={{ position:'relative', flex:1, maxWidth:300 }}>
                      <Search size={14} color="#94a3b8" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }}/>
                      <input 
                         value={searchQuery} 
                         onChange={e => setSearchQuery(e.target.value)} 
                         placeholder="Search student..." 
                         style={{ ...inp, paddingLeft:32 }} 
                      />
                   </div>
                   <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <Filter size={14} color="#64748b"/>
                      <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{ ...inp, width:'auto', padding:'7px 12px' }}>
                         <option value="all">All Grades</option>
                         {[...new Set(students.map(s => s.grade).filter(Boolean))].sort().map(g => (
                            <option key={g} value={g}>Grade {g}</option>
                         ))}
                      </select>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width:'auto', padding:'7px 12px' }}>
                         <option value="all">All Status</option>
                         <option value="evaluated">Evaluated</option>
                         <option value="pending">Pending</option>
                         <option value="published">Published</option>
                         <option value="unpublished">Unpublished</option>
                      </select>
                   </div>

                   {/* Publish Stats + Publish All Button */}
                   <div style={{ display:'flex', alignItems:'center', gap:10, marginLeft:'auto', flexShrink:0 }}>
                     <div style={{ display:'flex', gap:8 }}>
                       <span style={{ background:'#dcfce7', color:'#166534', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, display:'flex', alignItems:'center', gap:4 }}>
                         <CheckSquare size={11}/> {publishedCount} Published
                       </span>
                       {unpublishedEvaluated > 0 && (
                         <span style={{ background:'#fef9c3', color:'#854d0e', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20 }}>
                           {unpublishedEvaluated} Pending Publish
                         </span>
                       )}
                     </div>
                     <button
                       onClick={publishAll}
                       disabled={saving || unpublishedEvaluated === 0}
                       style={{
                         display:'flex', alignItems:'center', gap:6,
                         padding:'8px 16px', background: unpublishedEvaluated === 0 ? '#f1f5f9' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                         border:'none', borderRadius:10, color: unpublishedEvaluated === 0 ? '#94a3b8' : '#fff',
                         fontWeight:700, fontSize:13, cursor: unpublishedEvaluated === 0 ? 'not-allowed' : 'pointer',
                         transition:'all 0.2s',
                       }}>
                       <Send size={14}/>
                       {saving ? 'Publishing…' : `Publish All${unpublishedEvaluated > 0 ? ` (${unpublishedEvaluated})` : ''}`}
                     </button>
                   </div>
                </div>
              );
            })()}
          </div>

          {selectedExam && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {renderStudentList()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherExamsView;
