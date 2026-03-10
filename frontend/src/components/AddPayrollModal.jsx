import { useState, useEffect } from 'react';
import { FiX, FiUser, FiDollarSign, FiCalendar, FiClock, FiPlus } from 'react-icons/fi';
import api from '../api';

const AddPayrollModal = ({ isOpen, onClose, onSubmit, onAddNewTutor }) => {
    const [tutors, setTutors] = useState([]);
    const [form, setForm] = useState({
        tutor: '',
        month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        baseSalary: '1000.00',
        hourlyRate: '45.00',
        hoursLogged: '0',
    });
    const [errors, setErrors] = useState({});
    const [loadingTutors, setLoadingTutors] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTutors();
        }
    }, [isOpen]);

    const fetchTutors = async () => {
        setLoadingTutors(true);
        try {
            const res = await api.get('/tutors/');
            setTutors(res.data);
        } catch (err) {
            console.error("Failed to fetch tutors for payroll:", err);
        } finally {
            setLoadingTutors(false);
        }
    };

    if (!isOpen) return null;

    const validate = () => {
        const errs = {};
        if (!form.tutor) errs.tutor = 'Please select a tutor';
        if (!form.month) errs.month = 'Month is required';
        if (!form.baseSalary || isNaN(Number(form.baseSalary))) errs.baseSalary = 'Valid base salary required';
        if (!form.hourlyRate || isNaN(Number(form.hourlyRate))) errs.hourlyRate = 'Valid hourly rate required';
        if (!form.hoursLogged || isNaN(Number(form.hoursLogged))) errs.hoursLogged = 'Valid hours required';
        return errs;
    };

    const handleSubmit = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        const selectedTutorObj = tutors.find(t => t.id.toString() === form.tutor.toString());

        const payload = {
            tutor: form.tutor,
            tutor_name: selectedTutorObj?.name || 'Unknown',
            month: form.month,
            base_salary: Number(form.baseSalary),
            hourly_rate: Number(form.hourlyRate),
            hours_logged: Number(form.hoursLogged),
            payment_status: 'Pending'
        };

        onSubmit(payload);
        setForm({
            tutor: '',
            month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            baseSalary: '1000.00',
            hourlyRate: '45.00',
            hoursLogged: '0',
        });
        setErrors({});
        onClose();
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', color: '#1e293b' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px' }}>
                            <FiPlus />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Log Tutor Payroll</h2>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Create a new payment record for a tutor</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '24px' }}><FiX /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Tutor Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            <FiUser style={{ marginRight: '6px', verticalAlign: 'middle' }} />Tutor Name *
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                className="form-input"
                                style={{ flex: 1, backgroundColor: '#f8fafc', color: '#1e293b', border: errors.tutor ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                value={form.tutor}
                                onChange={e => setForm({ ...form, tutor: e.target.value })}
                                disabled={loadingTutors}
                            >
                                <option value="">Select a Tutor</option>
                                {tutors.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '0 12px', minWidth: '42px', borderRadius: '10px' }}
                                onClick={onAddNewTutor}
                                title="Add New Tutor"
                            >
                                <FiPlus />
                            </button>
                        </div>
                        {errors.tutor && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.tutor}</span>}
                    </div>

                    {/* Month */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            <FiCalendar style={{ marginRight: '6px', verticalAlign: 'middle' }} />Payroll Month *
                        </label>
                        <input
                            className="form-input"
                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.month ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                            placeholder="e.g. March 2026"
                            value={form.month}
                            onChange={e => setForm({ ...form, month: e.target.value })}
                        />
                    </div>

                    {/* Salary Detail row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                <FiDollarSign style={{ marginRight: '6px', verticalAlign: 'middle' }} />Base Salary ($)
                            </label>
                            <input
                                className="form-input"
                                type="number"
                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                value={form.baseSalary}
                                onChange={e => setForm({ ...form, baseSalary: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                <FiDollarSign style={{ marginRight: '6px', verticalAlign: 'middle' }} />Hourly Rate ($)
                            </label>
                            <input
                                className="form-input"
                                type="number"
                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                value={form.hourlyRate}
                                onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Hours */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            <FiClock style={{ marginRight: '6px', verticalAlign: 'middle' }} />Hours Logged *
                        </label>
                        <input
                            className="form-input"
                            type="number"
                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.hoursLogged ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                            placeholder="0"
                            value={form.hoursLogged}
                            onChange={e => setForm({ ...form, hoursLogged: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}>Cancel</button>
                    <button onClick={handleSubmit} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 12px rgba(139,92,246,0.2)' }}>
                        Record Payroll
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPayrollModal;
