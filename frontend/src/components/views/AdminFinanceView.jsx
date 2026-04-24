import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ArrowDownRight, Calendar, X, Trash2, Plus, Minus, Search, Save,
  FileText, Percent, Settings, Download, AlertCircle, CheckCircle, FileCheck,
  TrendingUp, TrendingDown, DollarSign, Printer, CreditCard, Activity, Users,
  BarChart3, PieChart, ChevronDown, ChevronRight, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, Legend, PieChart as RePieChart, Pie
} from 'recharts';
import api from '../../api';

// --- Sub-components ---

const StatCard = ({ title, amount, icon: Icon, color, subtitle }) => (
  <div style={{ background: '#fff', padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', flex: 1, minWidth: 240, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 16, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={color} />
      </div>
    </div>
    <p style={{ color: '#000', fontSize: 13, fontWeight: 600, margin: '0-0 4px 0' }}>{title}</p>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 }}>${(amount || 0).toLocaleString()}</h2>
    </div>
    {subtitle && <p style={{ margin: '8px 0 0 0', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{subtitle}</p>}
  </div>
);

const FinanceSummary = ({ dashboardData }) => {
  if (!dashboardData) return null;
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', minHeight: 400, padding: 24 }}>
          <h4 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 800 }}>Monthly Income vs Expenses</h4>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={dashboardData.chart_data}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', minHeight: 400, padding: 24 }}>
          <h4 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 800 }}>Income by Source</h4>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
            <RePieChart>
                <Pie 
                  data={dashboardData.income_categories} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="total" 
                  nameKey="category"
                >
                  {dashboardData.income_categories?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main View ---

const AdminFinanceView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [instFilters, setInstFilters] = useState({ name: '', grade: '', status: '', date: '' });
  const [expandedStudents, setExpandedStudents] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [credits, setCredits] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [income, setIncome] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('payment');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  
  const [form, setForm] = useState({ 
    amount: '', date: new Date().toISOString().split('T')[0], 
    student: '', teacher: '', month: '', title: '', category: '', percentage: '', reason: '',
    basic_salary: 0, extra_amount: 0, deduction: 0, status: 'unpaid', payment_date: '',
    total_working_days: 30, paid_days: 30, leave_days: 0,
    earnings: [], deductions: [], payment_mode: 'cash', transaction_id: '',
    gross_salary: 0, total_deductions: 0, net_salary: 0, grade: '', type: 'advance', person_name: '',
    expected_total: '',
    payment_type: 'installment', // 'full' or 'installment'
    installmentRows: [{ amount: '', due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] }]
  });

  useEffect(() => { fetchData(); }, []);
  
  useEffect(() => {
    if (modalType === 'salary') {
      const earningsTotal = form.earnings.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const deductionsTotal = form.deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      const gross = parseFloat(form.basic_salary || 0) + earningsTotal;
      const net = gross - deductionsTotal;
      
      // Update only if values changed to avoid loop
      if (form.gross_salary !== gross || form.total_deductions !== deductionsTotal || form.net_salary !== net) {
        setForm(prev => ({
          ...prev,
          gross_salary: gross,
          total_deductions: deductionsTotal,
          net_salary: net
        }));
      }
    }
  }, [form.basic_salary, form.earnings, form.deductions, modalType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dash, trans, sal, inv, exp, std, tea, cred, disc, inc, inst] = await Promise.all([
        api.get('/finance-dashboard/').catch(() => ({data: null})),
        api.get('/transactions/').catch(() => ({data: []})),
        api.get('/salaries/').catch(() => ({data: []})),
        api.get('/invoices/').catch(() => ({data: []})),
        api.get('/expenses/').catch(() => ({data: []})),
        api.get('/students/').catch(() => ({data: []})),
        api.get('/teachers/').catch(() => ({data: []})),
        api.get('/credits/').catch(() => ({data: []})),
        api.get('/discounts/').catch(() => ({data: []})),
        api.get('/income/').catch(() => ({data: []})),
        api.get('/installments/').catch(() => ({data: []}))
      ]);
      setDashboardData(dash.data);
      setTransactions(trans.data);
      setSalaries(sal.data);
      setInvoices(inv.data);
      setExpenses(exp.data);
      setStudents(std.data);
      setTeachers(tea.data);
      setCredits(cred.data);
      setDiscounts(disc.data);
      setIncome(inc.data);
      setInstallments(inst.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    if (modalType === 'installment' && form.payment_type === 'installment' && totalRowsSum !== expected) {
      alert(`Validation Error: Total of installments ($${totalRowsSum}) does not match Expected Total Fee ($${expected}).`);
      return;
    }

    try {
      let url = `/${modalType === 'salary' ? 'salaries' : modalType + 's'}/`;
      
      if (modalType === 'installment' && form.payment_type === 'installment') {
        const promises = form.installmentRows.map(row => 
          api.post('/installments/', {
            ...row,
            student: form.student,
            status: 'pending'
          })
        );
        await Promise.all(promises);
      } else {
        let payload = { ...form };
        if (modalType === 'installment' && form.payment_type === 'full') {
          url = '/payments/';
          payload.status = 'paid';
          payload.date = new Date().toISOString().split('T')[0];
        } else if (modalType === 'generate-salary') url = '/salaries/generate_monthly/';
        else if (modalType === 'generate-invoice') url = '/invoices/generate_monthly/';
        else if (modalType === 'credit') url = '/credits/';
        else if (modalType === 'discount') url = '/discounts/';
        else if (modalType === 'income') url = '/income/';
        
        if (modalType === 'repayment') {
          url = `/credits/${form.id}/`;
          payload = { amount_paid_back: (parseFloat(form.amount_paid_back) || 0) + (parseFloat(form.repayment_amount) || 0) };
        }

        if (modalType === 'salary') {
          payload.earnings_json = form.earnings;
          payload.deductions_json = form.deductions;
          payload.total_amount = form.net_salary;
          payload.is_verified = form.is_verified;
          if (form.status === 'paid' && !form.payment_date) payload.payment_date = new Date().toISOString().split('T')[0];
          if (!payload.payment_date) payload.payment_date = null;
        }

        if (modalType === 'repayment') await api.patch(url, payload);
        else await api.post(url, payload);
      }
      
      setShowModal(false); 
      fetchData();
    } catch (err) { alert('Error: ' + JSON.stringify(err.response?.data || err.message)); }
  };

  const addInstallmentRow = () => setForm(p => ({ ...p, installmentRows: [...p.installmentRows, { amount: '', due_date: new Date().toISOString().split('T')[0] }] }));
  const removeInstallmentRow = (i) => setForm(p => ({ ...p, installmentRows: p.installmentRows.filter((_, idx) => idx !== i) }));
  const updateInstallmentRow = (i, f, v) => {
    const n = [...form.installmentRows]; n[i][f] = f === 'amount' ? (parseFloat(v) || 0) : v;
    setForm(p => ({ ...p, installmentRows: n }));
  };

  const addEarning = () => setForm(p => ({ ...p, earnings: [...p.earnings, { name: '', amount: 0 }] }));
  const removeEarning = (i) => setForm(p => ({ ...p, earnings: p.earnings.filter((_, idx) => idx !== i) }));
  const updateEarning = (i, f, v) => {
    const n = [...form.earnings]; n[i][f] = f === 'amount' ? (parseFloat(v) || 0) : v;
    setForm(p => ({ ...p, earnings: n }));
  };

  const addDeduction = () => setForm(p => ({ ...p, deductions: [...p.deductions, { name: '', amount: 0 }] }));
  const removeDeduction = (i) => setForm(p => ({ ...p, deductions: p.deductions.filter((_, idx) => idx !== i) }));
  const updateDeduction = (i, f, v) => {
    const n = [...form.deductions]; n[i][f] = f === 'amount' ? (parseFloat(v) || 0) : v;
    setForm(p => ({ ...p, deductions: n }));
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#000' }}>Establishing secure financial link...</div>;

  const summary = dashboardData?.summary || { total_income: 0, total_expenses: 0, net_profit: 0, pending_payments: 0, outstanding_salary: 0, total_credits: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px' }}>
      {/* Stats Section */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <StatCard title="Fees Collected" amount={summary.total_fees_collected} icon={TrendingUp} color="#10b981" subtitle="Total Student Income" />
        <StatCard title="Other Income" amount={summary.total_other_income} icon={ArrowUpRight} color="#6366f1" subtitle="Misc. Sources" />
        <StatCard title="Total Expenses" amount={summary.total_expenses} icon={TrendingDown} color="#ef4444" subtitle="Bills & Operations" />
        <StatCard title="Net Profit/Loss" amount={summary.net_profit} icon={Activity} color={summary.net_profit >= 0 ? '#10b981' : '#ef4444'} />
        <StatCard title="Pending Fees" amount={summary.pending_fees} icon={AlertCircle} color="#f59e0b" subtitle="Unpaid Installments" />
        <StatCard title="Salaries Paid" amount={summary.total_salaries_paid} icon={CheckCircle} color="#8b5cf6" subtitle="Verified Disbursements" />
      </div>

      <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', minHeight: 600, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', padding: '0 10px' }}>
          {['summary', 'payments', 'installments', 'salaries', 'expenses', 'income', 'invoices', 'discounts'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '20px 24px', border: 'none', background: 'none', fontWeight: activeTab === t ? 800 : 500, color: activeTab === t ? '#6366f1' : '#64748b', borderBottom: activeTab === t ? '3px solid #6366f1' : '3px solid transparent', cursor: 'pointer', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.08em', transition: 'all 0.2s' }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: 32 }}>
          {activeTab === 'summary' && <FinanceSummary dashboardData={dashboardData} />}

          {activeTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#000' }}>Central Payment Tracking</h3>
                 <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ padding: '8px 16px', background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Search size={16} /><input placeholder="Filter all transactions..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13 }} /></div>
                 </div>
               </div>
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>DATE</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>TYPE</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>CATEGORY</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>PERSON</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>AMOUNT</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>MODE</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>NOTES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: 12, fontSize: 13, color: '#000' }}>{t.date}</td>
                        <td style={{ padding: 12 }}><span style={{ color: t.transaction_type === 'income' ? '#10b981' : '#ef4444', fontWeight: 700, textTransform: 'uppercase', fontSize: 10 }}>{t.transaction_type}</span></td>
                        <td style={{ padding: 12, fontSize: 13, textTransform: 'capitalize', color: '#000' }}>{t.category}</td>
                        <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: '#000' }}>{t.person_name || '-'}</td>
                        <td style={{ padding: 12, fontSize: 14, fontWeight: 800, color: '#000' }}>${t.amount}</td>
                        <td style={{ padding: 12, fontSize: 12, color: '#000' }}>{t.payment_mode}</td>
                        <td style={{ padding: 12, fontSize: 11, color: '#64748b', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && <tr><td colSpan="7" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No transactions recorded yet.</td></tr>}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'installments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: isMobile ? 12 : 0 }}>
               {/* Unified Filter Bar */}
               <div style={{ background: '#FFFFFF', padding: isMobile ? 16 : 20, borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                 <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
                   <div style={{ padding: '12px 16px', background: '#FFFFFF', borderRadius: 12, border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
                     <Search size={18} color="#64748b" />
                     <input placeholder="Search Student..." value={instFilters.name} onChange={e => setInstFilters({...instFilters, name: e.target.value})} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontWeight: 600, color: '#000', width: '100%' }} />
                   </div>
                   <select value={instFilters.grade} onChange={e => setInstFilters({...instFilters, grade: e.target.value})} style={{ padding: '12px 16px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#FFFFFF', fontWeight: 600, fontSize: 14, color: '#000', cursor: 'pointer' }}>
                     <option value="">All Grades</option>
                     {[...new Set(students.map(s => s.grade))].filter(Boolean).map(g => <option key={g} value={g}>{g}</option>)}
                   </select>
                 </div>
                 
                 <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                   <button 
                     onClick={() => {
                        const consolidatedUnifiedPayments = students.map(s => {
                          const studentInstallments = installments.filter(i => i.student === s.id);
                          const studentPayments = s.payments || [];
                          const totalInstallmentPaid = studentInstallments.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.amount), 0);
                          const totalFullPayments = studentPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                          const totalPaid = totalInstallmentPaid + totalFullPayments;
                          const totalPlanned = studentInstallments.reduce((sum, i) => sum + parseFloat(i.amount), 0);
                          return { name: `${s.user?.first_name} ${s.user?.last_name}`, grade: s.grade, total: totalPlanned, paid: totalPaid, pending: totalPlanned - totalInstallmentPaid };
                        }).filter(g => g.name?.toLowerCase().includes(instFilters.name.toLowerCase()) && (!instFilters.grade || g.grade === instFilters.grade));

                        const csv = [
                          ['Student', 'Grade', 'Total Fee', 'Paid', 'Pending', 'Progress'],
                          ...consolidatedUnifiedPayments.map(g => [g.name, g.grade, g.total, g.paid, g.pending, `${g.total > 0 ? Math.round((g.paid/g.total)*100) : 0}%`])
                        ].map(r => r.join(',')).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('hidden', ''); a.setAttribute('href', url); a.setAttribute('download', 'student_financial_summary.csv');
                        document.body.appendChild(a); a.click(); document.body.removeChild(a);
                     }}
                     style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 20px', background: '#FFFFFF', border: '2px solid #111827', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#111827' }}
                   >
                     <Download size={18} /> Export
                   </button>
                   <button onClick={() => { setModalType('installment'); setForm(prev => ({...prev, payment_type: 'installment', student: ''})); setShowModal(true); }} style={{ flex: 1.5, padding: '14px 20px', background: '#111827', color: '#FFFFFF', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14 }}>+ Add Payment</button>
                 </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {(() => {
                   const consolidatedUnifiedPayments = students.map(s => {
                     const studentInstallments = installments.filter(i => i.student === s.id);
                     const studentPayments = s.payments || [];
                     
                     const totalInstallmentPaid = studentInstallments.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.amount), 0);
                     const totalFullPayments = studentPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                     
                     const totalPaid = totalInstallmentPaid + totalFullPayments;
                     const totalPlanned = studentInstallments.reduce((sum, i) => sum + parseFloat(i.amount), 0);
                     
                     return {
                       id: s.id, name: `${s.user?.first_name} ${s.user?.last_name}`, grade: s.grade, student_id_code: s.student_id_code,
                       installments: studentInstallments,
                       payments: studentPayments,
                       total: totalPlanned,
                       paid: totalPaid,
                       pending: totalPlanned - totalInstallmentPaid
                     };
                   }).filter(g => g.name?.toLowerCase().includes(instFilters.name.toLowerCase()) && (!instFilters.grade || g.grade === instFilters.grade));

                   return consolidatedUnifiedPayments.map(group => (
                     <div key={group.id} style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                       <div 
                         onClick={() => setExpandedStudents(prev => prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id])}
                         style={{ padding: isMobile ? '16px' : '20px 24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 12 : 20, cursor: 'pointer' }}
                       >
                         <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                           <div style={{ background: '#f1f5f9', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {expandedStudents.includes(group.id) ? <ChevronDown size={20} color="#000" /> : <ChevronRight size={20} color="#000" />}
                           </div>
                           <div style={{ flex: 1 }}>
                             <h4 style={{ margin: 0, fontSize: isMobile ? 17 : 15, fontWeight: 800, color: '#000000' }}>{group.name}</h4>
                             <p style={{ margin: '2px 0 0 0', fontSize: isMobile ? 14 : 12, color: '#333333', fontWeight: 600 }}>{group.grade} • ID: {group.student_id_code}</p>
                           </div>
                         </div>
                         
                         <div style={{ width: isMobile ? '100%' : 200, marginTop: isMobile ? 8 : 0 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                             <span style={{ fontSize: 12, fontWeight: 800, color: '#444444' }}>PROGRESS</span>
                             <span style={{ fontSize: 14, fontWeight: 900, color: '#059669' }}>{group.total > 0 ? Math.round((group.paid / group.total) * 100) : 0}%</span>
                           </div>
                           <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                             <div style={{ width: `${group.total > 0 ? (group.paid / group.total) * 100 : 0}%`, height: '100%', background: '#059669', borderRadius: 5 }} />
                           </div>
                         </div>
   
                         <div style={{ display: 'flex', gap: 24, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                           <div style={{ textAlign: isMobile ? 'left' : 'right', minWidth: 80 }}>
                             <span style={{ fontSize: 11, fontWeight: 800, color: '#444444', display: 'block', textTransform: 'uppercase' }}>PLAN TOTAL</span>
                             <span style={{ fontSize: isMobile ? 18 : 16, fontWeight: 900, color: '#000000' }}>${group.total}</span>
                           </div>
                           <div style={{ textAlign: isMobile ? 'left' : 'right', minWidth: 80 }}>
                             <span style={{ fontSize: 11, fontWeight: 800, color: '#444444', display: 'block', textTransform: 'uppercase' }}>PAID</span>
                             <span style={{ fontSize: isMobile ? 18 : 16, fontWeight: 900, color: '#059669' }}>${group.paid}</span>
                           </div>
                         </div>
                       </div>
   
                       <AnimatePresence>
                         {expandedStudents.includes(group.id) && (
                           <motion.div 
                             initial={{ height: 0, opacity: 0 }} 
                             animate={{ height: 'auto', opacity: 1 }} 
                             exit={{ height: 0, opacity: 0 }}
                             style={{ overflow: 'hidden', borderTop: '2px solid #f1f5f9', background: '#FFFFFF' }}
                           >
                             <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
                               {/* Full Payments Section */}
                               {group.payments.length > 0 && (
                                 <div>
                                   <h5 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 900, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                                     FULL PAYMENT HISTORY <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: 6, fontSize: 10 }}>{group.payments.length} TRANS</span>
                                   </h5>
                                   <div style={{ overflowX: 'auto' }}>
                                     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                       <thead>
                                         <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                           <th style={{ padding: '12px 10px', fontSize: 11, color: '#000' }}>DATE</th>
                                           <th style={{ padding: '12px 10px', fontSize: 11, color: '#000' }}>MONTH</th>
                                           <th style={{ padding: '12px 10px', fontSize: 11, color: '#000' }}>AMOUNT</th>
                                           <th style={{ padding: '12px 10px', fontSize: 11, color: '#000' }}>STATUS</th>
                                         </tr>
                                       </thead>
                                       <tbody>
                                         {group.payments.map(p => (
                                           <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                             <td style={{ padding: '12px 10px', fontSize: 13, color: '#000' }}>{p.date}</td>
                                             <td style={{ padding: '12px 10px', fontSize: 13, color: '#000' }}>{p.month}</td>
                                             <td style={{ padding: '12px 10px', fontSize: 14, fontWeight: 800, color: '#10b981' }}>${p.amount}</td>
                                             <td style={{ padding: '12px 10px' }}>
                                               <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: '#f0fdf4', color: '#10b981' }}>COMPLETED</span>
                                             </td>
                                           </tr>
                                         ))}
                                       </tbody>
                                     </table>
                                   </div>
                                 </div>
                               )}
   
                               {/* Installments Section */}
                               {group.installments.length > 0 && (
                                 <div>
                                   <h5 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 900, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                                     INSTALLMENT SCHEDULE <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: 6, fontSize: 10 }}>{group.installments.length} STEPS</span>
                                   </h5>
                                   {isMobile ? (
                                     <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                       {group.installments.map((inst, idx) => (
                                         <div key={inst.id} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB', padding: 16, borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                             <div>
                                               <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#444' }}>DUE DATE</p>
                                               <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#000' }}>{inst.due_date}</p>
                                             </div>
                                             <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 900, background: inst.status === 'paid' ? '#059669' : (inst.status === 'overdue' ? '#DC2626' : '#D97706'), color: '#FFFFFF' }}>{inst.status.toUpperCase()}</span>
                                           </div>
                                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                             <div>
                                               <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#444' }}>AMOUNT</p>
                                               <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#000' }}>${inst.amount}</p>
                                             </div>
                                             <div style={{ display: 'flex', gap: 8 }}>
                                               {inst.status !== 'paid' && (
                                                 <button 
                                                   onClick={async (e) => { e.stopPropagation(); await api.patch(`/installments/${inst.id}/`, {status: 'paid'}); fetchData(); }} 
                                                   style={{ padding: '10px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                                                 >
                                                   Mark Paid
                                                 </button>
                                               )}
                                               <button onClick={(e) => { e.stopPropagation(); setModalType('installment'); setForm(inst); setShowModal(true); }} style={{ padding: '10px 16px', background: '#FFFFFF', color: '#000', border: '2px solid #111827', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Edit</button>
                                             </div>
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                   ) : (
                                     <div style={{ overflowX: 'auto' }}>
                                       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                          <thead>
                                            <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                                              <th style={{ padding: '14px 10px', fontSize: 11, color: '#000', fontWeight: 800 }}>DUE DATE</th>
                                              <th style={{ padding: '14px 10px', fontSize: 11, color: '#000', fontWeight: 800 }}>AMOUNT</th>
                                              <th style={{ padding: '14px 10px', fontSize: 11, color: '#000', fontWeight: 800 }}>STATUS</th>
                                              <th style={{ padding: '14px 10px', fontSize: 11, color: '#000', fontWeight: 800, textAlign: 'right' }}>ACTIONS</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {group.installments.map((inst, idx) => (
                                              <tr key={inst.id} style={{ background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB', borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px 10px', fontSize: 14, fontWeight: 700, color: '#000000' }}>{inst.due_date}</td>
                                                <td style={{ padding: '16px 10px', fontSize: 15, fontWeight: 900, color: '#000000' }}>${inst.amount}</td>
                                                <td style={{ padding: '16px 10px' }}>
                                                  <span style={{ padding: '5px 12px', borderRadius: 20, fontSize: 10, fontWeight: 900, background: inst.status === 'paid' ? '#059669' : (inst.status === 'overdue' ? '#DC2626' : '#D97706'), color: '#FFFFFF' }}>{inst.status.toUpperCase()}</span>
                                                </td>
                                                <td style={{ padding: '16px 10px', textAlign: 'right' }}>
                                                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                     {inst.status !== 'paid' && (
                                                       <button 
                                                         onClick={async (e) => { e.stopPropagation(); await api.patch(`/installments/${inst.id}/`, {status: 'paid'}); fetchData(); }} 
                                                         style={{ padding: '6px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                                                       >
                                                         Mark Paid
                                                       </button>
                                                     )}
                                                     <button onClick={(e) => { e.stopPropagation(); setModalType('installment'); setForm(inst); setShowModal(true); }} style={{ padding: '6px 12px', background: '#FFFFFF', color: '#000', border: '2px solid #111827', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Edit</button>
                                                   </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                       </table>
                                     </div>
                                   )}
                                 </div>
                               )}

                               {group.payments.length === 0 && group.installments.length === 0 && (
                                 <div style={{ padding: 40, textAlign: 'center', background: '#f8fafc', borderRadius: 20 }}>
                                   <p style={{ margin: 0, fontWeight: 800, color: '#64748b' }}>No financial records found for this student.</p>
                                 </div>
                               )}
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                   ));
                 })()}
               </div>
            </div>
          )}

          {activeTab === 'salaries' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#000' }}>Teacher Payroll Management</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => { setModalType('generate-salary'); setShowModal(true); }} style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#000' }}>Bulk Generation</button>
                  <button onClick={() => { setModalType('salary'); setShowModal(true); }} style={{ padding: '10px 20px', background: '#1e293b', color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ Issue New Salary</button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ padding: '12px 16px', fontSize: 11, color: '#000', textTransform: 'uppercase' }}>Teacher</th>
                      <th style={{ padding: '12px 16px', fontSize: 11, color: '#000', textTransform: 'uppercase' }}>Month</th>
                      <th style={{ padding: '12px 16px', fontSize: 11, color: '#000', textTransform: 'uppercase' }}>Net Total</th>
                      <th style={{ padding: '12px 16px', fontSize: 11, color: '#000', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontSize: 11, color: '#000', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 16, color: '#000' }}><strong>{s.teacher_name}</strong><br/><small style={{ color: '#000' }}>{s.teacher_emp_id}</small></td>
                        <td style={{ padding: 16, fontSize: 14, color: '#000' }}>{s.month}</td>
                        <td style={{ padding: 16, fontSize: 16, fontWeight: 900, color: '#000' }}>${s.total_amount}</td>
                        <td style={{ padding: 16 }}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, color: '#000', background: s.status === 'paid' ? '#f0fdf4' : '#fef2f2', color: s.status === 'paid' ? '#10b981' : '#ef4444' }}>{s.status.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: 16, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          {s.status === 'unpaid' && (
                            <button 
                              onClick={async () => { 
                                if (window.confirm(`Mark salary for ${s.teacher_name} (${s.month}) as PAID?`)) {
                                  try {
                                    await api.patch(`/salaries/${s.id}/`, { status: 'paid', payment_date: new Date().toISOString().split('T')[0] });
                                    fetchData();
                                  } catch (err) { alert('Error: ' + JSON.stringify(err.response?.data || err.message)); }
                                }
                              }} 
                              style={{ padding: '6px 12px', background: '#f0fdf4', color: '#10b981', border: '1px solid #10b981', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <CheckCircle size={14} /> Mark Paid
                            </button>
                          )}
                          <button onClick={() => setSelectedPayslip(s)} style={{ padding: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Print Payslip"><Printer size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Student Invoices</h3>
                <button onClick={() => { setModalType('generate-invoice'); setShowModal(true); }} style={{ padding: '10px 20px', background: '#1e293b', color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700 }}>Generate Monthly Invoices</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: 12, fontSize: 11, color: '#000' }}>INV #</th>
                    <th style={{ padding: 12, fontSize: 11, color: '#000' }}>STUDENT</th>
                    <th style={{ padding: 12, fontSize: 11, color: '#000' }}>MONTH</th>
                    <th style={{ padding: 12, fontSize: 11, color: '#000' }}>NET AMOUNT</th>
                    <th style={{ padding: 12, fontSize: 11, color: '#000' }}>DUE DATE</th>
                    <th style={{ padding: 12, fontSize: 11, color: '#000' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: 12, fontWeight: 700, color: '#000' }}>{inv.invoice_number}</td>
                      <td style={{ padding: 12, fontSize: 13, color: '#000' }}>{inv.student_name}</td>
                      <td style={{ padding: 12, fontSize: 13, color: '#000' }}>{inv.month}</td>
                      <td style={{ padding: 12, fontSize: 14, fontWeight: 900, color: '#000' }}>${inv.net_amount}</td>
                      <td style={{ padding: 12, fontSize: 13, color: '#ef4444' }}>{inv.due_date}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: inv.status === 'paid' ? '#f0fdf4' : '#fff7ed', color: inv.status === 'paid' ? '#10b981' : '#f59e0b' }}>{inv.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#000' }}>Institutional Expenses & Credits</h3>
                 <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => { setModalType('credit'); setShowModal(true); }} style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#000' }}>+ Issue Credit/Advance</button>
                    <button onClick={() => { setModalType('expense'); setShowModal(true); }} style={{ padding: '10px 20px', background: '#1e293b', color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ Log Normal Expense</button>
                 </div>
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
                  <div>
                    <h4 style={{ fontSize: 13, marginBottom: 16, color: '#64748b' }}>RECENT EXPENSES</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                          <th style={{ padding: 12, fontSize: 11, color: '#000' }}>DATE</th>
                          <th style={{ padding: 12, fontSize: 11, color: '#000' }}>TITLE</th>
                          <th style={{ padding: 12, fontSize: 11, color: '#000' }}>AMOUNT</th>
                          <th style={{ padding: 12, fontSize: 11, color: '#000' }}>NOTES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.slice(0, 10).map(e => (
                          <tr key={e.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: 12, color: '#000', fontSize: 13 }}>{e.date}</td>
                            <td style={{ padding: 12, fontWeight: 600, color: '#000', fontSize: 13 }}>{e.title}</td>
                            <td style={{ padding: 12, fontWeight: 800, color: '#000' }}>${e.amount}</td>
                            <td style={{ padding: 12, fontSize: 11, color: '#64748b' }}>{e.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 13, marginBottom: 16, color: '#64748b' }}>ACTIVE CREDITS / ADVANCES</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                          <th style={{ padding: 12, fontSize: 11, color: '#000' }}>PERSON</th>
                          <th style={{ padding: 12, fontSize: 11, color: '#000' }}>BALANCE</th>
                          <th style={{ padding: 12, fontSize: 11, color: '#000' }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {credits.filter(c => c.status !== 'cleared').map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: 12, fontWeight: 600, color: '#000', fontSize: 13 }}>{c.person_name}</td>
                            <td style={{ padding: 12, fontWeight: 800, color: '#ef4444' }}>${c.remaining_balance}</td>
                            <td style={{ padding: 12 }}>
                              <button onClick={() => { setModalType('repayment'); setForm({...c, repayment_amount: ''}); setShowModal(true); }} style={{ padding: '4px 10px', background: '#f0fdf4', color: '#10b981', border: '1px solid #10b981', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Collect Repayment</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'income' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#000' }}>Miscellaneous Income</h3>
                 <button onClick={() => { setModalType('income'); setShowModal(true); }} style={{ padding: '10px 20px', background: '#1e293b', color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ Log Income</button>
               </div>
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>DATE</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>TITLE</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>CATEGORY</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>AMOUNT</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>NOTES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {income.map(inc => (
                      <tr key={inc.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: 12, fontSize: 13, color: '#000' }}>{inc.date}</td>
                        <td style={{ padding: 12, fontSize: 13, fontWeight: 700, color: '#000' }}>{inc.title}</td>
                        <td style={{ padding: 12, fontSize: 13, color: '#000' }}>{inc.category}</td>
                        <td style={{ padding: 12, fontSize: 14, fontWeight: 800, color: '#10b981' }}>${inc.amount}</td>
                        <td style={{ padding: 12, fontSize: 11, color: '#64748b' }}>{inc.notes}</td>
                      </tr>
                    ))}
                    {income.length === 0 && <tr><td colSpan="5" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No misc income recorded.</td></tr>}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'discounts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#000' }}>Student Discounts & Scholarships</h3>
                 <button onClick={() => { setModalType('discount'); setShowModal(true); }} style={{ padding: '10px 20px', background: '#1e293b', color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ Add New Discount</button>
               </div>
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>STUDENT</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>DISCOUNT</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>REASON</th>
                      <th style={{ padding: 12, fontSize: 11, color: '#000' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: 12, fontWeight: 600, color: '#000' }}>{d.student_name}</td>
                        <td style={{ padding: 12, color: '#000' }}>{d.discount_type === 'percentage' ? `${d.value}%` : `$${d.value}`}</td>
                        <td style={{ padding: 12, fontSize: 13, color: '#000' }}>{d.reason}</td>
                        <td style={{ padding: 12 }}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: d.is_active ? '#f0fdf4' : '#f1f5f9', color: d.is_active ? '#10b981' : '#64748b' }}>{d.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                        </td>
                      </tr>
                    ))}
                    {discounts.length === 0 && <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No discounts configured yet.</td></tr>}
                  </tbody>
               </table>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} style={{ background: '#fff', borderRadius: 28, width: '95%', maxWidth: modalType === 'salary' ? 900 : 500, maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' }}>
                  {modalType === 'salary' ? 'Teacher Salary Credit' : `Create ${modalType.replace('-', ' ')}`}
                </h3>
                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#f1f5f9', width: 36, height: 36, borderRadius: 12, cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
              </div>
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {modalType === 'salary' ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <h4 style={{ margin: '0 0 -10px 0', fontSize: 13, fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salary Disbursement Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                         <div>
                           <label style={{ fontSize: 11, fontWeight: 800, color: '#000' }}>SELECT TEACHER</label>
                           <select 
                             required 
                             value={form.teacher} 
                             onChange={e => {
                               const tId = e.target.value;
                               const tea = teachers.find(t => t.id === parseInt(tId));
                               setForm({...form, teacher: tId, basic_salary: tea ? tea.monthly_salary : 0});
                             }} 
                             style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 6, color: '#1e293b', background: '#fff' }}
                           >
                             <option value="">{teachers.length === 0 ? 'Loading Teachers...' : 'Choose Teacher...'}</option>
                             {Array.isArray(teachers) && teachers.map(t => (
                               <option key={t.id} value={t.id}>
                                 {t.user?.first_name} {t.user?.last_name} ({t.employee_id})
                               </option>
                             ))}
                           </select>
                         </div>
                         <div><label style={{ fontSize: 11, fontWeight: 800, color: '#000' }}>MONTH & YEAR</label><input required value={form.month} onChange={e => setForm({...form, month: e.target.value})} placeholder="e.g. March 2024" style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 6, color: '#1e293b' }} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                         <div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><strong style={{ color: '#000' }}>Earnings</strong> <button type="button" onClick={addEarning} style={{ border: 'none', background: '#f0fdf4', color: '#10b981', borderRadius: 8, p: 4, cursor: 'pointer' }}>+</button></div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 10, background: '#f8fafc', borderRadius: 10 }}><span>Basic</span><strong>${form.basic_salary}</strong></div>
                              {form.earnings.map((e, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 8 }}>
                                  <input value={e.name} onChange={v => updateEarning(idx, 'name', v.target.value)} placeholder="Type" style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                                  <input type="number" value={e.amount} onChange={v => updateEarning(idx, 'amount', v.target.value)} placeholder="0" style={{ width: 80, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                                  <button type="button" onClick={() => removeEarning(idx)} style={{ border: 'none', color: '#ef4444', cursor: 'pointer' }}>x</button>
                                </div>
                              ))}
                           </div>
                         </div>
                         <div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><strong style={{ color: '#000' }}>Deductions</strong> <button type="button" onClick={addDeduction} style={{ border: 'none', background: '#fef2f2', color: '#ef4444', borderRadius: 8, p: 4, cursor: 'pointer' }}>+</button></div>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {form.deductions.map((d, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 8 }}>
                                  <input value={d.name} onChange={v => updateDeduction(idx, 'name', v.target.value)} placeholder="Type" style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                                  <input type="number" value={d.amount} onChange={v => updateDeduction(idx, 'amount', v.target.value)} placeholder="0" style={{ width: 80, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                                  <button type="button" onClick={() => removeDeduction(idx)} style={{ border: 'none', color: '#ef4444', cursor: 'pointer' }}>x</button>
                                </div>
                              ))}
                           </div>
                         </div>
                      </div>
                      <div style={{ padding: 20, background: '#1e293b', color: '#fff', borderRadius: 20, textAlign: 'center' }}>
                        <span style={{ opacity: 0.7, fontSize: 13 }}>NET PAYABLE: </span>
                        <span style={{ fontSize: 24, fontWeight: 900, marginLeft: 10 }}>${(form.net_salary || 0).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px' }}>
                        <input type="checkbox" checked={form.is_verified} onChange={e => setForm({...form, is_verified: e.target.checked})} id="is_verified" />
                        <label htmlFor="is_verified" style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>Mark as Verified by Admin</label>
                      </div>
                      <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Verification Notes / Comments..." style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b', minHeight: 80 }} />
                   </div>
                ) : (
                  <>
                    {modalType === 'expense' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <input value={form.title} onChange={ev => setForm({...form, title: ev.target.value})} placeholder="Expense Title" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                        <select value={form.category} onChange={ev => setForm({...form, category: ev.target.value})} style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }}>
                          <option value="">Select Category</option>
                          <option value="Rent">Rent</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Internet">Internet</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      </div>
                    )}
                    {modalType === 'credit' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <select value={form.type} onChange={ev => setForm({...form, type: ev.target.value})} style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }}>
                          <option value="advance">Teacher Advance</option>
                          <option value="refund">Student Refund</option>
                          <option value="loan">Loan Given</option>
                        </select>
                        <input value={form.person_name} onChange={ev => setForm({...form, person_name: ev.target.value})} placeholder="Person Name" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                      </div>
                    )}
                    {modalType === 'generate-invoice' && (
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                         <div><label style={{fontSize: 10, fontWeight: 800, color: '#000'}}>MONTH</label><input value={form.month} onChange={e => setForm({...form, month: e.target.value})} placeholder="March 2024" style={{width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b'}} /></div>
                         <div><label style={{fontSize: 10, fontWeight: 800, color: '#000'}}>DUE DATE</label><input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} style={{width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b'}} /></div>
                       </div>
                    )}
                    {modalType === 'discount' && (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                         <select required value={form.student} onChange={e => setForm({...form, student: e.target.value})} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }}>
                           <option value="">Select Student...</option>
                           {students.map(s => <option key={s.id} value={s.id}>{s.user?.first_name} {s.user?.last_name}</option>)}
                         </select>
                         <div style={{ display: 'flex', gap: 12 }}>
                           <select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }}>
                             <option value="percentage">Percentage (%)</option>
                             <option value="fixed">Fixed Amount ($)</option>
                           </select>
                           <input type="number" required value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="Value" style={{ width: 100, padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                         </div>
                         <input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Reason / Scholarship Name" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                       </div>
                    )}
                    {modalType === 'income' && (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                         <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Income Title (e.g. Workshop Fees)" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                         <input value={form.source} onChange={e => setForm({...form, source: e.target.value})} placeholder="Source (e.g. External Event)" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                         <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }}>
                           <option value="">Select Category</option>
                           <option value="tuition">Tuition</option>
                           <option value="workshop">Workshop</option>
                           <option value="registration">Registration</option>
                           <option value="other">Other</option>
                         </select>
                         <input type="number" required value={form.amount} onChange={ev => setForm({...form, amount: ev.target.value})} placeholder="Income Amount ($)" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                         <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Additional Notes..." style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b', minHeight: 60 }} />
                       </div>
                    )}

                    {modalType === 'installment' && (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                         <div style={{ background: '#f8fafc', padding: 20, borderRadius: 20, border: '1px solid #e2e8f0' }}>
                           <label style={{ fontSize: 11, fontWeight: 900, color: '#000', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Select Student</label>
                           <select required value={form.student} onChange={e => setForm({...form, student: e.target.value})} style={{ width: '100%', padding: 14, borderRadius: 12, border: '2px solid #e2e8f0', color: '#000', fontSize: 14, background: '#fff' }}>
                             <option value="">Choose Student...</option>
                             {students.map(s => <option key={s.id} value={s.id}>{s.user?.first_name} {s.user?.last_name}</option>)}
                           </select>
                         </div>

                         <div style={{ background: '#111827', padding: 24, borderRadius: 20, color: '#fff' }}>
                           <label style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Expected Total Fee ($)</label>
                           <input 
                             type="number" 
                             required 
                             value={form.expected_total} 
                             onChange={e => setForm({...form, expected_total: e.target.value})} 
                             placeholder="e.g. 1200"
                             style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 24, fontWeight: 900, outline: 'none' }}
                           />
                         </div>

                         <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#000' }}>SCHEDULE INSTALLMENTS</h4>
                             <button type="button" onClick={addInstallmentRow} style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>+ Add Row</button>
                           </div>

                           <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflow: 'auto', paddingRight: 4 }}>
                             {form.installmentRows.map((row, idx) => (
                               <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                                 <div style={{ flex: 1 }}>
                                   <label style={{ fontSize: 10, fontWeight: 800, color: '#444', display: 'block', marginBottom: 4 }}>DUE DATE</label>
                                   <input type="date" required value={row.due_date} onChange={e => updateInstallmentRow(idx, 'due_date', e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff', color: '#000', fontWeight: 700 }} />
                                 </div>
                                 <div style={{ width: 120 }}>
                                   <label style={{ fontSize: 10, fontWeight: 800, color: '#444', display: 'block', marginBottom: 4 }}>AMOUNT ($)</label>
                                   <input type="number" required value={row.amount} onChange={e => updateInstallmentRow(idx, 'amount', e.target.value)} placeholder="0.00" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff', color: '#000', fontWeight: 800 }} />
                                 </div>
                                 {form.installmentRows.length > 1 && (
                                   <button type="button" onClick={() => removeInstallmentRow(idx)} style={{ padding: 8, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                     <X size={16} />
                                   </button>
                                 )}
                               </div>
                             ))}
                           </div>
                         </div>

                         <div style={{ padding: 16, borderRadius: 16, background: form.installmentRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0) === (parseFloat(form.expected_total) || 0) ? '#f0fdf4' : '#fff7ed', border: '1px solid currentColor', color: form.installmentRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0) === (parseFloat(form.expected_total) || 0) ? '#059669' : '#D97706', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <span style={{ fontSize: 13, fontWeight: 800 }}>Total Scheduled: ${form.installmentRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)}</span>
                           {form.installmentRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0) === (parseFloat(form.expected_total) || 0) ? 
                             <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900 }}><CheckCircle size={16} /> READY</div> :
                             <div style={{ fontSize: 12, fontWeight: 900 }}>MISMATCH</div>
                           }
                         </div>
                       </div>
                    )}

                    {(modalType !== 'discount' && modalType !== 'income' && modalType !== 'installment') && <input type="number" value={form.amount} onChange={ev => setForm({...form, amount: ev.target.value})} placeholder="Amount ($)" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }} />}
                    {(modalType !== 'installment' && modalType !== 'income') && <input type="date" value={form.date} onChange={ev => setForm({...form, date: ev.target.value})} style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }} />}
                    {(modalType === 'expense' || modalType === 'credit') && <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Detailed Audit Notes..." style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b', minHeight: 60 }} />}
                  </>
                )}
                
                {modalType === 'repayment' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>Repaying Credit for: </span>
                      <strong style={{ color: '#000' }}>{form.person_name}</strong>
                      <div style={{ marginTop: 8, fontSize: 14 }}>Remaining Balance: <strong style={{ color: '#ef4444' }}>${form.remaining_balance}</strong></div>
                    </div>
                    <input type="number" required value={form.repayment_amount} onChange={e => setForm({...form, repayment_amount: e.target.value})} placeholder="Enter Repayment Amount ($)" style={{ padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', color: '#1e293b' }} />
                  </div>
                )}
                <button type="submit" style={{ padding: 16, background: '#1e293b', color: '#fff', border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Process Financial Entry</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Payslip View */}
        {selectedPayslip && (
          <div className="print-area" style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
             <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ background: '#fff', width: 600, padding: 50, borderRadius: 16, position: 'relative', boxShadow: '0 0 100px rgba(0,0,0,0.5)', color: '#1e293b' }}>
                <button className="no-print" onClick={() => setSelectedPayslip(null)} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: '#f1f5f9', width: 40, height: 40, borderRadius: 12, cursor: 'pointer', color: '#000' }}><X /></button>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: 20, marginBottom: 30 }}>
                  <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1e293b' }}>EDUWAY TUITION CENTER</h1>
                  <p style={{ margin: 0, color: '#000', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>MONTHLY PAYSLIP - {selectedPayslip.month}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30, fontSize: 13 }}>
                  <div><strong style={{ color: '#000', fontSize: 10, display: 'block' }}>TEACHER</strong> <span style={{ fontWeight: 800 }}>{selectedPayslip.teacher_name}</span></div>
                  <div><strong style={{ color: '#000', fontSize: 10, display: 'block' }}>EMPLOYEE ID</strong> <span style={{ fontWeight: 800 }}>{selectedPayslip.teacher_emp_id || 'N/A'}</span></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                  <div>
                    <h4 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 8, fontSize: 12, color: '#1e293b' }}>EARNINGS</h4>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr><td style={{ padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>Basic Salary</td><td style={{ textAlign: 'right', fontWeight: 700 }}>${selectedPayslip.basic_salary}</td></tr>
                        {Array.isArray(selectedPayslip.earnings_json) && selectedPayslip.earnings_json.map((x, i) => (
                          <tr key={i}><td style={{ padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>{x.name}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>${x.amount}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 8, fontSize: 12, color: '#1e293b' }}>DEDUCTIONS</h4>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                      <tbody>
                        {Array.isArray(selectedPayslip.deductions_json) && selectedPayslip.deductions_json.map((x, i) => (
                          <tr key={i}><td style={{ padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>{x.name}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>${x.amount}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ marginTop: 40, padding: 24, background: '#1e293b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12 }}>
                   <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.8 }}>NET PAYABLE</div>
                   <div style={{ fontSize: 28, fontWeight: 900 }}>${selectedPayslip.total_amount}</div>
                </div>
                <div style={{ marginTop: 40, textAlign: 'center' }} className="no-print">
                   <button onClick={() => window.print()} style={{ padding: '14px 28px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}><Printer size={20} /> Print Payslip</button>
                </div>
                <style>{`
                  @media print {
                    .no-print { display: none !important; }
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: #fff !important; }
                  }
                `}</style>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFinanceView;
