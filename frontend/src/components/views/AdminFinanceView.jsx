import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownRight, Calendar, X, Trash2,
  FileText, Percent, Settings, Download, AlertCircle, CheckCircle,
  TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';
import api from '../../api';

const StatCard = ({ title, amount, icon: Icon, color }) => (
  <div style={{ background: '#fff', padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', flex: 1, minWidth: 240, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 16, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={color} />
      </div>
    </div>
    <p style={{ color: '#64748b', fontSize: 13, fontWeight: 600, margin: '0 0 4px 0' }}>{title}</p>
    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 }}>${(amount || 0).toLocaleString()}</h2>
  </div>
);

const AdminFinanceView = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [payments, setPayments] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeTiers, setFeeTiers] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('payment');
  const [form, setForm] = useState({ 
    amount: '', date: new Date().toISOString().split('T')[0], 
    student: '', month: '', title: '', percentage: '', reason: '' 
  });

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [defaultersCount, setDefaultersCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const inc = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const exp = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const sal = salaries.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    setTotalIncome(inc);
    setTotalExpense(exp + sal);
    setNetProfit(inc - (exp + sal));
    setDefaultersCount(invoices.filter(i => i.status === 'Overdue').length);
  }, [payments, expenses, salaries, invoices]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, i, ex, s, ft, d, sal] = await Promise.all([
        api.get('/payments/'),
        api.get('/invoices/'),
        api.get('/expenses/'),
        api.get('/students/'),
        api.get('/feetiars/'),
        api.get('/student-discounts/'),
        api.get('/teacher-salaries/')
      ]);
      setPayments(p.data);
      setInvoices(i.data);
      setExpenses(ex.data);
      setStudents(s.data);
      setFeeTiers(ft.data);
      setDiscounts(d.data);
      setSalaries(sal.data);
    } catch (e) {
      console.error("Failed to fetch finance data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      let url = '';
      let payload = { ...form };
      
      switch(modalType) {
        case 'payment': url = '/payments/'; break;
        case 'expense': url = '/expenses/'; break;
        case 'fee-tier': url = '/feetiars/'; break;
        case 'discount': url = '/student-discounts/'; break;
        case 'generate-invoice':
          await api.post('/invoices/generate_monthly/', { month: form.month });
          setShowModal(false);
          fetchData();
          return;
      }

      await api.post(url, payload);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to save record");
      console.error(err);
    }
  };

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0] || {}).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Establishing secure financial link...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px' }}>
      {/* Header Stats */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <StatCard title="Total Income" amount={totalIncome} icon={TrendingUp} color="#059669" />
        <StatCard title="Total Expenses" amount={totalExpense} icon={TrendingDown} color="#ef4444" />
        <StatCard title="Net Profit" amount={netProfit} icon={DollarSign} color="#6366f1" />
        <StatCard title="Active Defaulters" amount={defaultersCount} icon={AlertCircle} color="#f59e0b" />
      </div>

      <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        {/* Tabs Header */}
        <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0 12px', overflowX: 'auto' }}>
          {['summary', 'payments', 'invoices', 'salaries', 'expenses', 'fees', 'discounts'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{ padding: '16px 20px', border: 'none', background: 'none', fontSize: 13, fontWeight: activeTab === t ? 800 : 500, color: activeTab === t ? '#1e293b' : '#64748b', borderBottom: activeTab === t ? '2px solid #1e293b' : '2px solid transparent', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: 32 }}>
          {activeTab === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Financial Overview</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                   <button onClick={() => { setModalType('expense'); setShowModal(true); }} style={{ padding: '10px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#475569' }}>+ Add Expense</button>
                   <button onClick={() => { setModalType('payment'); setShowModal(true); }} style={{ padding: '10px 18px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add Payment</button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0' }}>
                   <p style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Income</p>
                   {payments.slice(0, 5).map(p => (
                     <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{p.student_name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{p.date}</p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>+${p.amount}</span>
                     </div>
                   ))}
                </div>
                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0' }}>
                   <p style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Expenses</p>
                   {expenses.slice(0, 5).map(e => (
                     <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{e.title}</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{e.date}</p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>-${e.amount}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Showing all received tuition fees.</p>
                <button onClick={() => exportCSV(payments, 'payments.csv')} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13, color: '#475569' }}>Export CSV</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: 12, fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>DATE</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>STUDENT</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>MONTH</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 12, fontSize: 14 }}>{p.date}</td>
                        <td style={{ padding: 12, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{p.student_name}</td>
                        <td style={{ padding: 12, fontSize: 14 }}>{p.month}</td>
                        <td style={{ padding: 12, fontSize: 14, fontWeight: 800, color: '#059669' }}>${p.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => { setModalType('generate-invoice'); setShowModal(true); }} style={{ padding: '8px 16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Generate Monthly Invoices</button>
                  <button onClick={() => exportCSV(invoices, 'invoices.csv')} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13, color: '#475569' }}>Export CSV</button>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {invoices.map(inv => (
                  <div key={inv.id} style={{ padding: 20, borderRadius: 18, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{inv.student_name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>For {inv.month} · Due {inv.due_date}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                       <span style={{ fontSize: 18, fontWeight: 900, color: '#1e293b' }}>${inv.amount_due}</span>
                       <span style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, background: inv.status === 'Paid' ? '#f0fdf4' : '#fff7ed', color: inv.status === 'Paid' ? '#16a34a' : '#c2410c' }}>{inv.status.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'salaries' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Staff monthly disbursements.</p>
                <button onClick={() => exportCSV(salaries, 'salaries.csv')} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13, color: '#475569' }}>Export CSV</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {salaries.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{s.teacher_name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{s.month} · {s.payment_date}</p>
                    </div>
                    <span style={{ fontWeight: 800, color: '#ef4444' }}>-${s.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Center operational costs.</p>
                <button onClick={() => exportCSV(expenses, 'expenses.csv')} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13, color: '#475569' }}>Export CSV</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {expenses.map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{e.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{e.date} · {e.category}</p>
                    </div>
                    <span style={{ fontWeight: 800, color: '#ef4444' }}>-${e.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Configure base monthly fees by grade.</p>
                <button onClick={() => { setModalType('fee-tier'); setShowModal(true); }} style={{ padding: '8px 16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Add Fee Tier</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {feeTiers.map(ft => (
                  <div key={ft.id} style={{ padding: 24, borderRadius: 20, border: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center' }}>
                     <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>GRADE {ft.grade}</p>
                     <h2 style={{ margin: '12px 0', fontSize: 32, fontWeight: 900, color: '#1e293b' }}>${ft.monthly_fee}</h2>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'discounts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>Scholarships & specialized discounts.</p>
                <button onClick={() => { setModalType('discount'); setShowModal(true); }} style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Apply Discount</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {discounts.map(d => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{d.student_name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{d.reason || 'Scholarship'}</p>
                    </div>
                    <div style={{ padding: '6px 14px', background: '#eef2ff', color: '#6366f1', borderRadius: 10, fontWeight: 900, fontSize: 14 }}>-{d.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: 500, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0, textTransform: 'capitalize' }}>Add {modalType.replace('-', ' ')}</h3>
                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 36, height: 36, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Amount ($)</label>
                  <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: 'border-color 0.2s' }} placeholder="0.00" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Transaction Date</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
                </div>
                
                {modalType === 'payment' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Select Student</label>
                      <select required value={form.student} onChange={e => setForm({...form, student: e.target.value})} style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}>
                        <option value="">Choose a student...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{(s.user?.first_name ? `${s.user.first_name} ${s.user.last_name}` : s.user?.username) || 'Unknown Student'} ({s.student_id})</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Payment For Month</label>
                      <input required value={form.month} onChange={e => setForm({...form, month: e.target.value})} style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} placeholder="e.g. March 2024" />
                    </div>
                  </div>
                )}

                {(modalType === 'expense' || modalType === 'income') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Description / Title</label>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} placeholder="e.g. Office Rent, Electricity" />
                  </div>
                )}

                {modalType === 'fee-tier' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Academic Grade (1-12)</label>
                    <input required value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} placeholder="e.g. 10" />
                  </div>
                )}

                {modalType === 'discount' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Select Student</label>
                      <select required value={form.student} onChange={e => setForm({...form, student: e.target.value})} style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}>
                        <option value="">Choose a student...</option>
                        {students.map(s => <option key={s.id} value={s.id}>{(s.user?.first_name ? `${s.user.first_name} ${s.user.last_name}` : s.user?.username) || 'Unknown Student'}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Discount Percentage (%)</label>
                      <div style={{ position: 'relative' }}>
                        <Percent style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                        <input required type="number" value={form.percentage} onChange={e => setForm({...form, percentage: e.target.value})} style={{ padding: '12px 16px 12px 40px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} placeholder="0-100" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Reason</label>
                      <input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} placeholder="e.g. Merit-based" />
                    </div>
                  </div>
                )}

                {modalType === 'generate-invoice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Billing Month</label>
                      <input required value={form.month} onChange={e => setForm({...form, month: e.target.value})} style={{ padding: '12px 16px', borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} placeholder="e.g. April 2024" />
                    </div>
                    <div style={{ display: 'flex', gap: 12, padding: 16, background: '#f0f9ff', borderRadius: 16, border: '1px solid #bae6fd' }}>
                       <AlertCircle size={18} color="#0369a1" style={{ flexShrink: 0 }} />
                       <p style={{ margin: 0, fontSize: 12, color: '#0369a1', lineHeight: 1.5 }}>This will scan all students, check their grade-level fee tiers and apply any active scholarships to generate next month's invoices.</p>
                    </div>
                  </div>
                )}

                <button type="submit" style={{ marginTop: 12, padding: '16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>Save Financial Record</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFinanceView;
