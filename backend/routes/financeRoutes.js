import express from 'express';
import Income from '../models/Income.js';
import CenterExpense from '../models/CenterExpense.js';
import TutorPayroll from '../models/TutorPayroll.js';

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/finance/summary
// Returns aggregated KPIs for the financial dashboard
// ─────────────────────────────────────────────
router.get('/summary', async (req, res) => {
    try {
        // Total income (verified only)
        const incomeAgg = await Income.aggregate([
            { $match: { verificationStatus: 'Verified' } },
            { $group: { _id: null, total: { $sum: '$amountReceived' } } }
        ]);
        const totalIncome = incomeAgg[0]?.total || 0;

        // Cash-on-hand (verified + Cash mode)
        const cashAgg = await Income.aggregate([
            { $match: { verificationStatus: 'Verified', paymentMode: 'Cash' } },
            { $group: { _id: null, total: { $sum: '$amountReceived' } } }
        ]);
        const cashOnHand = cashAgg[0]?.total || 0;

        // Total expenses (center costs)
        const expenseAgg = await CenterExpense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = expenseAgg[0]?.total || 0;

        // Pending payroll (tutors not yet paid)
        const payrollDocs = await TutorPayroll.find({ paymentStatus: 'Pending' });
        const pendingSalaries = payrollDocs.reduce((sum, p) => sum + p.baseSalary + (p.hourlyRate * p.hoursLogged), 0);

        res.json({
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
            cashOnHand,
            pendingSalaries
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/finance/income
// ─────────────────────────────────────────────
router.get('/income', async (req, res) => {
    try {
        const query = {};
        if (req.query.mode) query.paymentMode = req.query.mode;
        if (req.query.status) query.verificationStatus = req.query.status;
        const records = await Income.find(query).sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/finance/cash-transaction
// Records a cash income entry
// ─────────────────────────────────────────────
router.post('/cash-transaction', async (req, res) => {
    try {
        const { studentName, amount, serviceProvided, verifiedBy } = req.body;
        const receiptId = 'RCP-' + Date.now().toString().slice(-6);
        const income = new Income({
            studentName,
            amountReceived: amount,
            paymentMode: 'Cash',
            serviceProvided,
            verificationStatus: 'Verified', // Cash is immediately verified
            verifiedAt: new Date(),
            verifiedBy: verifiedBy || null,
            receiptId,
            planType: 'One-Time',
            auditLog: [{
                userId: verifiedBy || 'system',
                action: 'CASH_RECORDED',
                oldStatus: null,
                newStatus: 'Verified',
                timestamp: new Date()
            }]
        });
        await income.save();
        res.status(201).json({ income, receiptId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// PATCH /api/finance/income/:id/verify
// Verify or reject an income record (with audit log)
// ─────────────────────────────────────────────
router.patch('/income/:id/verify', async (req, res) => {
    try {
        const { status, userId } = req.body; // status: 'Verified' | 'Rejected'
        const record = await Income.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Income record not found' });

        const oldStatus = record.verificationStatus;
        record.verificationStatus = status;
        record.verifiedAt = new Date();
        record.auditLog.push({ userId: userId || 'admin', action: 'STATUS_CHANGE', oldStatus, newStatus: status, timestamp: new Date() });
        await record.save();
        res.json(record);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/finance/expenses
// ─────────────────────────────────────────────
router.get('/expenses', async (req, res) => {
    try {
        const query = {};
        if (req.query.category) query.category = req.query.category;
        const records = await CenterExpense.find(query).sort({ paymentDate: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/finance/expenses
router.post('/expenses', async (req, res) => {
    try {
        const expense = new CenterExpense(req.body);
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ─────────────────────────────────────────────
// GET /api/finance/payroll
// ─────────────────────────────────────────────
router.get('/payroll', async (req, res) => {
    try {
        const records = await TutorPayroll.find().sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/finance/payroll/:id/mark-paid
// Marks a payroll entry as paid AND auto-creates an Expense entry
router.post('/payroll/:id/mark-paid', async (req, res) => {
    try {
        const payroll = await TutorPayroll.findById(req.params.id);
        if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });

        const calculatedPay = payroll.baseSalary + (payroll.hourlyRate * payroll.hoursLogged);

        // Auto-create expense entry
        const expense = new CenterExpense({
            category: 'Tutor Salary',
            payeeName: payroll.tutorName,
            amount: calculatedPay,
            paymentDate: new Date(),
            notes: `Salary for ${payroll.month}`,
            payrollRef: payroll._id,
        });
        await expense.save();

        // Update payroll status
        payroll.paymentStatus = 'Paid';
        payroll.paidAt = new Date();
        await payroll.save();

        res.json({ payroll, expense, message: `Salary of $${calculatedPay} paid and logged to expenses.` });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
