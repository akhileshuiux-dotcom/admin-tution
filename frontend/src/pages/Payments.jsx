import { useState, useMemo } from 'react';
import {
    FiDollarSign, FiTrendingUp, FiTrendingDown, FiActivity,
    FiCheckCircle, FiClock, FiPlus, FiDownload, FiEdit2,
    FiLink, FiPocket, FiX, FiCalendar, FiSave
} from 'react-icons/fi';
import './Payments.css';
import { useSearch } from '../context/SearchContext';
import RecordCashModal from '../components/RecordCashModal';
import AddExpenseModal from '../components/AddExpenseModal';
import { useIncome, useExpenses, usePayroll, useFinancialStats } from '../hooks/useFinance';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOM_DATA_FALLBACK = [
    { month: 'Nov', income: 8200, expenses: 4800 },
    { month: 'Dec', income: 9400, expenses: 5200 },
    { month: 'Jan', income: 7800, expenses: 4600 },
    { month: 'Feb', income: 10200, expenses: 5800 },
    { month: 'Mar', income: 11500, expenses: 6100 },
];

const CATEGORY_COLORS = {
    'Tutor Salary': '#8b5cf6', 'Rent': '#ef4444', 'Utilities': '#f59e0b',
    'Marketing': '#3b82f6', 'Software': '#06b6d4', 'Office Supplies': '#10b981', 'Other': '#94a3b8'
};
const CATEGORIES = ['Tutor Salary', 'Rent', 'Utilities', 'Marketing', 'Software', 'Office Supplies', 'Other'];
const MODE_COLORS = { 'Cash': '#10b981', 'Bank Transfer': '#3b82f6', 'Online': '#8b5cf6' };

// ─── Inline Edit Modal ───────────────────────────────────────────────────────

const EditModal = ({ title, fields, data, onSave, onClose }) => {
    const [form, setForm] = useState({ ...data });
    if (!data) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', color: '#1e293b' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}>
                            <FiEdit2 />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{title}</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '20px' }}><FiX /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {fields.map(f => (
                        <div key={f.key}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>{f.label}</label>
                            {f.type === 'select' ? (
                                <select
                                    className="form-input"
                                    style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                    value={form[f.key] ?? ''}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                >
                                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            ) : (
                                <input
                                    className="form-input"
                                    type={f.type || 'text'}
                                    style={{ width: '100%', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                                    value={form[f.key] ?? ''}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}>Cancel</button>
                    <button onClick={() => { onSave(form); onClose(); }} style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FiSave size={15} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const KPICard = ({ icon, label, value, sub, color, trend }) => (
    <div className="fin-kpi-card" style={{ borderTop: `3px solid ${color}` }}>
        <div className="fin-kpi-icon" style={{ background: `${color}18`, color }}>{icon}</div>
        <div className="fin-kpi-body">
            <div className="fin-kpi-label">{label}</div>
            <div className="fin-kpi-value">{value}</div>
            {sub && <div className="fin-kpi-sub">{sub}</div>}
        </div>
        {trend && <div className={`fin-kpi-trend ${trend > 0 ? 'up' : 'down'}`}>
            {trend > 0 ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
            {Math.abs(trend)}%
        </div>}
    </div>
);

const MoMChart = ({ data }) => {
    const maxVal = Math.max(...data.flatMap(d => [d.income, d.expenses]));
    return (
        <div className="mom-chart">
            {data.map((d, i) => (
                <div key={i} className="mom-bar-group">
                    <div className="mom-bars">
                        <div className="mom-bar income" style={{ height: `${(d.income / maxVal) * 140}px` }} title={`Income: $${d.income.toLocaleString()}`} />
                        <div className="mom-bar expense" style={{ height: `${(d.expenses / maxVal) * 140}px` }} title={`Expenses: $${d.expenses.toLocaleString()}`} />
                    </div>
                    <div className="mom-month">{d.month}</div>
                </div>
            ))}
        </div>
    );
};

// ─── Date Picker Filter Bar ──────────────────────────────────────────────────

const DateFilterBar = ({ dateFrom, dateTo, onFromChange, onToChange, onClear }) => (
    <div className="date-filter-bar">
        <FiCalendar size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
            type="date"
            className="form-input date-filter-input"
            value={dateFrom}
            onChange={e => onFromChange(e.target.value)}
            title="From date"
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>→</span>
        <input
            type="date"
            className="form-input date-filter-input"
            value={dateTo}
            onChange={e => onToChange(e.target.value)}
            title="To date"
        />
        {(dateFrom || dateTo) && (
            <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', fontSize: '14px' }} title="Clear date filter">
                <FiX size={14} />
            </button>
        )}
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const Payments = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { data: income, addIncome, updateIncome, loading: incomeLoading } = useIncome();
    const { data: expenses, addExpense, updateExpense, loading: expenseLoading } = useExpenses();
    const { data: payroll, updatePayroll, loading: payrollLoading } = usePayroll();
    const liveStats = useFinancialStats();

    const momData = liveStats.length > 0 ? liveStats : MOM_DATA_FALLBACK;

    // Modals
    const [isCashModalOpen, setIsCashModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [editingPayroll, setEditingPayroll] = useState(null);

    // Filters
    const [incomeFilter, setIncomeFilter] = useState({ mode: 'All', status: 'All' });
    const [expenseFilter, setExpenseFilter] = useState('All');
    const [incomeDateFrom, setIncomeDateFrom] = useState('');
    const [incomeDateTo, setIncomeDateTo] = useState('');
    const [expenseDateFrom, setExpenseDateFrom] = useState('');
    const [expenseDateTo, setExpenseDateTo] = useState('');
    const [payrollMonth, setPayrollMonth] = useState('');

    const { searchQuery } = useSearch();

    // ── KPI Calculations ──
    const totalIncome = useMemo(() => income.filter(i => i.verificationStatus === 'Verified').reduce((s, i) => s + i.amountReceived, 0), [income]);
    const cashOnHand = useMemo(() => income.filter(i => i.verificationStatus === 'Verified' && i.paymentMode === 'Cash').reduce((s, i) => s + i.amountReceived, 0), [income]);
    const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
    const pendingSalaries = useMemo(() => payroll.filter(p => p.paymentStatus === 'Pending').reduce((s, p) => s + p.baseSalary + (p.hourlyRate * p.hoursLogged), 0), [payroll]);
    const netBalance = totalIncome - totalExpenses;
    const calcPay = (p) => p.baseSalary + (p.hourlyRate * p.hoursLogged);

    // ── Date filter helper ──
    const inDateRange = (dateStr, from, to) => {
        if (!from && !to) return true;
        const d = dateStr ? new Date(dateStr) : null;
        if (!d) return true;
        if (from && d < new Date(from)) return false;
        if (to && d > new Date(to)) return false;
        return true;
    };

    // ── Handlers ──
    const handleCashSubmit = async (payload) => {
        try {
            await addIncome({
                ...payload,
                verificationStatus: 'Verified',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            console.error("Failed to add cash income:", err);
        }
    };

    const handleExpenseSubmit = async (payload) => {
        try {
            await addExpense(payload);
        } catch (err) {
            console.error("Failed to add expense:", err);
        }
    };

    const handleVerifyIncome = async (id) => {
        try {
            await updateIncome(id, { verificationStatus: 'Verified' });
        } catch (err) {
            console.error("Failed to verify income:", err);
        }
    };

    const handleMarkPaid = async (id) => {
        const entry = payroll.find(p => p.id === id);
        if (!entry) return;
        const amount = calcPay(entry);
        try {
            await updatePayroll(id, { paymentStatus: 'Paid', paidAt: new Date().toISOString() });
            await addExpense({
                category: 'Tutor Salary',
                payeeName: entry.tutorName,
                amount,
                paymentDate: new Date().toISOString().split('T')[0],
                receiptUrl: '',
            });
        } catch (err) {
            console.error("Failed to mark payroll as paid:", err);
        }
    };

    const handleSaveIncome = async (updated) => {
        try {
            await updateIncome(updated.id, updated);
        } catch (err) {
            console.error("Failed to save income:", err);
        }
    };
    const handleSaveExpense = async (updated) => {
        try {
            await updateExpense(updated.id, updated);
        } catch (err) {
            console.error("Failed to save expense:", err);
        }
    };
    const handleSavePayroll = async (updated) => {
        try {
            await updatePayroll(updated.id, updated);
        } catch (err) {
            console.error("Failed to save payroll:", err);
        }
    };

    // ── Filtered data ──
    const filteredIncome = income.filter(i => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || i.studentName?.toLowerCase().includes(q) || i.planType?.toLowerCase().includes(q) || i.id?.toLowerCase().includes(q) || i.receiptId?.toLowerCase().includes(q);
        const matchMode = incomeFilter.mode === 'All' || i.paymentMode === incomeFilter.mode;
        const matchStatus = incomeFilter.status === 'All' || i.verificationStatus === incomeFilter.status;
        const matchDate = inDateRange(i.date, incomeDateFrom, incomeDateTo);
        return matchSearch && matchMode && matchStatus && matchDate;
    });

    const filteredExpenses = expenses.filter(e => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || e.payeeName?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q) || e.id?.toLowerCase().includes(q);
        const matchCat = expenseFilter === 'All' || e.category === expenseFilter;
        const matchDate = inDateRange(e.paymentDate, expenseDateFrom, expenseDateTo);
        return matchSearch && matchCat && matchDate;
    });

    const filteredPayroll = payroll.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || p.tutorName?.toLowerCase().includes(q) || p.month?.toLowerCase().includes(q) || p.subjects?.toLowerCase().includes(q);
        const matchMonth = !payrollMonth || p.month.toLowerCase().includes(payrollMonth.toLowerCase());
        return matchSearch && matchMonth;
    });

    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard' },
        { id: 'income', label: '💰 Income Ledger' },
        { id: 'expenses', label: '📋 Expenses' },
        { id: 'payroll', label: '👩‍🏫 Tutor Payroll' },
    ];

    // ── Edit field definitions ──
    const incomeEditFields = [
        { key: 'studentName', label: 'Student / Payer Name' },
        { key: 'planType', label: 'Plan Type', type: 'select', options: ['Cycle 1', 'Cycle 2', 'Cycle 3', 'Admission Fee', 'One-Time'] },
        { key: 'amountReceived', label: 'Amount ($)', type: 'number' },
        { key: 'paymentMode', label: 'Payment Mode', type: 'select', options: ['Cash', 'Bank Transfer', 'Online'] },
        { key: 'verificationStatus', label: 'Status', type: 'select', options: ['Pending', 'Verified', 'Rejected'] },
        { key: 'date', label: 'Date', type: 'date' },
    ];
    const expenseEditFields = [
        { key: 'category', label: 'Category', type: 'select', options: CATEGORIES },
        { key: 'payeeName', label: 'Payee Name' },
        { key: 'amount', label: 'Amount ($)', type: 'number' },
        { key: 'paymentDate', label: 'Payment Date', type: 'date' },
        { key: 'receiptUrl', label: 'Receipt URL' },
    ];
    const payrollEditFields = [
        { key: 'tutorName', label: 'Tutor Name' },
        { key: 'month', label: 'Month (e.g. March 2026)' },
        { key: 'baseSalary', label: 'Base Salary ($)', type: 'number' },
        { key: 'hourlyRate', label: 'Hourly Rate ($/hr)', type: 'number' },
        { key: 'hoursLogged', label: 'Hours Logged', type: 'number' },
        { key: 'subjects', label: 'Subjects' },
    ];

    return (
        <div className="payments-page animate-fade-in">
            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: '0' }}>
                <div>
                    <h1 className="h1">Financial Management</h1>
                    <p className="text-muted">Complete financial overview — income, expenses &amp; payroll.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiDownload size={15} /> Export Report
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="fin-tabs">
                {tabs.map(t => (
                    <button key={t.id} className={`fin-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
                ))}
            </div>

            {/* ── TAB: DASHBOARD ─────────────────────────────────── */}
            {activeTab === 'dashboard' && (
                (incomeLoading || expenseLoading || payrollLoading) ? (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 20px' }} />
                        <p className="text-muted">Calculating financial dashboard...</p>
                    </div>
                ) : (
                    <div>
                        <div className="fin-kpi-grid">
                            <KPICard icon={<FiTrendingUp />} label="Total Revenue" value={`$${totalIncome.toLocaleString()}`} sub="Verified payments only" color="#10b981" trend={12} />
                            <KPICard icon={<FiTrendingDown />} label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} sub="All logged costs" color="#ef4444" trend={-5} />
                            <KPICard icon={<FiActivity />} label="Net Balance" value={`$${netBalance.toLocaleString()}`} sub={netBalance >= 0 ? 'Surplus' : 'Deficit'} color={netBalance >= 0 ? '#3b82f6' : '#f59e0b'} />
                            <KPICard icon={<FiClock />} label="Pending Salaries" value={`$${pendingSalaries.toLocaleString()}`} sub={`${payroll.filter(p => p.paymentStatus === 'Pending').length} tutors unpaid`} color="#8b5cf6" />
                        </div>

                        <div className="fin-dashboard-row">
                            <div className="glass-panel fin-chart-panel">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div>
                                        <h3 className="h3" style={{ margin: 0 }}>Month-over-Month</h3>
                                        <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Income vs Expenses trend</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981', display: 'inline-block' }} /> Income</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444', display: 'inline-block' }} /> Expenses</span>
                                    </div>
                                </div>
                                <MoMChart data={momData} />
                            </div>
                            <div className="glass-panel fin-cash-panel">
                                <h3 className="h3" style={{ marginBottom: '16px' }}>💵 Cash Breakdown</h3>
                                <div className="fin-cash-item"><span className="text-muted">Cash on Hand</span><span style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>${cashOnHand.toLocaleString()}</span></div>
                                <div className="fin-cash-item"><span className="text-muted">Bank / Online</span><span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '1.1rem' }}>${(totalIncome - cashOnHand).toLocaleString()}</span></div>
                                <div className="fin-cash-item" style={{ borderTop: '2px solid var(--border-color)', marginTop: '4px', paddingTop: '16px' }}>
                                    <span style={{ fontWeight: 600 }}>Total Verified Income</span>
                                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>${totalIncome.toLocaleString()}</span>
                                </div>
                                <div style={{ marginTop: '20px', background: '#fef9f0', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 600, marginBottom: '4px' }}>⚠ Pending Verification</div>
                                    <div style={{ fontSize: '0.85rem', color: '#b45309' }}>${income.filter(i => i.verificationStatus === 'Pending').reduce((s, i) => s + i.amountReceived, 0).toLocaleString()} awaiting review</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ marginTop: '20px' }}>
                            <h3 className="h3" style={{ marginBottom: '16px' }}>Recent Transactions</h3>
                            <table className="data-table">
                                <thead><tr><th>Receipt ID</th><th>Student / Payer</th><th>Plan</th><th>Amount</th><th>Mode</th><th>Date</th><th>Status</th></tr></thead>
                                <tbody>
                                    {income.slice(0, 5).map(i => (
                                        <tr key={i.id}>
                                            <td className="font-medium text-muted">{i.receiptId}</td>
                                            <td className="font-semibold">{i.studentName}</td>
                                            <td>{i.planType}</td>
                                            <td className="font-bold" style={{ color: '#10b981' }}>${i.amountReceived.toLocaleString()}</td>
                                            <td><span style={{ background: `${MODE_COLORS[i.paymentMode] || '#94a3b8'}18`, color: MODE_COLORS[i.paymentMode] || '#94a3b8', padding: '2px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>{i.paymentMode}</span></td>
                                            <td className="text-muted">{i.date}</td>
                                            <td><span className={`status-badge ${i.verificationStatus === 'Verified' ? 'status-badge-converted' : 'status-badge-draft'}`}>{i.verificationStatus}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}

            {/* ── TAB: INCOME LEDGER ─────────────────────────────── */}
            {activeTab === 'income' && (
                <div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <select className="form-input" value={incomeFilter.mode} onChange={e => setIncomeFilter(f => ({ ...f, mode: e.target.value }))} style={{ maxWidth: '160px', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                            <option value="All">All Modes</option>
                            <option value="Cash">💵 Cash</option>
                            <option value="Bank Transfer">🏦 Bank Transfer</option>
                            <option value="Online">💳 Online</option>
                        </select>
                        <select className="form-input" value={incomeFilter.status} onChange={e => setIncomeFilter(f => ({ ...f, status: e.target.value }))} style={{ maxWidth: '170px', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                            <option value="All">All Statuses</option>
                            <option value="Verified">✅ Verified</option>
                            <option value="Pending">⏳ Pending</option>
                            <option value="Rejected">❌ Rejected</option>
                        </select>
                        {/* Date Picker */}
                        <DateFilterBar
                            dateFrom={incomeDateFrom} dateTo={incomeDateTo}
                            onFromChange={setIncomeDateFrom} onToChange={setIncomeDateTo}
                            onClear={() => { setIncomeDateFrom(''); setIncomeDateTo(''); }}
                        />
                        <div style={{ marginLeft: 'auto', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                            Verified: <strong>${filteredIncome.filter(i => i.verificationStatus === 'Verified').reduce((s, i) => s + i.amountReceived, 0).toLocaleString()}</strong>
                        </div>
                    </div>

                    <div className="glass-panel table-container">
                        {incomeLoading ? (
                            <div style={{ padding: '80px', textAlign: 'center' }}>
                                <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 15px' }} />
                                <p className="text-muted">Loading income ledger...</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead><tr><th>Receipt ID</th><th>Student / Payer</th><th>Plan Type</th><th>Amount</th><th>Mode</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {filteredIncome.map(i => (
                                        <tr key={i.id}>
                                            <td className="font-medium text-muted">{i.receiptId || i.id}</td>
                                            <td className="font-semibold">{i.studentName}</td>
                                            <td>{i.planType}</td>
                                            <td className="font-bold" style={{ color: '#10b981' }}>${i.amountReceived.toLocaleString()}</td>
                                            <td><span style={{ background: `${MODE_COLORS[i.paymentMode] || '#94a3b8'}18`, color: MODE_COLORS[i.paymentMode] || '#94a3b8', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>{i.paymentMode}</span></td>
                                            <td className="text-muted">{i.date}</td>
                                            <td><span className={`status-badge ${i.verificationStatus === 'Verified' ? 'status-badge-converted' : i.verificationStatus === 'Rejected' ? 'status-badge-closed-red' : 'status-badge-draft'}`}>{i.verificationStatus}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    <button className="fin-edit-btn" onClick={() => setEditingIncome(i)} title="Edit">
                                                        <FiEdit2 size={13} />
                                                    </button>
                                                    {i.verificationStatus === 'Pending' && (
                                                        <button className="btn btn-primary btn-sm" style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleVerifyIncome(i.id)}>
                                                            <FiCheckCircle size={11} /> Verify
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredIncome.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No transactions match your filters.</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* ── TAB: EXPENSES ──────────────────────────────────── */}
            {activeTab === 'expenses' && (
                <div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <select className="form-input" value={expenseFilter} onChange={e => setExpenseFilter(e.target.value)} style={{ maxWidth: '190px', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {/* Date Picker */}
                        <DateFilterBar
                            dateFrom={expenseDateFrom} dateTo={expenseDateTo}
                            onFromChange={setExpenseDateFrom} onToChange={setExpenseDateTo}
                            onClear={() => { setExpenseDateFrom(''); setExpenseDateTo(''); }}
                        />
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>
                                Total: <strong>${filteredExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</strong>
                            </div>
                            <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsExpenseModalOpen(true)}>
                                <FiPlus size={15} /> Log Expense
                            </button>
                        </div>
                    </div>

                    {/* Category pills */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                            const catTotal = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
                            if (catTotal === 0) return null;
                            return <div key={cat} style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: '20px', padding: '6px 14px', fontSize: '0.8rem', color, fontWeight: 600 }}>{cat}: ${catTotal.toLocaleString()}</div>;
                        })}
                    </div>

                    <div className="glass-panel table-container">
                        {expenseLoading ? (
                            <div style={{ padding: '80px', textAlign: 'center' }}>
                                <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 15px' }} />
                                <p className="text-muted">Loading expense records...</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead><tr><th>ID</th><th>Category</th><th>Payee</th><th>Amount</th><th>Date</th><th>Receipt</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {filteredExpenses.map(e => (
                                        <tr key={e.id}>
                                            <td className="font-medium text-muted">{e.id}</td>
                                            <td><span style={{ background: `${CATEGORY_COLORS[e.category] || '#94a3b8'}18`, color: CATEGORY_COLORS[e.category] || '#94a3b8', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>{e.category}</span></td>
                                            <td className="font-semibold">{e.payeeName}</td>
                                            <td className="font-bold" style={{ color: '#ef4444' }}>${e.amount.toLocaleString()}</td>
                                            <td className="text-muted">{e.paymentDate}</td>
                                            <td>{e.receiptUrl ? <a href={e.receiptUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}><FiLink size={14} /> View</a> : <span className="text-muted">—</span>}</td>
                                            <td>
                                                <button className="fin-edit-btn" onClick={() => setEditingExpense(e)} title="Edit">
                                                    <FiEdit2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredExpenses.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No expenses match your filters.</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="glass-panel" style={{ marginTop: '20px' }}>
                        <h3 className="h3" style={{ marginBottom: '8px' }}>Month-over-Month Expense Comparison</h3>
                        <p className="text-muted" style={{ marginBottom: '16px', fontSize: '0.82rem' }}>Blue = Income &nbsp;|&nbsp; Red = Expenses</p>
                        <MoMChart data={momData} />
                    </div>
                </div>
            )}

            {/* ── TAB: TUTOR PAYROLL ────────────────────────────── */}
            {activeTab === 'payroll' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem', color: '#7c3aed', fontWeight: 600 }}>
                                Pending: <strong>${pendingSalaries.toLocaleString()}</strong>
                            </div>
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                                Paid This Month: <strong>${payroll.filter(p => p.paymentStatus === 'Paid' && p.month === 'February 2026').reduce((s, p) => s + calcPay(p), 0).toLocaleString()}</strong>
                            </div>
                            {/* Month selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '6px 12px' }}>
                                <FiCalendar size={13} style={{ color: 'var(--text-muted)' }} />
                                <select
                                    className="form-input"
                                    value={payrollMonth}
                                    onChange={e => setPayrollMonth(e.target.value)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                >
                                    <option value="">All Months</option>
                                    <option value="March 2026">March 2026</option>
                                    <option value="February 2026">February 2026</option>
                                    <option value="January 2026">January 2026</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel table-container">
                        {payrollLoading ? (
                            <div style={{ padding: '80px', textAlign: 'center' }}>
                                <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 15px' }} />
                                <p className="text-muted">Loading payroll data...</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Tutor</th><th>Month</th><th>Base Salary</th><th>Hourly Rate</th><th>Hours Logged</th>
                                        <th>Calculated Pay <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.75rem' }}>(base + rate×hrs)</span></th>
                                        <th>Status</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayroll.map(p => {
                                        const pay = calcPay(p);
                                        return (
                                            <tr key={p.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                                                            {p.tutorName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">{p.tutorName}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{p.subjects}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-muted">{p.month}</td>
                                                <td>${p.baseSalary.toLocaleString()}</td>
                                                <td>${p.hourlyRate}/hr</td>
                                                <td>{p.hoursLogged} hrs</td>
                                                <td>
                                                    <span style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '1.05rem' }}>${pay.toLocaleString()}</span>
                                                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block' }}>${p.baseSalary} + (${p.hourlyRate} × {p.hoursLogged})</span>
                                                </td>
                                                <td><span className={`status-badge ${p.paymentStatus === 'Paid' ? 'status-badge-converted' : 'status-badge-draft'}`}>{p.paymentStatus}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                        {p.paymentStatus === 'Pending' && (
                                                            <button className="fin-edit-btn" onClick={() => setEditingPayroll(p)} title="Edit">
                                                                <FiEdit2 size={13} />
                                                            </button>
                                                        )}
                                                        {p.paymentStatus === 'Pending' ? (
                                                            <button className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', borderColor: '#8b5cf6', fontSize: '0.75rem', whiteSpace: 'nowrap', padding: '4px 10px' }} onClick={() => handleMarkPaid(p.id)}>
                                                                <FiCheckCircle size={11} /> Mark as Paid
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>✓ Paid</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredPayroll.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payroll records found.</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* ── FAB: Cash Deal ────────────────────────────────── */}
            <button className="fin-fab animate-fade-in" onClick={() => setIsCashModalOpen(true)} title="Record Cash Payment">
                <FiPocket size={22} /><span>Cash Deal</span>
            </button>

            {/* Modals */}
            <RecordCashModal isOpen={isCashModalOpen} onClose={() => setIsCashModalOpen(false)} onSubmit={handleCashSubmit} />
            <AddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSubmit={handleExpenseSubmit} />

            {/* Inline Edit Modals */}
            {editingIncome && (
                <EditModal title="Edit Income Record" fields={incomeEditFields} data={editingIncome}
                    onSave={handleSaveIncome} onClose={() => setEditingIncome(null)} />
            )}
            {editingExpense && (
                <EditModal title="Edit Expense" fields={expenseEditFields} data={editingExpense}
                    onSave={handleSaveExpense} onClose={() => setEditingExpense(null)} />
            )}
            {editingPayroll && (
                <EditModal title="Edit Payroll Entry" fields={payrollEditFields} data={editingPayroll}
                    onSave={handleSavePayroll} onClose={() => setEditingPayroll(null)} />
            )}
        </div>
    );
};

export default Payments;
