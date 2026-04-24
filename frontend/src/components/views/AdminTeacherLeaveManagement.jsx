import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Calendar, CheckCircle, XCircle, Clock, Trash2, CalendarDays, Edit, BarChart } from 'lucide-react';
import api from '../../api';

const statusConfig = {
  pending: { label: 'Pending', bg: '#fffbeb', color: '#f59e0b', icon: Clock },
  approved: { label: 'Approved', bg: '#f0fdf4', color: '#059669', icon: CheckCircle },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#ef4444', icon: XCircle },
};

const AdminTeacherLeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'manual', 'types', 'holidays'
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  // Search state
  const [search, setSearch] = useState('');
  
  // Expanded rows state for analytics table
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (id) => setExpandedRows(prev => ({...prev, [id]: !prev[id]}));

  // Modals state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  // Form states
  const [manualForm, setManualForm] = useState({ teacher: '', leave_type: '', from_date: '', to_date: '', reason: '', attachment: null });
  const [allocationForm, setAllocationForm] = useState({ teacher: '', leave_type: '', allocated_days: '', notes: '' });
  const [typeForm, setTypeForm] = useState({ name: '', description: '', is_paid: false, max_allowed_days: '' });
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '', description: '' });
  
  const [submitting, setSubmitting] = useState(false);
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState('');
  const [allocationError, setAllocationError] = useState('');
  const [holidayError, setHolidayError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'requests' || activeTab === 'manual' || activeTab === 'assign_balance') {
        const [reqResp, typesResp, teachResp] = await Promise.all([
          api.get('/leave-requests/'),
          api.get('/leave-types/'),
          api.get('/teachers/')
        ]);
        setRequests(reqResp.data);
        setLeaveTypes(typesResp.data);
        setTeachers(teachResp.data);
      } else if (activeTab === 'analytics') {
        const [teachResp, analyticsResp] = await Promise.all([
          api.get('/teachers/'),
          api.get('/leave-requests/analytics/')
        ]);
        setTeachers(teachResp.data);
        setAnalytics(analyticsResp.data);
      } else if (activeTab === 'types') {
        const typesResp = await api.get('/leave-types/');
        setLeaveTypes(typesResp.data);
      } else if (activeTab === 'holidays') {
        const holResp = await api.get('/holidays/');
        setHolidays(holResp.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/leave-requests/${id}/approve/`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const [rejectError, setRejectError] = useState('');
  const submitReject = async () => {
    if (!rejectRemarks.trim()) { 
      setRejectError("Remarks are mandatory"); 
      return; 
    }
    try {
      await api.post(`/leave-requests/${rejectingId}/reject/`, { remarks: rejectRemarks });
      setShowRejectModal(false);
      setRejectRemarks('');
      setRejectingId(null);
      setRejectError('');
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!manualForm.teacher || !manualForm.leave_type || !manualForm.from_date || !manualForm.to_date || !manualForm.reason) {
      setError("Please fill all fields"); return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('teacher', manualForm.teacher);
      data.append('leave_type', manualForm.leave_type);
      data.append('from_date', manualForm.from_date);
      data.append('to_date', manualForm.to_date);
      data.append('reason', manualForm.reason);
      if (manualForm.attachment) {
        data.append('attachment', manualForm.attachment);
      }

      await api.post('/leave-requests/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setManualForm({ teacher: '', leave_type: '', from_date: '', to_date: '', reason: '', attachment: null });
      setActiveTab('requests');
    } catch (e) {
      setError(e.response?.data?.error || "Failed to add leave");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignBalance = async (e) => {
    e.preventDefault();
    setAllocationError('');
    if (!allocationForm.teacher || !allocationForm.leave_type || !allocationForm.allocated_days) {
      setAllocationError("Please fill all required fields"); return;
    }
    setAllocating(true);
    try {
      await api.post('/leave-allocations/', allocationForm);
      setAllocationForm({ teacher: '', leave_type: '', allocated_days: '', notes: '' });
      setActiveTab('analytics');
    } catch (e) {
      setAllocationError(e.response?.data?.error || "Failed to assign balance");
    } finally {
      setAllocating(false);
    }
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    if (!typeForm.name) return;
    try {
      await api.post('/leave-types/', {
        ...typeForm,
        max_allowed_days: typeForm.max_allowed_days ? parseInt(typeForm.max_allowed_days) : null
      });
      setTypeForm({ name: '', description: '', is_paid: false, max_allowed_days: '' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    setHolidayError('');
    if (!holidayForm.date || !holidayForm.name) {
      setHolidayError('Please provide both Date and Holiday Name');
      return;
    }
    try {
      await api.post('/holidays/', holidayForm);
      setHolidayForm({ date: '', name: '', description: '' });
      fetchData();
    } catch (e) { 
      console.error(e); 
      setHolidayError(e.response?.data?.error || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (window.confirm("Delete this holiday?")) {
      try {
        await api.delete(`/holidays/${id}/`);
        fetchData();
      } catch (e) { console.error(e); }
    }
  };

  const handleDeleteType = async (id) => {
      if (window.confirm("Delete this leave type?")) {
        try {
          await api.delete(`/leave-types/${id}/`);
          fetchData();
        } catch (e) { console.error(e); }
      }
  };

  const filteredRequests = requests.filter(r => 
    r.teacher_name?.toLowerCase().includes(search.toLowerCase()) || 
    r.leave_type_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0px 24px 24px' }}>
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, width: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>Reject Leave Request</h3>
            {rejectError && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{rejectError}</div>}
            <textarea 
              placeholder="Reason for rejection (mandatory)..."
              value={rejectRemarks} onChange={e => { setRejectRemarks(e.target.value); setRejectError(''); }}
              rows={4} style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', resize: 'none', outline: 'none', color: '#1e293b', background: '#fff' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowRejectModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitReject} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f8fafc', border: '1px solid #e2e8f0', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {[
          { key: 'requests', label: 'Leave Requests' },
          { key: 'manual', label: 'Assign Leave' },
          { key: 'assign_balance', label: 'Assign Leave Balance' },
          { key: 'analytics', label: 'Leave Reports & Analytics' },
          { key: 'types', label: 'Leave Types' },
          { key: 'holidays', label: 'Public Holidays' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: activeTab === t.key ? '#fff' : 'transparent', color: activeTab === t.key ? '#0ea5e9' : '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: activeTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* REQUESTS VIEW */}
        {activeTab === 'requests' && (
          <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative', width: 300 }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input type="text" placeholder="Search teacher or leave type..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none', fontSize: 13, color: '#1e293b', background: '#fff' }} />
            </div>

            {loading ? <p>Loading...</p> : (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Teacher</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Leave Type</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Dates (Days)</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Reason</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(r => {
                      const cfg = statusConfig[r.status] || statusConfig.pending;
                      const Icon = cfg.icon;
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600, fontSize: 14 }}>{r.teacher_name}</td>
                          <td style={{ padding: '12px 16px', color: '#475569', fontSize: 13 }}>{r.leave_type_name}</td>
                          <td style={{ padding: '12px 16px', color: '#475569', fontSize: 13 }}>{r.from_date} to {r.to_date} ({r.days})</td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>
                            {r.reason}
                            {r.attachment && (
                              <div style={{ marginTop: 4 }}>
                                <a href={r.attachment} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 11, textDecoration: 'none' }}>View Attachment</a>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                              <Icon size={12} /> {cfg.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                            {r.status === 'pending' && (
                              <>
                                <button onClick={() => handleApprove(r.id)} style={{ padding: '6px 12px', borderRadius: 6, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Approve</button>
                                <button onClick={() => { setRejectingId(r.id); setShowRejectModal(true); }} style={{ padding: '6px 12px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Reject</button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRequests.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No requests found</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* MANUAL LEAVE VIEW */}
        {activeTab === 'manual' && (
          <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ maxWidth: 600 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', color: '#1e293b', fontSize: 18, fontWeight: 700 }}>Directly Assign Approved Leave</h3>
              {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>{error}</div>}
              
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Select Teacher</label>
                  <select value={manualForm.teacher} onChange={e => setManualForm(f => ({...f, teacher: e.target.value}))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }}>
                    <option value="">Choose...</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.user.first_name} {t.user.last_name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Leave Type</label>
                  <select value={manualForm.leave_type} onChange={e => setManualForm(f => ({...f, leave_type: e.target.value}))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }}>
                    <option value="">Choose...</option>
                    {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>From Date</label>
                    <input type="date" value={manualForm.from_date} onChange={e => setManualForm(f => ({...f, from_date: e.target.value}))}
                      style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>To Date</label>
                    <input type="date" value={manualForm.to_date} onChange={e => setManualForm(f => ({...f, to_date: e.target.value}))}
                      style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Reason / Notes</label>
                  <textarea rows={3} value={manualForm.reason} onChange={e => setManualForm(f => ({...f, reason: e.target.value}))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', resize: 'none', color: '#1e293b', background: '#fff' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Attachment (Optional)</label>
                  <input type="file" onChange={e => setManualForm(f => ({...f, attachment: e.target.files[0]}))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }} />
                </div>
                <button type="submit" disabled={submitting} style={{ padding: '12px', borderRadius: 8, background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                  {submitting ? 'Assigning...' : 'Assign Leave'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ASSIGN BALANCE VIEW */}
        {activeTab === 'assign_balance' && (
          <motion.div key="assign_balance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ maxWidth: 600 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', color: '#1e293b', fontSize: 18, fontWeight: 700 }}>Assign Leave Balance</h3>
              {allocationError && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>{allocationError}</div>}
              
              <form onSubmit={handleAssignBalance} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Select Teacher</label>
                  <select value={allocationForm.teacher} onChange={e => setAllocationForm(f => ({...f, teacher: e.target.value}))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }}>
                    <option value="">Choose...</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.user.first_name} {t.user.last_name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Leave Type</label>
                  <select value={allocationForm.leave_type} onChange={e => setAllocationForm(f => ({...f, leave_type: e.target.value}))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }}>
                    <option value="">Choose...</option>
                    {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Allocated Days</label>
                  <input type="number" placeholder="e.g. 10" value={allocationForm.allocated_days} onChange={e => setAllocationForm(f => ({...f, allocated_days: e.target.value}))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Notes (Optional)</label>
                  <textarea rows={2} value={allocationForm.notes} onChange={e => setAllocationForm(f => ({...f, notes: e.target.value}))}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', resize: 'none', color: '#1e293b', background: '#fff' }} />
                </div>
                <button type="submit" disabled={allocating} style={{ padding: '12px', borderRadius: 8, background: '#14b8a6', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                  {allocating ? 'Saving...' : 'Save Allocation'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ANALYTICS VIEW */}
        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ position: 'relative', width: 300 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input type="text" placeholder="Search teacher..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none', fontSize: 13, color: '#1e293b', background: '#fff' }} />
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Teacher</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Leave Balances</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total Balance</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Pending Requests</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, width: 80, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.filter(a => a.teacher_name?.toLowerCase().includes(search.toLowerCase())).map(a => (
                    <React.Fragment key={a.teacher_id}>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', background: expandedRows[a.teacher_id] ? '#f8fafc' : '#fff' }}>
                        <td style={{ padding: '16px', color: '#1e293b', fontWeight: 700, fontSize: 14 }}>
                          {a.teacher_name}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {a.breakdown.map(b => (
                              <div key={b.leave_type_id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
                                <span style={{ color: '#64748b', fontWeight: 600 }}>{b.leave_type_name}:</span>
                                <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{b.balance}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '16px', color: '#10b981', fontWeight: 800, fontSize: 15 }}>
                          {a.balance}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {a.pending_leaves > 0 ? (
                            <span style={{ background: '#fffbeb', color: '#f59e0b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                              {a.pending_leaves} Pending
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>0</span>
                          )}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <button 
                            onClick={() => toggleRow(a.teacher_id)}
                            style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            {expandedRows[a.teacher_id] ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      {expandedRows[a.teacher_id] && (
                        <tr>
                          <td colSpan={5} style={{ padding: 0 }}>
                            <div style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                              <h5 style={{ margin: '0 0 12px', color: '#475569', fontSize: 13, textTransform: 'uppercase' }}>Detailed Breakdown</h5>
                              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                <thead style={{ background: '#f1f5f9', fontSize: 12, color: '#64748b' }}>
                                  <tr>
                                    <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'left' }}>Leave Type</th>
                                    <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'left' }}>Allocated</th>
                                    <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'left' }}>Used</th>
                                    <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'left' }}>Balance</th>
                                    <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'left' }}>Pending</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {a.breakdown.map(b => (
                                    <tr key={b.leave_type_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                      <td style={{ padding: '10px 16px', color: '#334155', fontWeight: 600, fontSize: 13 }}>{b.leave_type_name}</td>
                                      <td style={{ padding: '10px 16px', color: '#3b82f6', fontWeight: 600, fontSize: 13 }}>{b.allocated}</td>
                                      <td style={{ padding: '10px 16px', color: '#64748b', fontWeight: 600, fontSize: 13 }}>{b.used}</td>
                                      <td style={{ padding: '10px 16px', color: '#10b981', fontWeight: 700, fontSize: 13 }}>{b.balance}</td>
                                      <td style={{ padding: '10px 16px', color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>{b.pending}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {analytics.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No analytics data found</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* LEAVE TYPES VIEW */}
        {activeTab === 'types' && (
          <motion.div key="types" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12, color: '#64748b' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Leave Type</th>
                    <th style={{ padding: '12px 16px' }}>Description</th>
                    <th style={{ padding: '12px 16px' }}>Details</th>
                    <th style={{ padding: '12px 16px', width: 60 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveTypes.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{t.name}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{t.description || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12 }}>
                        <span style={{ display: 'block', color: t.is_paid ? '#059669' : '#f59e0b', fontWeight: 700 }}>{t.is_paid ? 'Paid' : 'Unpaid'}</span>
                        {t.max_allowed_days && <span style={{ color: '#64748b' }}>Max: {t.max_allowed_days} days</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleDeleteType(t.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ width: 320, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
              <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Add New Type</h4>
              <form onSubmit={handleAddType} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input placeholder="Type Name (e.g. Sick Leave)" value={typeForm.name} onChange={e => setTypeForm(f => ({...f, name: e.target.value}))}
                  style={{ padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }} />
                <textarea placeholder="Description (Optional)" value={typeForm.description} onChange={e => setTypeForm(f => ({...f, description: e.target.value}))} rows={2}
                  style={{ padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', resize: 'none', color: '#1e293b', background: '#fff' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="is_paid" checked={typeForm.is_paid} onChange={e => setTypeForm(f => ({...f, is_paid: e.target.checked}))} />
                  <label htmlFor="is_paid" style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>Is Paid Leave?</label>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Max Allowed Days (Optional)</label>
                  <input type="number" placeholder="e.g. 10" value={typeForm.max_allowed_days} onChange={e => setTypeForm(f => ({...f, max_allowed_days: e.target.value}))}
                    style={{ padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }} />
                </div>
                
                <button type="submit" style={{ padding: '10px', borderRadius: 8, background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>Add Type</button>
              </form>
            </div>
          </motion.div>
        )}

        {/* PUBLIC HOLIDAYS VIEW */}
        {activeTab === 'holidays' && (
          <motion.div key="holidays" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12, color: '#64748b' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Holiday Name</th>
                    <th style={{ padding: '12px 16px' }}>Description</th>
                    <th style={{ padding: '12px 16px', width: 60 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{h.date}</td>
                      <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500, fontSize: 14 }}>{h.name}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{h.description || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleDeleteHoliday(h.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {holidays.length === 0 && <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No holidays added.</td></tr>}
                </tbody>
              </table>
            </div>

            <div style={{ width: 320, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
              <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Add Holiday</h4>
              {holidayError && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{holidayError}</div>}
              <form onSubmit={handleAddHoliday} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input type="date" value={holidayForm.date} onChange={e => setHolidayForm(f => ({...f, date: e.target.value}))}
                  style={{ padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }} />
                <input placeholder="Holiday Name" value={holidayForm.name} onChange={e => setHolidayForm(f => ({...f, name: e.target.value}))}
                  style={{ padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', color: '#1e293b', background: '#fff' }} />
                <textarea placeholder="Description (Optional)" value={holidayForm.description} onChange={e => setHolidayForm(f => ({...f, description: e.target.value}))} rows={3}
                  style={{ padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', resize: 'none', color: '#1e293b', background: '#fff' }} />
                <button type="submit" style={{ padding: '10px', borderRadius: 8, background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Add Holiday</button>
              </form>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default AdminTeacherLeaveManagement;
