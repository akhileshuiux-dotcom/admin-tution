import { useState, useEffect, useMemo } from 'react';
import api from '../api';

export const useIncome = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchIncome = async () => {
        setLoading(true);
        try {
            const res = await api.get('income/');
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch income from Django:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addIncome = async (newRecord) => {
        try {
            const res = await api.post('income/', newRecord);
            setData(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updateIncome = async (id, updates) => {
        try {
            const res = await api.patch(`/income/${id}/`, updates);
            setData(prev => prev.map(item => item.id === id ? res.data : item));
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const recordCashDeal = async (payload) => {
        try {
            const res = await api.post('income/record_cash_transaction/', payload);
            setData(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const verifyIncomeStatus = async (id, payload) => {
        try {
            const res = await api.patch(`/income/${id}/verify_income/`, payload);
            setData(prev => prev.map(item => item.id === id ? res.data : item));
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchIncome();
    }, []);

    return { data, loading, error, fetchIncome, addIncome, updateIncome, recordCashDeal, verifyIncomeStatus };
};

export const useExpenses = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await api.get('expenses/');
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch expenses from Django:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addExpense = async (newRecord) => {
        try {
            const res = await api.post('expenses/', newRecord);
            setData(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updateExpense = async (id, updates) => {
        try {
            const res = await api.patch(`/expenses/${id}/`, updates);
            setData(prev => prev.map(item => item.id === id ? res.data : item));
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    return { data, loading, error, fetchExpenses, addExpense, updateExpense };
};

export const usePayroll = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPayroll = async () => {
        setLoading(true);
        try {
            const res = await api.get('tutor-payroll/');
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch payroll from Django:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markAsPaid = async (id) => {
        try {
            const res = await api.post(`/tutor-payroll/${id}/mark_paid/`);
            setData(prev => prev.map(item => item.id === id ? res.data : item));
            // Trigger expense refresh elsewhere or let global state handle it
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updatePayroll = async (id, updates) => {
        try {
            const res = await api.patch(`/tutor-payroll/${id}/`, updates);
            setData(prev => prev.map(item => item.id === id ? res.data : item));
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const addPayroll = async (newRecord) => {
        try {
            const res = await api.post('tutor-payroll/', newRecord);
            setData(prev => [res.data, ...prev]);
            return res.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, []);

    return { data, loading, error, fetchPayroll, markAsPaid, updatePayroll, addPayroll };
};

export const useFinancialStats = () => {
    const { data: income } = useIncome();
    const { data: expenses } = useExpenses();

    const stats = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = {};

        // Process Income
        income.filter(i => i.verificationStatus === 'Verified').forEach(i => {
            const d = new Date(i.date || i.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            if (!monthlyData[key]) monthlyData[key] = { month: monthNames[d.getMonth()], income: 0, expenses: 0, sortKey: key };
            monthlyData[key].income += Number(i.amountReceived);
        });

        // Process Expenses
        expenses.forEach(e => {
            const d = new Date(e.paymentDate || e.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            if (!monthlyData[key]) monthlyData[key] = { month: monthNames[d.getMonth()], income: 0, expenses: 0, sortKey: key };
            monthlyData[key].expenses += Number(e.amount);
        });

        return Object.values(monthlyData)
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
            .slice(-6); // Last 6 months
    }, [income, expenses]);

    return stats;
};
