import { useState } from 'react';
import { FiX, FiDollarSign, FiUser, FiFileText, FiPrinter, FiCalendar, FiCreditCard, FiPlus } from 'react-icons/fi';

const AddIncomeModal = ({ isOpen, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        payerName: '',
        amount: '',
        paymentMode: 'Bank Transfer',
        planType: 'Cycle 1',
        serviceProvided: '',
        date: new Date().toISOString().split('T')[0],
        generateReceipt: true,
    });
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const validate = () => {
        const errs = {};
        if (!form.payerName.trim()) errs.payerName = 'Payer name is required';
        if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
        if (!form.serviceProvided.trim()) errs.serviceProvided = 'Service description is required';
        if (!form.date) errs.date = 'Date is required';
        return errs;
    };

    const handleSubmit = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        const receiptId = 'RCP-' + Date.now().toString().slice(-6);
        const payload = {
            studentName: form.payerName,
            planType: form.planType,
            amountReceived: Number(form.amount),
            paymentMode: form.paymentMode,
            serviceProvided: form.serviceProvided,
            verificationStatus: form.paymentMode === 'Cash' ? 'Verified' : 'Pending',
            date: form.date,
            receiptId,
        };

        if (form.generateReceipt) {
            const win = window.open('', '_blank', 'width=500,height=600');
            win.document.write(`
                <html>
                <head>
                    <title>Receipt ${receiptId}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
                        .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
                        .subtitle { color: #64748b; font-size: 13px; }
                        .receipt-id { background: #f0f7ff; border-radius: 6px; padding: 8px 16px; display: inline-block; font-weight: 600; color: #2563eb; margin-bottom: 24px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
                        .label { color: #64748b; font-size: 13px; }
                        .value { font-weight: 600; font-size: 14px; }
                        .amount-row { background: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0; }
                        .amount-label { color: #64748b; font-size: 12px; margin-bottom: 4px; }
                        .amount-value { font-size: 32px; font-weight: 800; color: #16a34a; }
                        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px; }
                        .status-badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
                        .pending-badge { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">GT Guardian Tutoring</div>
                        <div class="subtitle">Official Payment Receipt</div>
                    </div>
                    <div style="text-align:center">
                        <div class="receipt-id">${receiptId}</div>
                    </div>
                    <div class="row"><span class="label">Payer Name</span><span class="value">${form.payerName}</span></div>
                    <div class="row"><span class="label">Service Provided</span><span class="value">${form.serviceProvided}</span></div>
                    <div class="row"><span class="label">Plan Type</span><span class="value">${form.planType}</span></div>
                    <div class="row"><span class="label">Payment Mode</span><span class="value">${form.paymentMode}</span></div>
                    <div class="row"><span class="label">Date</span><span class="value">${new Date(form.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                    <div class="row">
                        <span class="label">Status</span>
                        <span class="value">
                            ${payload.verificationStatus === 'Verified' ? '<span class="status-badge">✓ Verified</span>' : '<span class="pending-badge">⏳ Pending Verification</span>'}
                        </span>
                    </div>
                    <div class="amount-row">
                        <div class="amount-label">AMOUNT RECEIVED</div>
                        <div class="amount-value">$${Number(form.amount).toLocaleString()}</div>
                    </div>
                    <div class="footer">Thank you for your payment. This is a computer-generated receipt.<br/>Guardian Tutoring Center</div>
                    <script>window.onload = function() { window.print(); }</script>
                </body>
                </html>
            `);
            win.document.close();
        }

        onSubmit(payload);
        setForm({
            payerName: '',
            amount: '',
            paymentMode: 'Bank Transfer',
            planType: 'Cycle 1',
            serviceProvided: '',
            date: new Date().toISOString().split('T')[0],
            generateReceipt: true,
        });
        setErrors({});
        onClose();
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', color: '#1e293b' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px' }}>
                            <FiPlus />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Record New Income</h2>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Log tuition fees, admission costs, or other revenue</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '24px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#1e293b'} onMouseLeave={e => e.target.style.color = '#94a3b8'}><FiX /></button>
                </div>

                {/* Form Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                <FiUser style={{ marginRight: '6px', verticalAlign: 'middle' }} />Payer Name *
                            </label>
                            <input
                                className="form-input"
                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.payerName ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                placeholder="e.g. John Doe's Parent"
                                value={form.payerName}
                                onChange={e => setForm({ ...form, payerName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                <FiDollarSign style={{ marginRight: '6px', verticalAlign: 'middle' }} />Amount ($) *
                            </label>
                            <input
                                className="form-input"
                                type="number"
                                min="0"
                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.amount ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                placeholder="0.00"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                <FiCreditCard style={{ marginRight: '6px', verticalAlign: 'middle' }} />Payment Mode
                            </label>
                            <select
                                className="form-input"
                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                value={form.paymentMode}
                                onChange={e => setForm({ ...form, paymentMode: e.target.value })}
                            >
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Online">Online</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                <FiFileText style={{ marginRight: '6px', verticalAlign: 'middle' }} />Plan Type
                            </label>
                            <select
                                className="form-input"
                                style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                value={form.planType}
                                onChange={e => setForm({ ...form, planType: e.target.value })}
                            >
                                <option value="Cycle 1">Cycle 1</option>
                                <option value="Cycle 2">Cycle 2</option>
                                <option value="Cycle 3">Cycle 3</option>
                                <option value="Admission Fee">Admission Fee</option>
                                <option value="One-Time">One-Time</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            <FiFileText style={{ marginRight: '6px', verticalAlign: 'middle' }} />Service Provided *
                        </label>
                        <input
                            className="form-input"
                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.serviceProvided ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                            placeholder="e.g. Maths Tuition Jan Payment"
                            value={form.serviceProvided}
                            onChange={e => setForm({ ...form, serviceProvided: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            <FiCalendar style={{ marginRight: '6px', verticalAlign: 'middle' }} />Payment Date *
                        </label>
                        <input
                            className="form-input"
                            type="date"
                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.date ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                        />
                    </div>

                    {/* Generate PDF Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0f7ff', border: '1px solid #e0f2fe', borderRadius: '16px', padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <FiPrinter />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e40af' }}>Generate PDF Receipt</div>
                                <div style={{ fontSize: '0.75rem', color: '#60a5fa' }}>Instant printable summary</div>
                            </div>
                        </div>
                        <div
                            onClick={() => setForm({ ...form, generateReceipt: !form.generateReceipt })}
                            style={{ width: '48px', height: '26px', borderRadius: '13px', background: form.generateReceipt ? '#3b82f6' : '#cbd5e1', cursor: 'pointer', position: 'relative', transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        >
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: form.generateReceipt ? '25px' : '3px', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background = '#f8fafc'} onMouseLeave={e => e.target.style.background = 'white'}>Cancel</button>
                    <button onClick={handleSubmit} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 16px rgba(37,99,235,0.3)'; }} onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(37,99,235,0.2)'; }}>
                        Record Transaction
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddIncomeModal;
