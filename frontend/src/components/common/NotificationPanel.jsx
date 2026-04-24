import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCheck, Trash2, X, AlertCircle, 
  BookOpen, Users, ClipboardList, CreditCard, 
  Video, FileText, Megaphone, Settings, Check, Clock
} from 'lucide-react';
import api from '../../api';

const TYPE_ICONS = {
  academic: { icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  attendance: { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  exam: { icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-50' },
  salary: { icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-50' },
  payment: { icon: CreditCard, color: 'text-rose-500', bg: 'bg-rose-50' },
  meeting: { icon: Video, color: 'text-blue-500', bg: 'bg-blue-50' },
  notes: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
  announcement: { icon: Megaphone, color: 'text-amber-500', bg: 'bg-amber-50' },
  system: { icon: Settings, color: 'text-slate-500', bg: 'bg-slate-50' },
};

const NotificationPanel = ({ onClose, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/notifications/');
      setNotifications(resp.data);
      if (onUnreadCountChange) {
        onUnreadCountChange(resp.data.filter(n => !n.is_read).length);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOne = (e, id) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const handleMarkAsRead = async (ids = selectedIds) => {
    if (ids.length === 0) return;
    try {
      await api.post('/notifications/mark_as_read/', { ids });
      setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n));
      setSelectedIds([]);
      if (onUnreadCountChange) {
        const unread = notifications.filter(n => !n.is_read && !ids.includes(n.id)).length;
        onUnreadCountChange(unread);
      }
    } catch (err) { console.error("Mark read failed:", err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (err) { console.error("Mark all read failed:", err); }
  };

  const handleClearSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to remove ${selectedIds.length} notification(s)?`)) return;
    try {
      await api.post('/notifications/clear_selected/', { ids: selectedIds });
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      if (onUnreadCountChange) {
        const unread = notifications.filter(n => !n.is_read && !selectedIds.includes(n.id)).length;
        onUnreadCountChange(unread);
      }
    } catch (err) { console.error("Clear failed:", err); }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    try {
      await api.post('/notifications/clear_all/');
      setNotifications([]);
      setSelectedIds([]);
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (err) { console.error("Clear all failed:", err); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      className="absolute right-0 top-full mt-4 w-[420px] max-h-[600px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div>
          <h3 className="text-[16px] font-black text-slate-800 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Recent updates & alerts</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
          <X size={18} />
        </button>
      </div>

      {/* Action Bar */}
      {notifications.length > 0 && (
        <div className="px-6 py-3 border-b border-slate-50 flex items-center justify-between bg-white text-[12px] font-bold">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-all"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedIds.length === notifications.length ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                {selectedIds.length === notifications.length && <Check size={10} color="#fff" />}
                {selectedIds.length > 0 && selectedIds.length < notifications.length && <div className="w-2 h-0.5 bg-slate-400" />}
              </div>
              Select All
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {selectedIds.length > 0 ? (
              <>
                <button onClick={() => handleMarkAsRead()} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-all">
                  <CheckCheck size={14} /> Mark Read
                </button>
                <button onClick={handleClearSelected} className="text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition-all">
                  <Trash2 size={14} /> Clear
                </button>
              </>
            ) : (
              <>
                <button onClick={handleMarkAllRead} className="text-indigo-600 hover:text-indigo-800 transition-all">Mark all read</button>
                <button onClick={handleClearAll} className="text-slate-400 hover:text-rose-600 transition-all">Clear all</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[100px] flex flex-col">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Fetching alerts...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <AlertCircle size={32} className="text-rose-400" />
            <p className="text-[14px] font-bold text-slate-800">{error}</p>
            <button onClick={fetchNotifications} className="text-indigo-600 font-bold text-[12px] hover:underline">Try Again</button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Bell size={28} />
            </div>
            <div>
              <p className="text-[15px] font-black text-slate-800">No notifications available</p>
              <p className="text-[12px] text-slate-400 mt-1">You're all caught up! New updates will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map(n => {
              const config = TYPE_ICONS[n.notification_type] || TYPE_ICONS.system;
              const isSelected = selectedIds.includes(n.id);
              return (
                <div 
                  key={n.id}
                  onClick={() => handleMarkAsRead([n.id])}
                  className={`group relative flex gap-4 px-6 py-5 cursor-pointer transition-all border-b border-slate-50 last:border-0 hover:bg-slate-50 ${!n.is_read ? 'bg-indigo-50/20' : 'opacity-80'}`}
                >
                  {/* Selection Checkbox */}
                  <div 
                    onClick={(e) => handleSelectOne(e, n.id)}
                    className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all mt-1 ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' : 'border-slate-200 bg-white group-hover:border-slate-300'}`}
                  >
                    {isSelected && <Check size={12} color="#fff" />}
                  </div>

                  {/* Icon */}
                  <div className={`shrink-0 w-11 h-11 rounded-2xl ${config.bg} flex items-center justify-center ${config.color} transition-transform group-hover:scale-110`}>
                    <config.icon size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-[13.5px] leading-tight truncate ${!n.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                        {n.title}
                      </h4>
                      {!n.is_read && <div className="shrink-0 w-2 h-2 rounded-full bg-rose-500 mt-1.5" />}
                    </div>
                    <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-2 font-medium">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={10} /> {n.created_time}</span>
                      <span>•</span>
                      <span>{n.created_date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 text-center">
        <button className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-all">
          Manage Delivery Settings
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationPanel;
