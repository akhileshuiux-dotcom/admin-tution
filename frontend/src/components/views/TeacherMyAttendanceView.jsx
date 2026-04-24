import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle, XCircle, Clock, Calendar, 
  ChevronRight, AlertCircle, Coffee, Filter, Search, Info, FileDown, X, TrendingUp,
  Camera, MapPin, ShieldCheck, MailWarning, Navigation, LogOut, Edit2
} from 'lucide-react';
import api from '../../api';

// --- Styling Constants ---
const cardStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 20,
  padding: '20px 24px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  position: 'relative',
  overflow: 'hidden'
};

const inputStyle = {
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: 12,
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: '600',
  color: '#1e293b',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'all 0.2s',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

const statusConfig = {
  present: { label: 'Present', bg: '#f0fdf4', color: '#059669', border: '#86efac', icon: CheckCircle },
  absent:  { label: 'Absent',  bg: '#fef2f2', color: '#ef4444', border: '#fca5a5', icon: XCircle },
  late:    { label: 'Late',    bg: '#fffbeb', color: '#f59e0b', border: '#fde68a', icon: Clock },
  leave:   { label: 'Leave',   bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', icon: Coffee },
  half_day:{ label: 'Half Day',bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe', icon: Clock },
  holiday: { label: 'Holiday', bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', icon: Calendar },
  checked_in: { label: 'Checked-in', bg: '#ecfdf5', color: '#10b981', border: '#a7f3d0', icon: ShieldCheck },
  checked_out: { label: 'Checked-out', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', icon: ShieldCheck },
  corrected: { label: 'Corrected', bg: '#fff7ed', color: '#ea580c', border: '#ffedd5', icon: Edit2 },
};

// --- Sub-components ---
const SummaryCard = ({ label, value, color, icon: Icon, delay, subValue }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} style={cardStyle}>
    <p style={{ color: '#64748b', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>{label}</p>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color, fontSize: 26, fontWeight: 900, margin: 0 }}>{value}</p>
        {subValue && <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 600 }}>{subValue}</p>}
      </div>
      <Icon size={20} color={color} style={{ opacity: 0.15 }} />
    </div>
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: color, opacity: 0.1 }} />
  </motion.div>
);

const CameraModal = ({ isOpen, onClose, onCapture, title }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      setError("Camera access denied or unavailable.");
      console.error(e);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    onCapture(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Capture {title} Selfie</h3>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: 10, cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 24 }}>
          {error ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
              <AlertCircle size={40} style={{ marginBottom: 16 }} />
              <p>{error}</p>
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#000', aspectRatio: '4/3' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, border: '2px dashed rgba(255,255,255,0.3)', borderRadius: 20, margin: 20 }} />
            </div>
          )}
          <button onClick={capture} disabled={!!error} style={{ width: '100%', marginTop: 24, padding: 14, background: '#1e293b', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Camera size={18} /> Capture Photo
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Helper: Format time to 12-hour format with AM/PM (removing milliseconds)
const formatTime = (timeStr) => {
  if (!timeStr) return '--:-- --';
  const parts = timeStr.split('.')[0].split(':');
  if (parts.length < 2) return timeStr;
  
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const s = parts[2] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  
  return `${h}:${m}:${s} ${ampm}`;
};

// Helper: Calculate duration between two times
const calculateWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  try {
    const [h1, m1, s1] = checkIn.split(':').map(f => parseFloat(f));
    const [h2, m2, s2] = checkOut.split(':').map(f => parseFloat(f));
    const start = h1 * 3600 + m1 * 60 + (s1 || 0);
    const end = h2 * 3600 + m2 * 60 + (s2 || 0);
    let diff = end - start;
    if (diff < 0) diff += 24 * 3600; 
    
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return `${h}h ${m}m`;
  } catch (e) {
    return null;
  }
};

// Helper: Convert time to 24h with specific AM/PM toggle
const set24hTime = (fullTime24, newAmPm) => {
  if (!fullTime24) return newAmPm === 'AM' ? '09:00' : '21:00';
  const parts = fullTime24.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const s = parts[2] || '00';
  
  h = h % 12;
  if (newAmPm === 'PM') h += 12;
  
  return `${h.toString().padStart(2, '0')}:${m}:${s}`;
};

const TeacherMyAttendanceView = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'regularize'
  const [history, setHistory] = useState([]);
  const [regRequests, setRegRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Selfie / Location State
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState('in'); // 'in' | 'out'
  const [location, setLocation] = useState({ lat: null, lng: null, loading: false, error: null });
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    type: 'missed_check_in', 
    reason: '', 
    requested_check_in: '', 
    requested_check_out: '' 
  });
  const [currentAtt, setCurrentAtt] = useState(null);
  const [fetchingCurrent, setFetchingCurrent] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aResp, rResp] = await Promise.all([
        api.get('/teacher-attendance/'),
        api.get('/regularization-requests/')
      ]);
      setHistory(aResp.data.sort((a,b) => new Date(b.date) - new Date(a.date)));
      setRegRequests(rResp.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentAttendance = async (date) => {
    if (!date) return;
    setFetchingCurrent(true);
    try {
      const resp = await api.get(`/teacher-attendance/?date=${date}`);
      // Assuming the API returns a list, we take the first one
      const record = resp.data.find(r => r.date === date);
      setCurrentAtt(record || null);
      
      // Auto-populate requested times if they exist to help teacher edit
      if (record) {
        setRegForm(prev => ({
          ...prev,
          requested_check_in: record.check_in || prev.requested_check_in,
          requested_check_out: record.check_out || prev.requested_check_out
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingCurrent(false);
    }
  };

  useEffect(() => {
    if (showRegModal) {
      fetchCurrentAttendance(regForm.date);
    }
  }, [regForm.date, showRegModal]);

  const getLocation = () => {
    setLocation(p => ({ ...p, loading: true, error: null }));
    if (!navigator.geolocation) {
      setLocation(p => ({ ...p, loading: false, error: "Geolocation not supported" }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, loading: false, error: null });
      },
      (err) => {
        setLocation(p => ({ ...p, loading: false, error: "Location access denied." }));
        console.error(err);
      }
    );
  };

  const handleSelfMark = async (selfieData) => {
    if (!location.lat || !location.lng) {
      alert("Please enable location verification first.");
      return;
    }
    setSubmitting(true);
    try {
      // Convert base64 to File
      const blob = await (await fetch(selfieData)).blob();
      const file = new File([blob], `selfie_${cameraType}.jpg`, { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('selfie', file);
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);
      formData.append('type', cameraType === 'in' ? 'check_in' : 'check_out');
      
      await api.post('/teacher-attendance/mark_self/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert(`Successfully ${cameraType === 'in' ? 'checked-in' : 'checked-out'}!`);
      fetchData();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || "Failed to mark attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitRegularization = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/regularization-requests/', {
        attendance_date: regForm.date,
        request_type: regForm.type,
        reason: regForm.reason,
        requested_check_in: regForm.requested_check_in || null,
        requested_check_out: regForm.requested_check_out || null,
        teacher: user.id
      });
      alert("Request submitted for admin approval.");
      setShowRegModal(false);
      setRegForm({ date: new Date().toISOString().split('T')[0], type: 'missed_check_in', reason: '', requested_check_in: '', requested_check_out: '' });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const total = history.length;
    if (total === 0) return { present: 0, absent: 0, late: 0, leave: 0, half_day: 0, percentage: 0 };
    const p = history.filter(h => ['present', 'checked_in', 'checked_out', 'corrected'].includes(h.status)).length;
    const a = history.filter(h => h.status === 'absent').length;
    const lv = history.filter(h => h.status === 'leave').length;
    const holidays = history.filter(h => h.status === 'holiday').length;
    const workingDays = total - holidays;
    const pct = workingDays > 0 ? (p / workingDays * 100).toFixed(1) : 0;
    return { present: p, absent: a, percentage: pct, total, leave: lv };
  }, [history]);

  const todayRecord = history.find(h => h.date === new Date().toISOString().split('T')[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>My Attendance</h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Verified staff attendance portal.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 4, background: '#e2e8f0', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          {[
            { key: 'overview', label: 'Overview', icon: CheckCircle },
            { key: 'history', label: 'Attendance Logs', icon: Calendar },
            { key: 'regularize', label: 'Correction Requests', icon: MailWarning },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', 
                background: activeTab === t.key ? '#fff' : 'transparent', 
                color: activeTab === t.key ? '#0ea5e9' : '#64748b', 
                fontWeight: 700, fontSize: 13, cursor: 'pointer', 
                boxShadow: activeTab === t.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', 
                transition: 'all 0.2s' 
              }}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Today's Action Card */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24 }}>
              <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', border: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 180 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      <h3 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 900 }}>Daily Verification</h3>
                      <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                        {todayRecord?.check_out ? 'Work day completed.' : todayRecord?.check_in ? 'You are currently active.' : 'Please mark your check-in.'}
                      </p>
                    </div>
                    <div style={{ padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 18, fontWeight: 800 }}>
                       {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    {!todayRecord?.check_in && (
                      <button onClick={() => { setCameraType('in'); setShowCamera(true); }}
                        style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '14px', borderRadius: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <ShieldCheck size={18} /> Mark Check-in
                      </button>
                    )}
                    {todayRecord?.check_in && !todayRecord?.check_out && (
                      <button onClick={() => { setCameraType('out'); setShowCamera(true); }}
                        style={{ flex: 1, background: '#f43f5e', color: '#fff', border: 'none', padding: '14px', borderRadius: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <LogOut size={18} /> Mark Check-out
                      </button>
                    )}
                    <button onClick={() => setShowRegModal(true)}
                      style={{ padding: '0 20px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}>
                      Regularize
                    </button>
                 </div>
              </div>

              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MapPin size={18} color="#0ea5e9" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>Location Verification</span>
                 </div>
                 
                 <div style={{ flex: 1, background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    {location.loading ? (
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Navigation size={24} color="#0ea5e9" /></motion.div>
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Acquiring GPS Signal...</p>
                       </div>
                    ) : location.lat ? (
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <ShieldCheck size={28} color="#10b981" />
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Signal Verified</p>
                          <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                       </div>
                    ) : (
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <AlertCircle size={28} color="#cbd5e1" />
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Location required for attendance tracking.</p>
                          <button onClick={getLocation} style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Enable Sensor</button>
                       </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <SummaryCard label="Attendance %" value={`${stats.percentage}%`} color="#0ea5e9" icon={TrendingUp} delay={0} />
              <SummaryCard label="Present Days" value={stats.present} color="#059669" icon={CheckCircle} delay={0.05} />
              <SummaryCard label="Absences" value={stats.absent} color="#ef4444" icon={XCircle} delay={0.1} />
              <SummaryCard label="Approved Leaves" value={stats.leave} color="#7c3aed" icon={Coffee} delay={0.15} />
            </div>

            <div style={{ ...cardStyle }}>
               <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Recent Activity</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {history.slice(0, 5).map(h => {
                    const cfg = statusConfig[h.status] || statusConfig.present;
                    return (
                       <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                             <div style={{ background: cfg.bg, color: cfg.color, padding: 8, borderRadius: 10 }}><cfg.icon size={16} /></div>
                             <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{new Date(h.date).toLocaleDateString()}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                   <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{formatTime(h.check_in)} - {formatTime(h.check_out)}</p>
                                   {h.check_in && h.check_out && <span style={{ fontSize: 10, fontWeight: 700, color: '#0ea5e9', background: '#e0f2fe', padding: '1px 6px', borderRadius: 4 }}>{calculateWorkHours(h.check_in, h.check_out)}</span>}
                                </div>
                             </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                             <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color, textTransform: 'uppercase' }}>{cfg.label}</span>
                             {h.check_in_verified && <p style={{ margin: 0, fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><ShieldCheck size={10} /> Verified</p>}
                          </div>
                       </div>
                    );
                 })}
               </div>
            </div>
          </motion.div>
        )}

        {/* --- History Tab --- */}
        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Timings</th>
                    <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Work Hours</th>
                    <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Verification</th>
                    <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(row => {
                    const cfg = statusConfig[row.status] || statusConfig.present;
                    return (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{row.date}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 11 }}>
                            <cfg.icon size={11} /> {cfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{formatTime(row.check_in)} - {formatTime(row.check_out)}</td>
                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#0ea5e9', fontWeight: 700 }}>{calculateWorkHours(row.check_in, row.check_out) || '--'}</td>
                        <td style={{ padding: '16px 24px' }}>
                           {row.check_in_verified ? (
                             <span style={{ color: '#10b981', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} /> GPS Verified</span>
                           ) : <span style={{ color: '#64748b', fontSize: 12 }}>Manual entry</span>}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: 12, color: '#64748b' }}>{row.attendance_source === 'self' ? 'Portal Check-in' : 'Admin'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* --- Regularization Tab --- */}
        {activeTab === 'regularize' && (
           <motion.div key="regularize" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ ...cardStyle, background: '#f8fafc', border: '1px dashed #e2e8f0', textAlign: 'center', padding: '40px 20px' }}>
                 <MailWarning size={40} color="#0ea5e9" style={{ marginBottom: 16, opacity: 0.2 }} />
                 <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Attendance Correction</h3>
                 <p style={{ color: '#64748b', fontSize: 14, maxWidth: 450, margin: '8px auto 24px' }}>
                    If you missed a check-in/out or encountered technical issues, you can submit a regularization request for admin review.
                 </p>
                 <button onClick={() => setShowRegModal(true)} style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}>
                    New Correction Request
                 </button>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, overflow: 'hidden' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                       <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Request Date</th>
                          <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Target Date</th>
                          <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Type</th>
                          <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                          <th style={{ padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Admin Note</th>
                       </tr>
                    </thead>
                    <tbody>
                       {regRequests.map(req => (
                          <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                             <td style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                             <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{req.attendance_date}</td>
                             <td style={{ padding: '16px 24px', fontSize: 13, color: '#1e293b' }}>{req.request_type.replace(/_/g, ' ')}</td>
                             <td style={{ padding: '16px 24px' }}>
                                <span style={{ 
                                   fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase',
                                   background: req.status === 'approved' ? '#f0fdf4' : req.status === 'rejected' ? '#fef2f2' : '#f8fafc',
                                   color: req.status === 'approved' ? '#15803d' : req.status === 'rejected' ? '#b91c1c' : '#64748b'
                                }}>{req.status}</span>
                             </td>
                             <td style={{ padding: '16px 24px', fontSize: 12, color: '#64748b' }}>{req.admin_note || 'Pending review...'}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      <CameraModal isOpen={showCamera} onClose={() => setShowCamera(false)} onCapture={handleSelfMark} title={cameraType === 'in' ? 'Check-in' : 'Check-out'} />

      {/* --- Regularization Modal --- */}
      <AnimatePresence>
        {showRegModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 500, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>New Correction Request</h3>
                   <button onClick={() => setShowRegModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: 10, cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <form onSubmit={submitRegularization} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                       <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Date of Issue</label>
                       <input type="date" required value={regForm.date} onChange={e => setRegForm({...regForm, date: e.target.value})} style={inputStyle} />
                    </div>

                    {/* Current Data Display */}
                    <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #f1f5f9' }}>
                       <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Current Recorded Data</p>
                       {fetchingCurrent ? (
                          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Checking records...</p>
                       ) : currentAtt ? (
                          <div style={{ display: 'flex', gap: 20 }}>
                             <div>
                                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>IN</p>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{formatTime(currentAtt.check_in)}</p>
                             </div>
                             <div>
                                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>OUT</p>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{formatTime(currentAtt.check_out)}</p>
                             </div>
                             <div>
                                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>STATUS</p>
                                <span style={{ fontSize: 11, fontWeight: 800, color: statusConfig[currentAtt.status]?.color || '#64748b' }}>
                                   {statusConfig[currentAtt.status]?.label || currentAtt.status}
                                </span>
                             </div>
                          </div>
                       ) : <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>No record found for this date.</p>}
                    </div>

                    <div>
                       <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Request Type</label>
                       <select value={regForm.type} onChange={e => setRegForm({...regForm, type: e.target.value})} style={inputStyle}>
                          <option value="missed_check_in">Missed Check-in</option>
                          <option value="missed_check_out">Missed Check-out</option>
                          <option value="wrong_check_in_time">Wrong Check-in Time</option>
                          <option value="wrong_check_out_time">Wrong Check-out Time</option>
                          <option value="full_day_correction">Full Day Correction</option>
                          <option value="other">Other Reason</option>
                       </select>
                    </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {['missed_check_in', 'wrong_check_in_time', 'full_day_correction'].includes(regForm.type) && (
                           <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                 <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Correct Check-in</label>
                                 <div style={{ display: 'flex', gap: 2, background: '#f1f5f9', padding: 2, borderRadius: 8 }}>
                                    <button type="button" onClick={() => setRegForm({...regForm, requested_check_in: set24hTime(regForm.requested_check_in, 'AM')})}
                                      style={{ padding: '2px 8px', fontSize: 9, fontWeight: 800, border: 'none', cursor: 'pointer', borderRadius: 6, background: (parseInt(regForm.requested_check_in?.split(':')[0]) || 0) < 12 ? '#fff' : 'transparent', color: (parseInt(regForm.requested_check_in?.split(':')[0]) || 0) < 12 ? '#0ea5e9' : '#94a3b8' }}>AM</button>
                                    <button type="button" onClick={() => setRegForm({...regForm, requested_check_in: set24hTime(regForm.requested_check_in, 'PM')})}
                                      style={{ padding: '2px 8px', fontSize: 9, fontWeight: 800, border: 'none', cursor: 'pointer', borderRadius: 6, background: (parseInt(regForm.requested_check_in?.split(':')[0]) || 0) >= 12 ? '#fff' : 'transparent', color: (parseInt(regForm.requested_check_in?.split(':')[0]) || 0) >= 12 ? '#0ea5e9' : '#94a3b8' }}>PM</button>
                                 </div>
                              </div>
                              <input type="time" required value={regForm.requested_check_in ? (parseInt(regForm.requested_check_in.split(":")[0])%12 || 12).toString().padStart(2, '0') + ":" + regForm.requested_check_in.split(":")[1] : ''} 
                                onChange={e => {
                                   const [h, m] = e.target.value.split(':');
                                   const ampm = (parseInt(regForm.requested_check_in?.split(':')[0]) || 0) >= 12 ? 'PM' : 'AM';
                                   setRegForm({...regForm, requested_check_in: set24hTime(`${h}:${m}`, ampm)});
                                }} style={inputStyle} />
                           </div>
                        )}
                        {['missed_check_out', 'wrong_check_out_time', 'full_day_correction'].includes(regForm.type) && (
                           <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                 <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Correct Check-out</label>
                                 <div style={{ display: 'flex', gap: 2, background: '#f1f5f9', padding: 2, borderRadius: 8 }}>
                                    <button type="button" onClick={() => setRegForm({...regForm, requested_check_out: set24hTime(regForm.requested_check_out, 'AM')})}
                                      style={{ padding: '2px 8px', fontSize: 9, fontWeight: 800, border: 'none', cursor: 'pointer', borderRadius: 6, background: (parseInt(regForm.requested_check_out?.split(':')[0]) || 0) < 12 ? '#fff' : 'transparent', color: (parseInt(regForm.requested_check_out?.split(':')[0]) || 0) < 12 ? '#0ea5e9' : '#94a3b8' }}>AM</button>
                                    <button type="button" onClick={() => setRegForm({...regForm, requested_check_out: set24hTime(regForm.requested_check_out, 'PM')})}
                                      style={{ padding: '2px 8px', fontSize: 9, fontWeight: 800, border: 'none', cursor: 'pointer', borderRadius: 6, background: (parseInt(regForm.requested_check_out?.split(':')[0]) || 0) >= 12 ? '#fff' : 'transparent', color: (parseInt(regForm.requested_check_out?.split(':')[0]) || 0) >= 12 ? '#0ea5e9' : '#94a3b8' }}>PM</button>
                                 </div>
                              </div>
                              <input type="time" required value={regForm.requested_check_out ? (parseInt(regForm.requested_check_out.split(":")[0])%12 || 12).toString().padStart(2, '0') + ":" + regForm.requested_check_out.split(":")[1] : ''} 
                                onChange={e => {
                                   const [h, m] = e.target.value.split(':');
                                   const ampm = (parseInt(regForm.requested_check_out?.split(':')[0]) || 0) >= 12 ? 'PM' : 'AM';
                                   setRegForm({...regForm, requested_check_out: set24hTime(`${h}:${m}`, ampm)});
                                }} style={inputStyle} />
                           </div>
                        )}
                     </div>

                    <div>
                       <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Reason for Correction</label>
                       <textarea required rows={3} placeholder="Please explain the reason for this request..." value={regForm.reason} onChange={e => setRegForm({...regForm, reason: e.target.value})} style={{ ...inputStyle, height: 'auto', resize: 'none' }} />
                    </div>
                    <button type="submit" disabled={submitting} style={{ width: '100%', padding: 14, background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                       {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                 </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherMyAttendanceView;
