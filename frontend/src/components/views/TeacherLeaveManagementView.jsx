import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Clock, CheckCircle, XCircle, FileText, Trash2, CalendarDays, AlertCircle } from 'lucide-react';
import api from '../../api';

const statusConfig = {
  pending: { label: 'Pending', bg: '#fffbeb', color: '#f59e0b', icon: Clock },
  approved: { label: 'Approved', bg: '#f0fdf4', color: '#059669', icon: CheckCircle },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#ef4444', icon: XCircle },
};

const TeacherLeaveManagementView = ({ user }) => {
  const [activeTab, setActiveTab] = useState('history'); // 'history', 'apply', 'holidays'
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
    attachment: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [conflictWarning, setConflictWarning] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'apply' || activeTab === 'history') {
        const [typesResp, reqResp, analyticsResp] = await Promise.all([
          api.get('/leave-types/'),
          api.get('/leave-requests/'),
          api.get('/leave-requests/analytics/')
        ]);
        setLeaveTypes(typesResp.data);
        setLeaveRequests(reqResp.data);
        if (analyticsResp.data && analyticsResp.data.length > 0) {
          setAnalytics(analyticsResp.data[0]);
        }
      }
      if (activeTab === 'holidays') {
        const holResp = await api.get('/holidays/');
        setHolidays(holResp.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!formData.leave_type || !formData.from_date || !formData.to_date || !formData.reason) {
      setError('Please fill all fields');
      return;
    }
    if (new Date(formData.from_date) > new Date(formData.to_date)) {
      setError('To Date must be after From Date');
      return;
    }
    
    // Simple overlap check
    const isOverlap = leaveRequests.some(r => {
      if (r.status === 'rejected') return false;
      const f1 = new Date(r.from_date);
      const t1 = new Date(r.to_date);
      const f2 = new Date(formData.from_date);
      const t2 = new Date(formData.to_date);
      return Math.max(f1, f2) <= Math.min(t1, t2);
    });
    if (isOverlap) {
      setError('Dates overlap with an existing leave request.');
      return;
    }

    // Check for conflicts
    try {
      const conflictResp = await api.post('/leave-requests/check_conflicts/', {
        teacher_id: user.id, // Assuming teacher profile ID is accessible, or endpoint can use request.user.
        from_date: formData.from_date,
        to_date: formData.to_date
      });
      if (conflictResp.data.has_conflict && !conflictWarning) {
        setConflictWarning(conflictResp.data.message + " Please confirm you still want to submit.");
        return;
      }
    } catch (e) {
      console.error("Conflict check failed", e);
    }

    setSubmitting(true);
    setError('');
    
    try {
      const data = new FormData();
      data.append('leave_type', formData.leave_type);
      data.append('from_date', formData.from_date);
      data.append('to_date', formData.to_date);
      data.append('reason', formData.reason);
      if (formData.attachment) {
        data.append('attachment', formData.attachment);
      }

      await api.post('/leave-requests/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ leave_type: '', from_date: '', to_date: '', reason: '', attachment: null });
      setConflictWarning('');
      setActiveTab('history');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to submit leave request');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this leave request?")) {
      try {
        await api.post(`/leave-requests/${id}/cancel/`);
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#e2e8f0', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {[
          { key: 'history', label: 'My Leaves', icon: FileText },
          { key: 'apply', label: 'Apply for Leave', icon: Plus },
          { key: 'holidays', label: 'Public Holidays', icon: CalendarDays },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, border: 'none', background: activeTab === t.key ? '#fff' : 'transparent', color: activeTab === t.key ? '#0d9488' : '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: activeTab === t.key ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {analytics && analytics.breakdown && analytics.breakdown.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 8 }}>
                {analytics.breakdown.map((b, idx) => (
                  <div key={b.leave_type_id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ margin: 0, color: '#1e293b', fontSize: 15, fontWeight: 700 }}>{b.leave_type_name}</h4>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: b.is_paid ? '#ecfdf5' : '#fffbeb', color: b.is_paid ? '#059669' : '#d97706' }}>
                        {b.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, textAlign: 'center' }}>
                      <div style={{ flex: 1, background: '#f8fafc', padding: 8, borderRadius: 8 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Allocated</p>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#3b82f6' }}>{b.allocated}</p>
                      </div>
                      <div style={{ flex: 1, background: '#f8fafc', padding: 8, borderRadius: 8 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Used</p>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#10b981' }}>{b.used}</p>
                      </div>
                      <div style={{ flex: 1, background: '#f8fafc', padding: 8, borderRadius: 8 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Balance</p>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#6366f1' }}>{b.balance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Loading...</p>
            ) : leaveRequests.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                No leave requests found. Apply for one!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {leaveRequests.map((req, i) => {
                  const cfg = statusConfig[req.status] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={req.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p style={{ color: '#1e293b', fontWeight: 700, fontSize: 15, margin: 0 }}>{req.leave_type_name}</p>
                          <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0' }}>{req.from_date} to {req.to_date} • {req.days} Day(s)</p>
                          {req.reason && <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0', fontStyle: 'italic' }}>Reason: {req.reason}</p>}
                          {req.admin_remarks && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0', fontWeight: 600 }}>Remarks: {req.admin_remarks}</p>}
                          {req.attachment && <a href={req.attachment} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 6, fontSize: 12, fontWeight: 700, color: '#0ea5e9', textDecoration: 'none' }}>View Attachment</a>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>
                          <StatusIcon size={14} /> {cfg.label}
                        </span>
                        {req.status === 'pending' && (
                          <button onClick={() => handleCancel(req.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                            <Trash2 size={14} /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'apply' && (
          <motion.div key="apply" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', maxWidth: 600 }}>
              <h3 style={{ margin: '0 0 20px', color: '#1e293b', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={20} color="#0d9488" /> Apply for Leave
              </h3>

              {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>{error}</div>}

              <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Leave Type</label>
                  <select 
                    value={formData.leave_type} 
                    onChange={e => setFormData(f => ({ ...f, leave_type: e.target.value }))}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#1e293b' }}
                  >
                    <option value="">Select a type...</option>
                    {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>From Date</label>
                    <input type="date" value={formData.from_date} onChange={e => setFormData(f => ({ ...f, from_date: e.target.value }))}
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#1e293b' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>To Date</label>
                    <input type="date" value={formData.to_date} onChange={e => setFormData(f => ({ ...f, to_date: e.target.value }))}
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#1e293b' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Reason</label>
                  <textarea 
                    rows={4}
                    value={formData.reason} 
                    onChange={e => setFormData(f => ({ ...f, reason: e.target.value }))}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', resize: 'none', color: '#1e293b' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Attachment (Optional)</label>
                  <input type="file" onChange={e => setFormData(f => ({ ...f, attachment: e.target.files[0] }))}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#1e293b' }} />
                </div>

                {conflictWarning && (
                  <div style={{ background: '#fffbeb', color: '#b45309', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid #fde68a', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ margin: 0 }}>{conflictWarning}</p>
                  </div>
                )}

                <button type="submit" disabled={submitting}
                  style={{ marginTop: 10, padding: '12px 20px', background: conflictWarning ? '#f59e0b' : '#0d9488', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {submitting ? 'Submitting...' : conflictWarning ? 'Confirm & Submit' : 'Submit Request'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'holidays' && (
          <motion.div key="holidays" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Loading holidays...</p>
            ) : holidays.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                No upcoming public holidays found.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {holidays.map(hol => (
                  <div key={hol.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{new Date(hol.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                      <span style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{new Date(hol.date).getDate()}</span>
                    </div>
                    <div>
                      <h4 style={{ color: '#1e293b', fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>{hol.name}</h4>
                      <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.4 }}>{hol.description || 'Public Holiday'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherLeaveManagementView;
