import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Plus, X, Upload, FileText, Trash2, Edit2, PlayCircle, Settings, Tag } from 'lucide-react';
import api from '../../api';

const TeacherPapersView = ({ user }) => {
  const [papers, setPapers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', exam_name: '', year: new Date().getFullYear(),
    course: '', subject: '', mode: 'practice', duration_minutes: 60, total_marks: 100,
    tags: '', is_premium: false, price: 0
  });
  const [file, setFile] = useState(null);

  const [filterYear, setFilterYear] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [papersRes, coursesRes, subjectsRes] = await Promise.all([
        api.get('/previous-papers/'),
        api.get('/courses/'),
        api.get('/subjects/')
      ]);
      setPapers(papersRes.data);
      setCourses(coursesRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const years = [...new Set(papers.map(p => p.year))].sort((a,b) => b - a);
  const paperSubjects = [...new Set(papers.map(p => p.subject_name).filter(Boolean))].sort();

  const filteredPapers = papers.filter(p => {
    const matchYear = filterYear === 'all' || p.year?.toString() === filterYear.toString();
    const matchSubject = filterSubject === 'all' || p.subject_name === filterSubject;
    return matchYear && matchSubject;
  });

  const handleUploadClick = () => {
    setFormData({
      title: '', exam_name: '', year: new Date().getFullYear(),
      course: courses[0]?.id || '', subject: subjects[0]?.id || '', 
      mode: 'practice', duration_minutes: 60, total_marks: 100,
      tags: '', is_premium: false, price: 0
    });
    setFile(null);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { alert("Please attach a file."); return; }
    
    setUploading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });
    data.append('file', file);
    
    try {
      await api.post('/previous-papers/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to upload paper.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this question paper?')) {
      try {
        await api.delete(`/previous-papers/${id}/`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <BookOpen className="text-indigo-600" size={40} />
            Question Papers
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1 italic">
            Previous Year Question Bank
          </p>
        </div>
        <button 
          onClick={handleUploadClick}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Upload size={20} /> Upload Paper
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select 
          value={filterYear} 
          onChange={e => setFilterYear(e.target.value)}
          className="px-6 py-4 rounded-full font-bold text-sm bg-white border border-slate-200 shadow-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        
        <select 
          value={filterSubject} 
          onChange={e => setFilterSubject(e.target.value)}
          className="px-6 py-4 rounded-full font-bold text-sm bg-white border border-slate-200 shadow-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Subjects</option>
          {paperSubjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden p-8">
        {loading ? (
           <p className="text-center py-12 text-slate-400 font-bold">Loading Archives...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map(p => (
              <div key={p.id} className="p-6 bg-white border-2 border-slate-200 rounded-[2rem] hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-1 transition-all duration-300 group relative flex flex-col h-full overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-5">
                  <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">
                     <FileText size={28} strokeWidth={2.5} />
                  </div>
                  <span className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md">
                    {p.year}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                  <p className="text-sm font-bold text-slate-500 mb-6">{p.exam_name || "General Paper"}</p>
                </div>
                
                <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">Mode</span>
                    <span className={`px-2 py-1 rounded-md uppercase font-black tracking-wider ${p.mode === 'exam' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {p.mode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">Duration</span>
                    <span className="text-slate-700 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200">{p.duration_minutes} m</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3 mt-auto">
                  <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-[13px] hover:bg-indigo-700 hover:shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                     <PlayCircle size={18} /> Start
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-3 bg-white border-2 border-rose-100 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                     <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {papers.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">No question papers uploaded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[1.25rem] w-full max-w-[500px] overflow-hidden flex flex-col shadow-2xl">
              
              <div className="px-6 py-4 bg-violet-500 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <Plus size={18} strokeWidth={3} className="text-white" />
                  <h3 className="text-[15px] font-bold tracking-wide">Add Question Paper</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-all text-white/90 hover:text-white">
                  <X size={14} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Paper Title *</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all placeholder:text-slate-400 placeholder:font-normal" placeholder="e.g. Physics Final Exam - Set A" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Subject *</label>
                    <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all">
                      <option value="">Select subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Year *</label>
                    <input required type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all text-left" placeholder="2026" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Target Class (Optional)</label>
                  <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all">
                    <option value="">General / All Classes</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="space-y-1.5 mt-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Upload File (PDF/Image) *</label>
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full py-8 border border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-all">
                    <Upload className="text-slate-400 mb-2" strokeWidth={1.5} size={22} />
                    <span className="text-[12px] font-medium text-slate-500">{file ? file.name : "Click to select or drag and drop paper file"}</span>
                    <input type="file" required onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,image/*" />
                  </label>
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="w-[120px] py-2.5 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={uploading} className="w-[120px] py-2.5 bg-violet-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-violet-200 hover:bg-violet-600 disabled:opacity-50 flex flex-row items-center justify-center gap-2 transition-all">
                    <FileText size={15} /> {uploading ? 'Archiving...' : 'Save Paper'}
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

export default TeacherPapersView;
