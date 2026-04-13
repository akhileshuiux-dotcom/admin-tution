import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const TeacherMeetingsView = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/admin-meetings/`, { withCredentials: true })
      .then(r => setMeetings(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = meetings.filter(m => new Date(m.date_time) >= new Date());
  const past = meetings.filter(m => new Date(m.date_time) < new Date());

  const Card = ({ meeting, idx, dim }) => (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.04 }}
      style={{ background: dim ? '#fafafa' : '#fff', border: `1px solid ${meeting.mandatory_for_all ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 14, padding:'16px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', opacity: dim ? 0.65 : 1 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
        {meeting.mandatory_for_all && (
          <span style={{ display:'flex', alignItems:'center', gap:4, background:'#fef2f2', color:'#ef4444', border:'1px solid #fca5a5', borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700, flexShrink:0 }}>
            <AlertCircle size={10}/> Mandatory
          </span>
        )}
        <div>
          <p style={{ color:'#1e293b', fontWeight:700, fontSize:15, margin:0 }}>{meeting.title}</p>
          {meeting.description && <p style={{ color:'#64748b', fontSize:13, margin:'4px 0 0', lineHeight:1.5 }}>{meeting.description}</p>}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, flexWrap:'wrap' }}>
            <CalendarDays size={13} color="#f59e0b" />
            <span style={{ color:'#f59e0b', fontSize:12, fontWeight:600 }}>
              {new Date(meeting.date_time).toLocaleString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
              {meeting.end_time ? ` - ${meeting.end_time}` : ''}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: meeting.meeting_type === 'online' ? '#059669' : '#64748b', background: meeting.meeting_type === 'online' ? '#d1fae5' : '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
              Type: {meeting.meeting_type === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
          {meeting.meeting_type === 'online' && meeting.meeting_link && (
            <div style={{ marginTop: 10 }}>
              <a href={meeting.meeting_link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#ec4899', color: '#fff', textDecoration: 'none', padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8 }}>
                Join Meeting
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Header */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:18, padding:'18px 22px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        <span style={{ width:42, height:42, borderRadius:11, background:'linear-gradient(135deg,#0ea5e9,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <CalendarDays size={20} color="#fff" />
        </span>
        <div>
          <p style={{ color:'#1e293b', fontWeight:700, fontSize:17, margin:0 }}>Admin Meeting Schedule</p>
          <p style={{ color:'#94a3b8', fontSize:12, margin:0 }}>{upcoming.length} upcoming · {past.length} past</p>
        </div>
      </div>

      {loading ? <p style={{ textAlign:'center', color:'#94a3b8', padding:'60px 0' }}>Loading meetings…</p>
        : meetings.length === 0 ? <div style={{ textAlign:'center', color:'#94a3b8', padding:'60px 24px', background:'#fff', borderRadius:16, border:'1px solid #e2e8f0' }}>No meetings scheduled. Meetings added by Admin appear here.</div>
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {upcoming.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <p style={{ color:'#059669', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>Upcoming</p>
                {upcoming.map((m, i) => <Card key={m.id} meeting={m} idx={i} />)}
              </div>
            )}
            {past.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <p style={{ color:'#94a3b8', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>Past</p>
                {past.map((m, i) => <Card key={m.id} meeting={m} idx={i} dim />)}
              </div>
            )}
          </div>
        )
      }
    </div>
  );
};

export default TeacherMeetingsView;
