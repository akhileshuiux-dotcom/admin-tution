import { useState } from 'react';
import { FiX, FiDollarSign, FiUser, FiFileText, FiPrinter } from 'react-icons/fi';

const RecordCashModal = ({ isOpen, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        payerName: '',
        amount: '',
        serviceProvided: '',
        generateReceipt: true,
    });
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const validate = () => {
        const errs = {};
        if (!form.payerName.trim()) errs.payerName = 'Payer name is required';
        if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
        if (!form.serviceProvided.trim()) errs.serviceProvided = 'Service description is required';
        return errs;
    };

    const handleSubmit = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        const receiptId = 'RCP-' + Date.now().toString().slice(-6);
        const payload = {
            id: 'INC-' + Math.floor(Math.random() * 100000),
            studentName: form.payerName,
            planType: 'One-Time',
            amountReceived: Number(form.amount),
            paymentMode: 'Cash',
            serviceProvided: form.serviceProvided,
            verificationStatus: 'Verified',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
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
                        .verified-badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
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
                    <div class="row"><span class="label">Payment Mode</span><span class="value">💵 Cash</span></div>
                    <div class="row"><span class="label">Date</span><span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                    <div class="row"><span class="label">Status</span><span class="value"><span class="verified-badge">✓ Verified</span></span></div>
                    <div class="amount-row">
                        <div class="amount-label">AMOUNT RECEIVED</div>
                        <div class="amount-value">$${Number(form.amount).toLocaleString()}</div>
                    </div>
                    <div class="footer">Thank you for your payment. Please retain this receipt for your records.<br/>Guardian Tutoring Center</div>
                    <script>window.onload = function() { window.print(); }</script>
                </body>
                </html>
            `);
            win.document.close();
        }

        onSubmit(payload);
        setForm({ payerName: '', amount: '', serviceProvided: '', generateReceipt: true });
        setErrors({});
        onClose();
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', color: '#1e293b' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                            <FiDollarSign />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>Record Cash Payment</h2>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>All cash payments are instantly verified</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '20px' }}><FiX /></button>
                </div>

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            <FiUser style={{ marginRight: '6px', verticalAlign: 'middle' }} />Payer Name *
                        </label>
                        <input
                            className="form-input"
                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.payerName ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                            placeholder="e.g. Alex Johnson's Parent"
                            value={form.payerName}
                            onChange={e => setForm({ ...form, payerName: e.target.value })}
                        />
                        {errors.payerName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.payerName}</span>}
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
                            placeholder="e.g. 450"
                            value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                        />
                        {errors.amount && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.amount}</span>}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                            <FiFileText style={{ marginRight: '6px', verticalAlign: 'middle' }} />Service Provided *
                        </label>
                        <input
                            className="form-input"
                            style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: errors.serviceProvided ? '1px solid #ef4444' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
                            placeholder="e.g. Maths Tuition - Cycle 1"
                            value={form.serviceProvided}
                            onChange={e => setForm({ ...form, serviceProvided: e.target.value })}
                        />
                        {errors.serviceProvided && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.serviceProvided}</span>}
                    </div>

                    {/* Generate PDF Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiPrinter style={{ color: '#16a34a' }} />
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#166534' }}>Generate PDF Receipt</div>
                                <div style={{ fontSize: '0.75rem', color: '#4ade80' }}>Opens printable receipt in new tab</div>
                            </div>
                        </div>
                        <div
                            onClick={() => setForm({ ...form, generateReceipt: !form.generateReceipt })}
                            style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.generateReceipt ? '#16a34a' : '#cbd5e1', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
                        >
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: form.generateReceipt ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}>Cancel</button>
                    <button onClick={handleSubmit} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' }}>
                        💵 Record Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecordCashModal;
