import { FiCheckCircle, FiDollarSign, FiDownload } from 'react-icons/fi';
import './Payments.css';

const MOCK_PAYMENTS = [
    { id: 'PAY-0992', student: 'Alex Johnson', plan: 'Maths - Cycle 1', amount: '$460', bank: 'Main Account', status: 'Pending Verification', date: 'Today' },
    { id: 'PAY-0991', student: 'Sarah Smith', plan: 'Physics - Cycle 2', amount: '$320', bank: 'Secondary Account', status: 'Verified', date: 'Yesterday' },
];

const Payments = () => {
    return (
        <div className="payments-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="h1">Payment Tracking</h1>
                    <p className="text-muted">Verify parent payments and track sub-plan cycles.</p>
                </div>
                <div className="page-actions flex gap-4">
                    <button className="btn btn-secondary">
                        <FiDownload /> Export Audit Log
                    </button>
                </div>
            </div>

            <div className="stats-grid mb-4">
                <div className="stat-card glass-panel success-card">
                    <div className="stat-icon-wrapper"><FiDollarSign /></div>
                    <div className="stat-info">
                        <span className="stat-title">Verified Received (Month)</span>
                        <span className="stat-value">$12,450</span>
                    </div>
                </div>
                <div className="stat-card glass-panel warning-card">
                    <div className="stat-icon-wrapper"><FiDollarSign /></div>
                    <div className="stat-info">
                        <span className="stat-title">Pending Verifications</span>
                        <span className="stat-value">12</span>
                    </div>
                </div>
            </div>

            <div className="payment-list glass-panel">
                <h2 className="h3 mb-4" style={{ marginBottom: '1.5rem' }}>Recent Payment Activities</h2>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Receipt ID</th>
                            <th>Student & Plan</th>
                            <th>Amount</th>
                            <th>Bank Account</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_PAYMENTS.map(pay => (
                            <tr key={pay.id}>
                                <td className="font-medium text-muted">{pay.id}</td>
                                <td>
                                    <div className="font-semibold">{pay.student}</div>
                                    <div className="text-sm text-muted">{pay.plan}</div>
                                </td>
                                <td className="font-bold text-main">{pay.amount}</td>
                                <td>{pay.bank}</td>
                                <td>{pay.date}</td>
                                <td>
                                    <span className={`status-badge ${pay.status === 'Verified' ? 'status-badge-converted' : 'status-badge-draft'}`}>
                                        {pay.status}
                                    </span>
                                </td>
                                <td>
                                    {pay.status === 'Pending Verification' ? (
                                        <button className="btn btn-primary btn-sm bg-success" style={{ backgroundColor: 'var(--primary-color)' }}>
                                            <FiCheckCircle /> Verify
                                        </button>
                                    ) : (
                                        <button className="btn btn-secondary btn-sm" disabled>Verified</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;
