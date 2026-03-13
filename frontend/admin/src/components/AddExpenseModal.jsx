import { useState } from 'react';
import { FiX, FiTag, FiUser, FiDollarSign, FiCalendar, FiLink } from 'react-icons/fi';

const CATEGORIES = ['Tutor Salary', 'Rent', 'Utilities', 'Marketing', 'Software', 'Office Supplies', 'Other'];

const AddExpenseModal = ({ isOpen, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        category: '',
        payeeName: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        receiptUrl: '',
        notes: '',
    });
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const validate = () => {
        const errs = {};
        if (!form.category) errs.category = 'Please select a category';
        if (!form.payeeName.trim()) errs.payeeName = 'Payee name is required';
        if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
        if (!form.paymentDate) errs.paymentDate = 'Payment date is required';
        return errs;
    };

    const handleSubmit = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        const payload = {
            id: 'EXP-' + Math.floor(Math.random() * 100000),
            category: form.category,
            payeeName: form.payeeName,
            amount: Number(form.amount),
            paymentDate: form.paymentDate,
            receiptUrl: form.receiptUrl,
            notes: form.notes,
        };
        onSubmit(payload);
        setForm({ category: '', payeeName: '', amount: '', paymentDate: new Date().toISOString().split('T')[0], receiptUrl: '', notes: '' });
        setErrors({});
        onClose();
    };

    const CATEGORY_COLORS = {
        'Tutor Salary': '#8b5cf6', 'Rent': '#ef4444', 'Utilities': '#f59e0b',
        'Marketing': '#3b82f6', 'Software': '#06b6d4', 'Office Supplies': '#10b981', 'Other': '#94a3b8'
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', color: '#1e293b' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                            <FiTag />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>Log New Expense</h2>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Record a center operating cost</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '20px' }}><FiX /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Category */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            <FiTag style={{ marginRight: '6px', verticalAlign: 'middle' }} />Category *
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setForm({ ...form, category: cat })}
                                    style={{
                                        padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                                        border: form.category === cat ? `2px solid ${CATEGORY_COLORS[cat]}` : '2px solid #e2e8f0',
                                        background: form.category === cat ? `${CATEGORY_COLORS[cat]}15` : 'transparent',
                                        color: form.category === cat ? CATEGORY_COLORS[cat] : '#64748b',
                                        transition: 'all 0.15s'
                                    }}
                                >{cat}</button>
                            ))}
                        </div>
                        {errors.category && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.category}</span>}
                    </div>

                    {/* Payee Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            <FiUser style={{ marginRight: '6px', verticalAlign: 'middle' }} />Payee Name *
                        </label>
                        <input className="form-input" style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.payeeName ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                            placeholder="e.g. Dr. Emily Chen / ABC Properties" value={form.payeeName} onChange={e => setForm({ ...form, payeeName: e.target.value })} />
                        {errors.payeeName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.payeeName}</span>}
                    </div>

                    {/* Amount + Date side by side */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                <FiDollarSign style={{ marginRight: '6px', verticalAlign: 'middle' }} />Amount ($) *
                            </label>
                            <input className="form-input" type="number" min="0"
                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.amount ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                            {errors.amount && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.amount}</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                <FiCalendar style={{ marginRight: '6px', verticalAlign: 'middle' }} />Payment Date *
                            </label>
                            <input className="form-input" type="date"
                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.paymentDate ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} />
                        </div>
                    </div>

                    {/* Receipt URL */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            <FiLink style={{ marginRight: '6px', verticalAlign: 'middle' }} />Receipt Attachment URL <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <input className="form-input" type="url"
                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                            placeholder="https://drive.google.com/..." value={form.receiptUrl} onChange={e => setForm({ ...form, receiptUrl: e.target.value })} />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}>Cancel</button>
                    <button onClick={handleSubmit} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' }}>
                        Log Expense
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseModal;
