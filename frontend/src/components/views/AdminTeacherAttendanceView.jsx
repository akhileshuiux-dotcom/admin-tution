import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle, XCircle, Clock, Calendar, 
  Search, FileDown, Plus, Edit2, Save, X, 
  Filter, ChevronRight, AlertCircle, Coffee,
  MapPin, Shield, Navigation, Settings, History, Camera,
  TrendingUp, Info, Crosshair, Maximize2, RotateCcw, Trash2, RefreshCw, AlertTriangle
} from 'lucide-react';
import api from '../../api';
import 'leaflet/dist/leaflet.css';

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
  checked_in: { label: 'Checked-in', bg: '#ecfdf5', color: '#10b981', border: '#a7f3d0', icon: Shield },
  checked_out: { label: 'Checked-out', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', icon: Shield },
  corrected: { label: 'Corrected', bg: '#fff7ed', color: '#ea580c', border: '#ffedd5', icon: Edit2 },
};

// --- Sub-components ---
const SummaryCard = ({ label, value, color, icon: Icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay }}
    style={cardStyle}
  >
    <p style={{ color: '#94a3b8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>{label}</p>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p style={{ color, fontSize: 26, fontWeight: 900, margin: 0 }}>{value}</p>
      <Icon size={20} color={color} style={{ opacity: 0.15 }} />
    </div>
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: color, opacity: 0.1 }} />
  </motion.div>
);

// New Map Components
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Marker Icon issues in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Marker Icon issues in Leaflet + React
if (L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
  });
}

const MapEventsHandler = ({ onClick }) => {
  useMapEvents({
    click: (e) => onClick(e.latlng),
  });
  return null;
};

const ChangeMapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
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
    if (diff < 0) diff += 24 * 3600; // Handle shifts crossing midnight
    
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

const AdminTeacherAttendanceView = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history' | 'regularization' | 'settings'
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [regRequests, setRegRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // School Settings State
  const [schoolSettings, setSchoolSettings] = useState(null);
  const [initialSettings, setInitialSettings] = useState(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);

  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tResp, aResp, rResp, sResp] = await Promise.all([
        api.get('/teachers/'),
        api.get(`/teacher-attendance/?date=${selectedDate}`),
        api.get('/regularization-requests/?status=pending'),
        api.get('/school-settings/')
      ]);
      setTeachers(tResp.data);
      setAttendance(aResp.data);
      setRegRequests(rResp.data);
      
      const settings = sResp.data[0] || { 
        latitude: 28.6139, 
        longitude: 77.2090, 
        radius_meters: 100, 
        address: '', 
        location_name: '',
        location_source: 'map'
      };
      setSchoolSettings(settings);
      setInitialSettings(JSON.stringify(settings));
      
      const lat = parseFloat(settings.latitude);
      const lng = parseFloat(settings.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
      } else {
        setMapCenter([28.6139, 77.2090]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Detect Unsaved Changes
  useEffect(() => {
    if (schoolSettings && initialSettings) {
      const current = JSON.stringify(schoolSettings);
      setHasUnsavedChanges(current !== initialSettings);
    }
  }, [schoolSettings, initialSettings]);

  // Navigation Warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleTabChange = (newTab) => {
    if (hasUnsavedChanges && activeTab === 'settings') {
      if (!window.confirm("You have unsaved geofence changes. Do you want to discard them?")) return;
      try {
        if (initialSettings) setSchoolSettings(JSON.parse(initialSettings));
      } catch (err) {
        console.error("Revert failed", err);
      }
    }
    setActiveTab(newTab);
  };

  const processRequest = async (id, status, note) => {
    setSubmitting(true);
    try {
      await api.post(`/regularization-requests/${id}/process_request/`, { status, admin_note: note });
      alert(`Request ${status} successfully.`);
      setSelectedRequest(null);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to process request.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateAttendanceEntry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editRecord.id) {
         await api.patch(`/teacher-attendance/${editRecord.id}/`, {
            ...editRecord,
            is_corrected: true,
            corrected_by: user.id,
            correction_time: new Date().toISOString()
         });
      } else {
         await api.post('/teacher-attendance/', { ...editRecord, attendance_source: 'admin', marked_by: user.id });
      }
      alert("Record updated successfully.");
      setEditRecord(null);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to update record.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateSchoolSettings = async (e) => {
    if (e) e.preventDefault();
    
    // Validations
    if (!schoolSettings.latitude || !schoolSettings.longitude) {
      alert("Please select a school location on the map.");
      return;
    }
    if (schoolSettings.radius_meters < 50 || schoolSettings.radius_meters > 500) {
      alert("Radius must be between 50m and 500m.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...schoolSettings,
        latitude: parseFloat(schoolSettings.latitude).toFixed(6),
        longitude: parseFloat(schoolSettings.longitude).toFixed(6),
        updated_by: user.id
      };
      if (schoolSettings?.id) {
         await api.patch(`/school-settings/${schoolSettings.id}/`, payload);
      } else {
         await api.post('/school-settings/', payload);
      }
      alert("Geofence configuration saved successfully.");
      setInitialSettings(JSON.stringify(schoolSettings));
      setHasUnsavedChanges(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkMarkPresent = async () => {
    if (!window.confirm("Mark all teachers as present for today? This will only affect staff without existing logs.")) return;
    setSubmitting(true);
    try {
      const alreadyMarkedIds = attendance.map(a => a.teacher);
      const unmarkedTeachers = teachers.filter(t => !alreadyMarkedIds.includes(t.id));
      
      const records = unmarkedTeachers.map(t => ({
        teacher_id: t.id,
        status: 'present',
        attendance_source: 'admin'
      }));
      
      if (records.length === 0) {
        alert("All staff members already have attendance records for this date.");
        return;
      }

      await api.post('/teacher-attendance/bulk_mark/', {
        date: selectedDate,
        records
      });
      alert(`Successfully marked ${records.length} staff members as present.`);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to perform bulk action.");
    } finally {
      setSubmitting(false);
    }
  };

  // Map / Search Handlers
  const searchLocation = async (query) => {
    if (!query || query.length < 3) return;
    setSearching(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
      const data = await resp.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = async (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    setSchoolSettings({
      ...schoolSettings,
      latitude: lat,
      longitude: lon,
      address: result.display_name,
      location_name: result.name || result.display_name.split(',')[0],
      location_source: 'search'
    });
    setMapCenter([lat, lon]);
    setSearchResults([]);
    setLocationSearch(result.display_name);
  };

  const reverseGeocode = async (lat, lon, source = 'map') => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await resp.json();
      setSchoolSettings({
        ...schoolSettings,
        latitude: lat,
        longitude: lon,
        address: data.display_name,
        location_name: data.name || data.display_name.split(',')[0] || 'Selected Point',
        location_source: source
      });
      setLocationSearch(data.display_name);
    } catch (err) {
      console.error(err);
      setSchoolSettings({
        ...schoolSettings,
        latitude: lat,
        longitude: lon,
        location_source: source
      });
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        reverseGeocode(latitude, longitude, 'current');
      },
      () => alert("Location permission denied. Please search or select the location manually.")
    );
  };

  const clearLocation = () => {
    if (!window.confirm("Are you sure you want to clear the selected geofence location?")) return;
    setSchoolSettings({
      ...schoolSettings,
      latitude: null,
      longitude: null,
      address: '',
      location_name: '',
      location_source: 'map'
    });
    setLocationSearch('');
  };

  const resetToSaved = () => {
    if (!window.confirm("Revert unsaved changes back to the last saved geofence?")) return;
    const saved = JSON.parse(initialSettings);
    setSchoolSettings(saved);
    if (saved.latitude) setMapCenter([saved.latitude, saved.longitude]);
    setLocationSearch(saved.address || '');
    setHasUnsavedChanges(false);
  };

  const stats = useMemo(() => {
    const presentCount = attendance.filter(a => ['present', 'checked_in', 'checked_out', 'corrected'].includes(a.status)).length;
    const absentCount = teachers.length - presentCount;
    return { present: presentCount, absent: absentCount, total: teachers.length, pendingReg: regRequests.length };
  }, [attendance, teachers, regRequests]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter(a => 
      a.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.teacher_id_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [attendance, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>Staff Attendance</h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Administrative control & verification portal.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 4, background: '#e2e8f0', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          {[
            { key: 'dashboard', label: 'Monitor', icon: TrendingUp },
            { key: 'regularization', label: `Requests (${stats.pendingReg})`, icon: AlertTriangle },
            { key: 'history', label: 'Detailed Logs', icon: History },
            { key: 'settings', label: 'Geofence', icon: Settings },
          ].map(t => (
            <button key={t.key} onClick={() => handleTabChange(t.key)}
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
              {t.key === 'settings' && hasUnsavedChanges && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             {/* Stats */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
               <SummaryCard label="On-Site Today" value={stats.present} color="#059669" icon={CheckCircle} delay={0} />
               <SummaryCard label="Not Logged" value={stats.absent} color="#ef4444" icon={XCircle} delay={0.05} />
               <SummaryCard label="Pending Correction" value={stats.pendingReg} color="#f59e0b" icon={AlertTriangle} delay={0.1} />
               <SummaryCard label="Total Staff" value={stats.total} color="#1e293b" icon={Users} delay={0.15} />
             </div>

             {/* Live Feed / Daily Register */}
             <div style={{ ...cardStyle }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ ...inputStyle, width: 160 }} />
                      <div style={{ position: 'relative' }}>
                         <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                         <input type="text" placeholder="Search staff..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: 34, width: 220 }} />
                      </div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={handleBulkMarkPresent} disabled={submitting}
                        style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #86efac', padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle size={16} /> Mark All Present
                      </button>
                      <button onClick={() => setEditRecord({ date: selectedDate, status: 'present', check_in: '', check_out: '', teacher: '' })}
                        style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Plus size={16} /> Mark Manual
                      </button>
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {loading ? <p style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading register...</p> : 
                    filteredAttendance.length === 0 ? <p style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No logs found for this date.</p> :
                    filteredAttendance.map((a, idx) => {
                      const cfg = statusConfig[a.status] || statusConfig.present;
                      return (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 2 }}>
                              <div style={{ display: 'flex', gap: 4 }}>
                                 <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: a.check_in_selfie ? 'zoom-in' : 'default' }} onClick={() => a.check_in_selfie && window.open(a.check_in_selfie, '_blank')}>
                                    {a.check_in_selfie ? <img src={a.check_in_selfie} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={16} color="#cbd5e1" />}
                                 </div>
                                 <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: a.check_out_selfie ? 'zoom-in' : 'default' }} onClick={() => a.check_out_selfie && window.open(a.check_out_selfie, '_blank')}>
                                    {a.check_out_selfie ? <img src={a.check_out_selfie} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={16} color="#cbd5e1" />}
                                 </div>
                              </div>
                              <div>
                                 <p style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: 14 }}>{a.teacher_name}</p>
                                 <p style={{ margin: 0, color: '#94a3b8', fontSize: 11 }}>{a.teacher_id_code} • {a.attendance_source === 'self' ? 'Self-Marked' : 'Admin Entry'}</p>
                              </div>
                           </div>

                           <div style={{ flex: 1, textAlign: 'center' }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{formatTime(a.check_in)} - {formatTime(a.check_out)}</p>
                              {a.check_in && a.check_out && (
                                <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: '#0ea5e9' }}>
                                   {calculateWorkHours(a.check_in, a.check_out)} total
                                </p>
                              )}
                           </div>

                           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              {a.check_in_verified ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 11, fontWeight: 700 }}>
                                   <Shield size={14} /> GPS Verified
                                </div>
                              ) : <span style={{ color: '#94a3b8', fontSize: 11 }}>Manual</span>}
                           </div>

                           <div style={{ flex: 1, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color, background: cfg.bg, padding: '4px 10px', borderRadius: 8 }}>{cfg.label}</span>
                              <button onClick={() => setEditRecord(a)} style={{ border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer' }} className="hover:text-blue-500"><Edit2 size={16} /></button>
                           </div>
                        </div>
                      );
                    })
                   }
                </div>
             </div>
          </motion.div>
        )}

        {/* --- Regularization Inbox --- */}
        {activeTab === 'regularization' && (
           <motion.div key="regularization" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ ...cardStyle, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <AlertTriangle size={20} color="#f59e0b" />
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Pending Correction Requests</h3>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {regRequests.length === 0 ? <p style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No pending requests.</p> :
                     regRequests.map(req => (
                        <div key={req.id} style={{ ...cardStyle, padding: '24px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                              <div>
                                 <h4 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#1e293b' }}>{req.teacher_name}</h4>
                                 <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>{req.attendance_date}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#0ea5e9', background: '#e0f2fe', padding: '2px 8px', borderRadius: 4 }}>{req.request_type.replace(/_/g, ' ').toUpperCase()}</span>
                                 </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                 <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Submitted On</p>
                                 <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>{new Date(req.created_at).toLocaleDateString()}</p>
                              </div>
                           </div>

                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #f1f5f9' }}>
                                 <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Current Record</p>
                                 <div style={{ display: 'flex', gap: 24 }}>
                                    <div>
                                       <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>IN</p>
                                       <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#64748b' }}>{req.current_attendance_data?.check_in || '--:--'}</p>
                                    </div>
                                    <div>
                                       <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>OUT</p>
                                       <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#64748b' }}>{req.current_attendance_data?.check_out || '--:--'}</p>
                                    </div>
                                    <div>
                                       <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#94a3b8' }}>STATUS</p>
                                       <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#64748b' }}>{req.current_attendance_data?.status || 'Null'}</p>
                                    </div>
                                 </div>
                              </div>
                              <div style={{ background: '#f0fdfa', padding: 16, borderRadius: 16, border: '1px solid #ccfbf1' }}>
                                 <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 800, color: '#2dd4bf', textTransform: 'uppercase' }}>Requested Correction</p>
                                 <div style={{ display: 'flex', gap: 24 }}>
                                    {req.requested_check_in && (
                                       <div>
                                          <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#2dd4bf' }}>NEW IN</p>
                                          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f766e' }}>{formatTime(req.requested_check_in)}</p>
                                       </div>
                                    )}
                                    {req.requested_check_out && (
                                       <div>
                                          <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#2dd4bf' }}>NEW OUT</p>
                                          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f766e' }}>{formatTime(req.requested_check_out)}</p>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>

                           <div style={{ marginBottom: 20 }}>
                              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Staff Reason</p>
                              <div style={{ background: '#fff', padding: 12, borderRadius: 12, fontSize: 13, color: '#475569', border: '1px solid #f1f5f9' }}>
                                 "{req.reason}"
                              </div>
                           </div>
                           
                           <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                              <button onClick={() => setSelectedRequest({ ...req, status: 'rejected' })} style={{ padding: '10px 24px', borderRadius: 12, border: '1px solid #fca5a5', background: '#fff', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Reject</button>
                              <button onClick={() => setSelectedRequest({ ...req, status: 'approved' })} style={{ padding: '10px 24px', borderRadius: 12, border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Approve & Sync</button>
                           </div>
                        </div>
                     ))
                    }
                 </div>
              </div>
           </motion.div>
        )}

        {/* --- Geofence Settings Overhaul --- */}
        {activeTab === 'settings' && (
           <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 850, margin: '0 auto' }}>
                 
                 {/* 1. Header Section */}
                 <div style={{ ...cardStyle }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <MapPin size={24} color="#0ea5e9" />
                          </div>
                          <div>
                             <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Geofence Configuration</h3>
                             <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Define the school location and allowed attendance radius.</p>
                          </div>
                       </div>
                       
                       {schoolSettings?.updated_at && (
                          <div style={{ textAlign: 'right' }}>
                             <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Last Updated</p>
                             <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#475569' }}>{new Date(schoolSettings.updated_at).toLocaleString()}</p>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* 2. Location Selection Section */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 24, alignItems: 'start' }}>
                    
                    {/* Map Interaction Area */}
                    <div style={{ ...cardStyle, padding: 0, height: 500, overflow: 'hidden' }}>
                       <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000, display: 'flex', gap: 10 }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                             <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                             <input 
                                type="text" 
                                placeholder="Search school location / address..." 
                                value={locationSearch}
                                onChange={(e) => {
                                   setLocationSearch(e.target.value);
                                   searchLocation(e.target.value);
                                }}
                                style={{ ...inputStyle, paddingLeft: 42, background: 'rgba(255,255,255,0.95)', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                             />
                             {/* Suggestions Overlay */}
                             {searchResults.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                  style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, background: '#fff', borderRadius: 14, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', maxHeight: 250, overflowY: 'auto' }}>
                                   {searchResults.map((res, i) => (
                                      <div key={i} onClick={() => handleSelectSearchResult(res)}
                                        style={{ padding: '12px 16px', borderBottom: i === searchResults.length -1 ? 'none' : '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', gap: 12 }} className="hover:bg-slate-50">
                                         <MapPin size={16} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
                                         <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{res.display_name}</span>
                                      </div>
                                   ))}
                                </motion.div>
                             )}
                          </div>
                          <button onClick={useCurrentLocation} title="Use Current Location"
                            style={{ width: 46, height: 46, borderRadius: 12, border: 'none', background: '#0ea5e9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)' }}>
                             <Navigation size={20} />
                          </button>
                       </div>

                       <MapContainer 
                          center={mapCenter} 
                          zoom={13} 
                          style={{ height: '100%', width: '100%' }}
                          scrollWheelZoom={true}
                       >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                          <ChangeMapCenter center={mapCenter} />
                          <MapEventsHandler onClick={(latlng) => reverseGeocode(latlng.lat, latlng.lng)} />
                          {schoolSettings?.latitude && schoolSettings?.longitude && (
                             <Marker 
                                position={[parseFloat(schoolSettings.latitude), parseFloat(schoolSettings.longitude)]} 
                                draggable={true}
                                eventHandlers={{
                                  dragend: (e) => {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    reverseGeocode(position.lat, position.lng);
                                  }
                                }}
                             />
                          )}
                          {schoolSettings?.latitude && schoolSettings?.longitude && (
                             <Circle 
                                center={[parseFloat(schoolSettings.latitude), parseFloat(schoolSettings.longitude)]} 
                                radius={parseInt(schoolSettings.radius_meters || 100)} 
                                pathOptions={{ fillColor: '#0ea5e9', fillOpacity: 0.15, color: '#0ea5e9', weight: 1, dashArray: '5, 5' }} 
                             />
                          )}
                       </MapContainer>
                       
                       <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000, display: 'flex', gap: 8 }}>
                          <button onClick={() => setMapCenter([parseFloat(schoolSettings.latitude), parseFloat(schoolSettings.longitude)])} disabled={!schoolSettings?.latitude || !schoolSettings?.longitude}
                             style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: 12, color: '#64748b', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                             <Crosshair size={14} /> Recenter
                          </button>
                       </div>
                    </div>

                    {/* Meta/Summary Side Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                       {/* Location Details Card */}
                       <div style={{ ...cardStyle }}>
                          <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Location</p>
                          {schoolSettings?.latitude ? (
                             <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                   <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#1e293b', lineHeight: 1.4 }}>{schoolSettings.location_name || 'Marked Point'}</p>
                                   <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{schoolSettings.address}</p>
                                </div>
                                <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                   <div>
                                      <p style={{ margin: 0, fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Source</p>
                                      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#0ea5e9' }}>{schoolSettings.location_source?.toUpperCase()}</p>
                                   </div>
                                   <div>
                                      <p style={{ margin: 0, fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Coordinates</p>
                                      <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>{parseFloat(schoolSettings.latitude).toFixed(4)}, {parseFloat(schoolSettings.longitude).toFixed(4)}</p>
                                   </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                   <button onClick={clearLocation} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                      <Trash2 size={12} /> Clear
                                   </button>
                                   <button onClick={() => setSearchResults([])} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                      <RotateCcw size={12} /> Reset
                                   </button>
                                </div>
                             </div>
                          ) : (
                             <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <MapPin size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
                                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>No location selected.<br/>Search or click on map.</p>
                             </div>
                          )}
                       </div>

                       {/* Radius Card */}
                       <div style={{ ...cardStyle }}>
                          <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Radius</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                             <input 
                                type="number" 
                                min="50" 
                                max="500"
                                value={schoolSettings?.radius_meters || 100}
                                onChange={(e) => setSchoolSettings({...schoolSettings, radius_meters: e.target.value})}
                                style={{ ...inputStyle, width: 90, textAlign: 'center', border: '1px solid #0ea5e9', color: '#0ea5e9' }}
                             />
                             <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Meters</span>
                          </div>
                          <input 
                             type="range" 
                             min="50" 
                             max="500" 
                             step="10"
                             value={schoolSettings?.radius_meters || 100}
                             onChange={(e) => setSchoolSettings({...schoolSettings, radius_meters: e.target.value})}
                             style={{ width: '100%', accentColor: '#0ea5e9', cursor: 'pointer', marginBottom: 12 }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>
                             <span>50m</span>
                             <span>500m</span>
                          </div>
                          <div style={{ marginTop: 16, background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
                             <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                                <Info size={12} color="#0ea5e9" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                Recommended: 50m to 100m for better attendance accuracy.
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 3. Bottom Actions Section */}
                 <div style={{ ...cardStyle, background: hasUnsavedChanges ? '#fffbeb' : '#fff', border: hasUnsavedChanges ? '1px solid #fde68a' : '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                          {hasUnsavedChanges ? (
                             <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b' }}>
                                <AlertTriangle size={18} />
                                <span style={{ fontSize: 13, fontWeight: 700 }}>You have unsaved changes</span>
                             </div>
                          ) : (
                             <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669' }}>
                                <CheckCircle size={18} />
                                <span style={{ fontSize: 13, fontWeight: 700 }}>Configuration is up to date</span>
                             </div>
                          )}
                       </div>
                       
                       <div style={{ display: 'flex', gap: 12 }}>
                          {hasUnsavedChanges && (
                             <button onClick={resetToSaved} style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                                Discard
                             </button>
                          )}
                          <button 
                             onClick={updateSchoolSettings}
                             disabled={submitting || !hasUnsavedChanges} 
                             style={{ 
                                padding: '12px 32px', borderRadius: 12, border: 'none', 
                                background: !hasUnsavedChanges ? '#f1f5f9' : '#0ea5e9', 
                                color: !hasUnsavedChanges ? '#94a3b8' : '#fff', 
                                fontWeight: 800, fontSize: 14, cursor: !hasUnsavedChanges || submitting ? 'default' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8,
                                boxShadow: !hasUnsavedChanges ? 'none' : '0 4px 14px rgba(14, 165, 233, 0.4)'
                             }}>
                             {submitting ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                             {submitting ? 'Saving...' : 'Save Configuration'}
                          </button>
                       </div>
                    </div>
                 </div>

              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* --- Edit Modal --- */}
      <AnimatePresence>
        {editRecord && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 500, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{editRecord.id ? 'Edit Record' : 'Manual Entry'}</h3>
                   <button onClick={() => setEditRecord(null)} style={{ border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: 10, cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <form onSubmit={updateAttendanceEntry} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                   {!editRecord.id && (
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Select teacher</label>
                        <select required value={editRecord.teacher} onChange={e => setEditRecord({...editRecord, teacher: e.target.value})} style={inputStyle}>
                           <option value="">Choose Staff...</option>
                           {teachers.map(t => <option key={t.id} value={t.id}>{t.user?.first_name} {t.user?.last_name}</option>)}
                        </select>
                      </div>
                   )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                       <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                             <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>In Time</label>
                             <div style={{ display: 'flex', gap: 2, background: '#f1f5f9', padding: 2, borderRadius: 8 }}>
                                <button type="button" onClick={() => setEditRecord({...editRecord, check_in: set24hTime(editRecord.check_in, 'AM')})}
                                  style={{ padding: '2px 8px', fontSize: 9, fontWeight: 800, border: 'none', cursor: 'pointer', borderRadius: 6, background: (parseInt(editRecord.check_in?.split(':')[0]) || 0) < 12 ? '#fff' : 'transparent', color: (parseInt(editRecord.check_in?.split(':')[0]) || 0) < 12 ? '#0ea5e9' : '#94a3b8' }}>AM</button>
                                <button type="button" onClick={() => setEditRecord({...editRecord, check_in: set24hTime(editRecord.check_in, 'PM')})}
                                  style={{ padding: '2px 8px', fontSize: 9, fontWeight: 800, border: 'none', cursor: 'pointer', borderRadius: 6, background: (parseInt(editRecord.check_in?.split(':')[0]) || 0) >= 12 ? '#fff' : 'transparent', color: (parseInt(editRecord.check_in?.split(':')[0]) || 0) >= 12 ? '#0ea5e9' : '#94a3b8' }}>PM</button>
                             </div>
                          </div>
                          <input type="time" value={editRecord.check_in ? (parseInt(editRecord.check_in.split(":")[0])%12 || 12).toString().padStart(2, '0') + ":" + editRecord.check_in.split(":")[1] : ''} 
                            onChange={e => {
                               const [h, m] = e.target.value.split(':');
                               const ampm = (parseInt(editRecord.check_in?.split(':')[0]) || 0) >= 12 ? 'PM' : 'AM';
                               setEditRecord({...editRecord, check_in: set24hTime(`${h}:${m}`, ampm)});
                            }} style={inputStyle} />
                       </div>
                       <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                             <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Out Time</label>
                             <div style={{ display: 'flex', gap: 2, background: '#f1f5f9', padding: 2, borderRadius: 8 }}>
                                <button type="button" onClick={() => setEditRecord({...editRecord, check_out: set24hTime(editRecord.check_out, 'AM')})}
                                  style={{ padding: '2px 8px', fontSize: 9, fontWeight: 800, border: 'none', cursor: 'pointer', borderRadius: 6, background: (parseInt(editRecord.check_out?.split(':')[0]) || 0) < 12 ? '#fff' : 'transparent', color: (parseInt(editRecord.check_out?.split(':')[0]) || 0) < 12 ? '#0ea5e9' : '#94a3b8' }}>AM</button>
                                <button type="button" onClick={() => setEditRecord({...editRecord, check_out: set24hTime(editRecord.check_out, 'PM')})}
                                  style={{ padding: '2px 8px', fontSize: 9, fontWeight: 800, border: 'none', cursor: 'pointer', borderRadius: 6, background: (parseInt(editRecord.check_out?.split(':')[0]) || 0) >= 12 ? '#fff' : 'transparent', color: (parseInt(editRecord.check_out?.split(':')[0]) || 0) >= 12 ? '#0ea5e9' : '#94a3b8' }}>PM</button>
                             </div>
                          </div>
                          <input type="time" value={editRecord.check_out ? (parseInt(editRecord.check_out.split(":")[0])%12 || 12).toString().padStart(2, '0') + ":" + editRecord.check_out.split(":")[1] : ''} 
                            onChange={e => {
                               const [h, m] = e.target.value.split(':');
                               const ampm = (parseInt(editRecord.check_out?.split(':')[0]) || 0) >= 12 ? 'PM' : 'AM';
                               setEditRecord({...editRecord, check_out: set24hTime(`${h}:${m}`, ampm)});
                            }} style={inputStyle} />
                       </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                       <div>
                          <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Attendance Status</label>
                          <select value={editRecord.status} onChange={e => setEditRecord({...editRecord, status: e.target.value})} style={inputStyle}>
                             {Object.entries(statusConfig).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                       </div>
                       <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
                          {editRecord.check_in_selfie && (
                             <div style={{ textAlign: 'center' }}>
                                <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 800, color: '#94a3b8' }}>IN SELFIE</p>
                                <img src={editRecord.check_in_selfie} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                             </div>
                          )}
                          {editRecord.check_out_selfie && (
                             <div style={{ textAlign: 'center' }}>
                                <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 800, color: '#94a3b8' }}>OUT SELFIE</p>
                                <img src={editRecord.check_out_selfie} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                             </div>
                          )}
                       </div>
                    </div>
                   <div>
                      <label style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Correction Reason</label>
                      <textarea required placeholder="Explain why this change is being made..." value={editRecord.notes || ''} onChange={e => setEditRecord({...editRecord, notes: e.target.value})} style={{ ...inputStyle, height: 80, resize: 'none' }} />
                   </div>
                   <button type="submit" disabled={submitting} style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '14px', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}>
                      {submitting ? 'Processing...' : 'Save Attendance'}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Request Process Modal --- */}
      <AnimatePresence>
        {selectedRequest && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 450, overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9' }}>
                   <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Confirm {selectedRequest.status}</h3>
                </div>
                <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                   <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                      You are about to <b>{selectedRequest.status}</b> the correction request from <b>{selectedRequest.teacher_name}</b>.
                   </p>
                   <div>
                      <label style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Admin Note (Optional)</label>
                      <textarea placeholder="Add a comment for the teacher..." value={selectedRequest.admin_note || ''} onChange={e => setSelectedRequest({...selectedRequest, admin_note: e.target.value})} style={{ ...inputStyle, height: 80, resize: 'none' }} />
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <button onClick={() => setSelectedRequest(null)} style={{ padding: '12px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={() => processRequest(selectedRequest.id, selectedRequest.status, selectedRequest.admin_note)} disabled={submitting}
                        style={{ padding: '12px', borderRadius: 14, border: 'none', background: selectedRequest.status === 'approved' ? '#10b981' : '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        Confirm Action
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTeacherAttendanceView;
