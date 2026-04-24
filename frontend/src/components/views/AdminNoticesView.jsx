import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Plus, Search, Filter, MoreVertical, 
  Trash2, Edit2, X, Clock, Send, Eye,
  AlertTriangle, CheckCircle, Info, Megaphone, Calendar, Users, Paperclip
} from 'lucide-react';

import api from '../../api';

// Reusable Components
const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = "text", required = false }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, value, onChange, options, required = false }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <select
        required={required}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all appearance-none"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    unpublished: 'bg-amber-100 text-amber-700 border-amber-200',
    expired: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  const label = status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status] || styles.draft}`}>
      {label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    normal: 'bg-blue-50 text-blue-600 border-blue-100',
    important: 'bg-amber-50 text-amber-600 border-amber-100',
    urgent: 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-tighter ${styles[priority] || styles.normal}`}>
      {priority}
    </span>
  );
};

const AdminNoticesView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ post_type: '', audience: '', status: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);


  const [form, setForm] = useState({
    title: '',
    content: '',
    post_type: 'update',
    audience: 'both',
    priority: 'normal',
    status: 'published',
    event_date: '',
    expiry_date: ''
  });

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `/posts/?search=${search}`;
      if (filters.post_type) url += `&post_type=${filters.post_type}`;
      if (filters.audience) url += `&audience=${filters.audience}`;
      if (filters.status) url += `&status=${filters.status}`;
      
      const resp = await api.get(url);
      setPosts(resp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchPosts, 500);
    return () => clearTimeout(timer);
  }, [search, filters]);

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      post_type: 'update',
      audience: 'both',
      priority: 'normal',
      status: 'published',
      event_date: '',
      expiry_date: ''
    });
    setEditingId(null);
    setFile(null);
  };


  const handleEdit = (post) => {
    setForm({
      title: post.title,
      content: post.content,
      post_type: post.post_type,
      audience: post.audience,
      priority: post.priority,
      status: post.status,
      event_date: post.event_date ? post.event_date.split('T')[0] : '',
      expiry_date: post.expiry_date ? post.expiry_date.split('T')[0] : ''
    });
    setEditingId(post.id);
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.event_date) delete data.event_date;
      if (!data.expiry_date) delete data.expiry_date;

      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      if (file) formData.append('attachment', file);

      if (editingId) {
        await api.patch(`/posts/${editingId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(`/posts/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowModal(false);
      resetForm();
      fetchPosts();
    } catch (e) {
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await api.delete(`/posts/${id}/`);
    fetchPosts();
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Posts & Updates</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1 italic">Broadcast messages to the community</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-3 px-8 py-4 bg-[#4f46e5] text-white rounded-3xl font-black shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={20} /> Create New Post
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/30">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={20} />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-4 text-slate-900 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold" 
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filters.post_type} onChange={e => setFilters({...filters, post_type: e.target.value})}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400"
          >
            <option value="">All Types</option>
            <option value="announcement">Announcements</option>
            <option value="event">Events</option>
            <option value="notice">Notices</option>
            <option value="update">Updates</option>
          </select>
          <select 
            value={filters.audience} onChange={e => setFilters({...filters, audience: e.target.value})}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400"
          >
            <option value="">All Audiences</option>
            <option value="students">Students</option>
            <option value="teachers">Teachers</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto opacity-20" /></div>
        ) : posts.map((post) => (
          <motion.div 
            key={post.id} 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-xl transition-all p-6 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                <StatusBadge status={post.status} />
                <PriorityBadge priority={post.priority} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(post)} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => del(post.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{post.title}</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed">{post.content}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t border-slate-50 mt-auto">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                <Megaphone size={12} /> {post.post_type}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                <Users size={12} /> {post.audience}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase ml-auto">
                <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
        {!loading && posts.length === 0 && (
          <div className="col-span-full py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="text-slate-200" size={40} />
            </div>
            <p className="text-slate-400 font-bold">No posts found matching filters.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{editingId ? 'Edit Post' : 'Create Broadcast'}</h3>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"><X size={20} color="#64748b" /></button>
              </div>
              <form onSubmit={save} className="p-10 flex flex-col gap-8">
                <InputField label="Post Title" icon={Megaphone} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="E.g. Summer Vacation Announcement" />
                
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">Content / Message</label>
                  <textarea 
                    required
                    value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                    rows={6} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    placeholder="Write your announcement details here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <SelectField 
                    label="Post Type" icon={Info} value={form.post_type} 
                    onChange={e => setForm({...form, post_type: e.target.value})}
                    options={[
                      {value: 'announcement', label: 'Announcement'},
                      {value: 'event', label: 'Event'},
                      {value: 'notice', label: 'Notice'},
                      {value: 'update', label: 'General Update'}
                    ]}
                  />
                  <SelectField 
                    label="Target Audience" icon={Users} value={form.audience} 
                    onChange={e => setForm({...form, audience: e.target.value})}
                    options={[
                      {value: 'both', label: 'Both Students & Teachers'},
                      {value: 'students', label: 'Students Only'},
                      {value: 'teachers', label: 'Teachers Only'}
                    ]}
                  />
                  <SelectField 
                    label="Priority Level" icon={AlertTriangle} value={form.priority} 
                    onChange={e => setForm({...form, priority: e.target.value})}
                    options={[
                      {value: 'normal', label: 'Normal'},
                      {value: 'important', label: 'Important'},
                      {value: 'urgent', label: 'Urgent'}
                    ]}
                  />
                  <SelectField 
                    label="Status" icon={CheckCircle} value={form.status} 
                    onChange={e => setForm({...form, status: e.target.value})}
                    options={[
                      {value: 'published', label: 'Published'},
                      {value: 'draft', label: 'Draft'},
                      {value: 'unpublished', label: 'Unpublished'},
                      {value: 'expired', label: 'Expired'}
                    ]}
                  />
                  <InputField label="Event Date (Optional)" icon={Calendar} type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} />
                  <InputField label="Expiry Date (Optional)" icon={Clock} type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
                </div>

                <div className="flex flex-col gap-1.5 flex-1 p-6 bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachment (Optional)</label>
                  <div className="relative flex items-center justify-center p-6 cursor-pointer hover:bg-slate-100 transition-all rounded-2xl group">
                    <input 
                      type="file" 
                      onChange={e => setFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    <div className="flex flex-col items-center gap-2">
                       <Paperclip className={`group-hover:text-indigo-600 transition-colors ${file ? 'text-indigo-600' : 'text-slate-400'}`} size={24} />
                       <span className={`text-xs font-bold ${file ? 'text-slate-900' : 'text-slate-500'}`}>
                         {file ? file.name : 'Click or drop file to attach'}
                       </span>
                       {file && <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[10px] text-rose-500 font-black uppercase tracking-tighter hover:underline mt-1">Remove File</button>}
                    </div>
                  </div>
                </div>


                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                  <button 
                    disabled={saving}
                    type="submit" 
                    className="flex-3 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-200"
                  >
                    {saving ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> {editingId ? 'Update & Sync' : 'Publish Broadcast'}</>}
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

export default AdminNoticesView;
