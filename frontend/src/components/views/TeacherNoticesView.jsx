import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, Calendar, Users, Info, 
  AlertTriangle, CheckCircle, Clock, X, Search, Filter, Bell
} from 'lucide-react';

import api from '../../api';

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
    normal: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    important: 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm',
    urgent: 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter shadow-sm ${styles[priority] || styles.normal}`}>
      {priority}
    </span>
  );
};

const PostCard = ({ post, onClick }) => {
  const dateStr = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
      onClick={onClick}
      className="group bg-white rounded-[2rem] border border-slate-100 shadow-lg transition-all cursor-pointer flex flex-col overflow-hidden h-full relative"
    >
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm border border-white/20">
          {post.post_type}
        </span>
      </div>

      {post.attachment ? (
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={post.attachment} 
            alt={post.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className="h-4 w-full bg-indigo-50/30" />
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-4">
          <PriorityBadge priority={post.priority} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateStr}</span>
        </div>

        <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed mb-6">
          {post.content}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
              <Bell size={14} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Read More
            </span>
          </div>
          <div className="text-indigo-600">
            <Clock size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const PostDetailModal = ({ post, onClose }) => {
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="relative">
          {post.attachment && (
            <div className="w-full h-80 overflow-hidden">
               <img src={post.attachment} alt={post.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white border border-white/20 transition-all z-10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-10 py-10 flex-grow overflow-y-auto">
          <div className="flex flex-wrap gap-3 mb-6">
            <PriorityBadge priority={post.priority} />
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              {post.post_type}
            </span>
          </div>
          
          <h2 className="text-4xl font-black text-slate-900 leading-tight mb-6">
            {post.title}
          </h2>

          <div className="flex items-center gap-6 mb-8 text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-6">
            <span className="flex items-center gap-2"><Calendar size={14} /> Published: {new Date(post.created_at).toLocaleDateString()}</span>
            {post.event_date && (
              <span className="flex items-center gap-2 text-indigo-600">
                <Clock size={14} /> Event: {new Date(post.event_date).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="text-slate-600 font-medium leading-[1.8] whitespace-pre-line text-lg">
            {post.content}
          </div>

          <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-col gap-1">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Broadcast Created By</p>
               <p className="text-sm font-bold text-slate-900 italic">{post.created_by_name || 'System Administrator'}</p>
            </div>
            <button 
              onClick={onClose} 
              className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


const TeacherNoticesView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/posts/');
      setPosts(resp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? p.post_type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Posts & Updates</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1 italic">Important announcements and center news</p>
        </div>
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
           <Megaphone size={30} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/30">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search updates..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-4 text-slate-900 placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold" 
          />
        </div>
        <div className="flex gap-2">
           {['', 'announcement', 'event', 'notice', 'update'].map(type => (
              <button 
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                  typeFilter === type ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {type || 'All'}
              </button>
           ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto opacity-20" /></div>
        ) : filteredPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onClick={() => setSelectedPost(post)}
          />
        ))}
        {!loading && filteredPosts.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-50 shadow-sm">
            <Megaphone className="text-slate-100 mx-auto mb-6" size={60} />
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">No active updates for you today</p>
          </div>
        )}
      </div>


      <AnimatePresence>
        {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default TeacherNoticesView;
