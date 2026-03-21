import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Eye, EyeOff, CalendarDays, MapPin } from 'lucide-react';
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
  const [showForm, setShowForm] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', course: '', scheduled_date: '', location: '', preparation_instructions: '', duration_minutes: 60 });
  const [selectedExam, setSelectedExam] = useState(null);
  const [grade, setGrade] = useState({});
  const [saving, setSaving] = useState(false);

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
    e.preventDefault(); setSaving(true);
    try {
      await api.post(`/exams/`, examForm);
      setShowForm(false); setExamForm({ title:'', course:'', scheduled_date:'', location:'', preparation_instructions:'', duration_minutes:60 }); fetchAll();
    } finally { setSaving(false); }
  };

  const submitGrades = async () => {
    if (!selectedExam) return; setSaving(true);
    try {
      await Promise.all(students.map(s =>
        grade[s.id] !== undefined
          ? api.post(`/exam-results/`, { student: s.id, exam: selectedExam, score: parseInt(grade[s.id])||0, average_score: parseFloat(grade[s.id])||0, is_published: false }).catch(()=>null)
          : null
      ));
      fetchAll();
    } finally { setSaving(false); }
  };

  const togglePublish = async (r) => {
    await api.patch(`/exam-results/${r.id}/`, { is_published: !r.is_published });
    fetchAll();
  };

  const cname = (id) => courses.find(c => c.id === id)?.title || `Course #${id}`;

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
            <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>{exams.length} exams</p>
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
                <div><label style={{ color:'#64748b', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Title</label><input required value={examForm.title} onChange={e=>setExamForm(v=>({...v,title:e.target.value}))} style={inp} placeholder="Mid-Term Math" /></div>
                <div><label style={{ color:'#64748b', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Course</label>
                  <select required value={examForm.course} onChange={e=>setExamForm(v=>({...v,course:e.target.value}))} style={inp}><option value="">— Select —</option>{courses.map(c=><option key={c.id} value={c.id}>{c.title||c.name}</option>)}</select></div>
                <div><label style={{ color:'#64748b', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Date & Time</label><input type="datetime-local" value={examForm.scheduled_date} onChange={e=>setExamForm(v=>({...v,scheduled_date:e.target.value}))} style={inp} /></div>
                <div><label style={{ color:'#64748b', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Room / Location</label><input value={examForm.location} onChange={e=>setExamForm(v=>({...v,location:e.target.value}))} placeholder="Room 101" style={inp} /></div>
                <div style={{ gridColumn:'1/-1' }}><label style={{ color:'#64748b', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Preparation Instructions</label><textarea value={examForm.preparation_instructions} onChange={e=>setExamForm(v=>({...v,preparation_instructions:e.target.value}))} rows={2} style={{ ...inp, resize:'none' }} /></div>
                <div><label style={{ color:'#64748b', fontSize:11, fontWeight:600, display:'block', marginBottom:4 }}>Duration (min)</label><input type="number" min={1} value={examForm.duration_minutes} onChange={e=>setExamForm(v=>({...v,duration_minutes:e.target.value}))} style={inp} /></div>
              </div>
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
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'16px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
            <label style={{ color:'#64748b', fontSize:11, fontWeight:600, display:'block', marginBottom:6 }}>SELECT EXAM TO GRADE</label>
            <select value={selectedExam||''} onChange={e=>setSelectedExam(e.target.value?parseInt(e.target.value):null)} style={{ ...inp, maxWidth:400 }}>
              <option value="">— Select Exam —</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>

          {selectedExam && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={submitGrades} disabled={saving}
                  style={{ padding:'9px 18px', background:'#f59e0b', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  {saving ? 'Saving…' : 'Save Grades'}
                </button>
              </div>
              {students.map(s => {
                const existing = results.find(r => r.student===s.id && r.exam===selectedExam);
                const name = s.user?.first_name ? `${s.user.first_name} ${s.user.last_name||''}`.trim() : s.user?.username||s.student_id;
                return (
                  <div key={s.id} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:13, padding:'13px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>{name[0]?.toUpperCase()}</div>
                      <div>
                        <p style={{ color:'#1e293b', fontWeight:600, fontSize:14, margin:0 }}>{name}</p>
                        <p style={{ color:'#94a3b8', fontSize:11, margin:0 }}>Grade {s.grade}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <input type="number" min={0} max={100}
                        value={grade[s.id]!==undefined ? grade[s.id] : (existing?.score??'')}
                        placeholder="0–100"
                        onChange={e=>setGrade(v=>({...v,[s.id]:e.target.value}))}
                        style={{ ...inp, width:80, textAlign:'center', padding:'7px' }}
                      />
                      {existing && (
                        <button onClick={()=>togglePublish(existing)} title={existing.is_published?'Unpublish':'Publish to students'}
                          style={{ width:34, height:34, borderRadius:9, border:'none', background:existing.is_published?'#f0fdf4':'#f8fafc', color:existing.is_published?'#059669':'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {existing.is_published ? <Eye size={15}/> : <EyeOff size={15}/>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherExamsView;
