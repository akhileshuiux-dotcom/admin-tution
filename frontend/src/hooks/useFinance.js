import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';

const mapIncome = (i) => ({
    id: i.id,
    receiptId: i.receipt_id,
    studentName: i.student_name,
    planType: i.plan_type,
    amountReceived: Number(i.amount_received),
    paymentMode: i.payment_mode,
    verificationStatus: i.verification_status,
    date: i.date,
    created_at: i.created_at
});

const mapExpense = (e) => ({
    id: e.id,
    category: e.category,
    payeeName: e.payee_name,
    amount: Number(e.amount),
    paymentDate: e.payment_date,
    receiptUrl: e.receipt_url,
    created_at: e.created_at
});

const mapPayroll = (p) => ({
    id: p.id,
    tutorName: p.tutor_name,
    month: p.month,
    baseSalary: Number(p.base_salary),
    hourlyRate: Number(p.hourly_rate),
    hoursLogged: Number(p.hours_logged),
    paymentStatus: p.payment_status,
    subjects: p.subjects,
    paidAt: p.paid_at,
    created_at: p.created_at
});

export const useIncome = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchIncome = async () => {
        setLoading(true);
        try {
            const { data: incomeData, error: fetchError } = await supabase
                .from('income')
                .select('*')
                .order('date', { ascending: false });

            if (fetchError) throw fetchError;
            setData(incomeData.map(mapIncome));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addIncome = async (newRecord) => {
        const dbRecord = {
            receipt_id: newRecord.receiptId,
            student_name: newRecord.studentName,
            plan_type: newRecord.planType,
            amount_received: newRecord.amountReceived,
            payment_mode: newRecord.paymentMode,
            verification_status: newRecord.verificationStatus,
            date: newRecord.date
        };
        try {
            const { data: added, error: addError } = await supabase
                .from('income')
                .insert([dbRecord])
                .select();

            if (addError) throw addError;
            setData(prev => [mapIncome(added[0]), ...prev]);
            return mapIncome(added[0]);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updateIncome = async (id, updates) => {
        const dbUpdates = {};
        if (updates.receiptId) dbUpdates.receipt_id = updates.receiptId;
        if (updates.studentName) dbUpdates.student_name = updates.studentName;
        if (updates.planType) dbUpdates.plan_type = updates.planType;
        if (updates.amountReceived) dbUpdates.amount_received = updates.amountReceived;
        if (updates.paymentMode) dbUpdates.payment_mode = updates.paymentMode;
        if (updates.verificationStatus) dbUpdates.verification_status = updates.verificationStatus;
        if (updates.date) dbUpdates.date = updates.date;

        try {
            const { data: updated, error: updateError } = await supabase
                .from('income')
                .update(dbUpdates)
                .eq('id', id)
                .select();

            if (updateError) throw updateError;
            setData(prev => prev.map(item => item.id === id ? mapIncome(updated[0]) : item));
            return mapIncome(updated[0]);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchIncome();
    }, []);

    return { data, loading, error, fetchIncome, addIncome, updateIncome };
};

export const useExpenses = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const { data: expensesData, error: fetchError } = await supabase
                .from('expenses')
                .select('*')
                .order('payment_date', { ascending: false });

            if (fetchError) throw fetchError;
            setData(expensesData.map(mapExpense));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addExpense = async (newRecord) => {
        const dbRecord = {
            category: newRecord.category,
            payee_name: newRecord.payeeName,
            amount: newRecord.amount,
            payment_date: newRecord.paymentDate,
            receipt_url: newRecord.receiptUrl
        };
        try {
            const { data: added, error: addError } = await supabase
                .from('expenses')
                .insert([dbRecord])
                .select();

            if (addError) throw addError;
            const mapped = mapExpense(added[0]);
            setData(prev => [mapped, ...prev]);
            return mapped;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updateExpense = async (id, updates) => {
        const dbUpdates = {};
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.payeeName) dbUpdates.payee_name = updates.payeeName;
        if (updates.amount) dbUpdates.amount = updates.amount;
        if (updates.paymentDate) dbUpdates.payment_date = updates.paymentDate;
        if (updates.receiptUrl) dbUpdates.receipt_url = updates.receiptUrl;

        try {
            const { data: updated, error: updateError } = await supabase
                .from('expenses')
                .update(dbUpdates)
                .eq('id', id)
                .select();

            if (updateError) throw updateError;
            setData(prev => prev.map(item => item.id === id ? mapExpense(updated[0]) : item));
            return mapExpense(updated[0]);
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
            const { data: payrollData, error: fetchError } = await supabase
                .from('tutor_payroll')
                .select('*')
                .order('month', { ascending: false });

            if (fetchError) throw fetchError;
            setData(payrollData.map(mapPayroll));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updatePayroll = async (id, updates) => {
        const dbUpdates = {};
        if (updates.tutorName) dbUpdates.tutor_name = updates.tutorName;
        if (updates.month) dbUpdates.month = updates.month;
        if (updates.baseSalary) dbUpdates.base_salary = updates.baseSalary;
        if (updates.hourlyRate) dbUpdates.hourly_rate = updates.hourlyRate;
        if (updates.hoursLogged) dbUpdates.hours_logged = updates.hoursLogged;
        if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
        if (updates.subjects) dbUpdates.subjects = updates.subjects;
        if (updates.paidAt) dbUpdates.paid_at = updates.paidAt;

        try {
            const { data: updated, error: updateError } = await supabase
                .from('tutor_payroll')
                .update(dbUpdates)
                .eq('id', id)
                .select();

            if (updateError) throw updateError;
            setData(prev => prev.map(item => item.id === id ? mapPayroll(updated[0]) : item));
            return mapPayroll(updated[0]);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, []);

    return { data, loading, error, fetchPayroll, updatePayroll };
};

export const useFinancialStats = () => {
    const { data: income } = useIncome();
    const { data: expenses } = useExpenses();

    const stats = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = {};

        // Process Income
        income.filter(i => i.verificationStatus === 'Verified').forEach(i => {
            const d = new Date(i.date);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            if (!monthlyData[key]) monthlyData[key] = { month: monthNames[d.getMonth()], income: 0, expenses: 0, sortKey: key };
            monthlyData[key].income += i.amountReceived;
        });

        // Process Expenses
        expenses.forEach(e => {
            const d = new Date(e.paymentDate);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            if (!monthlyData[key]) monthlyData[key] = { month: monthNames[d.getMonth()], income: 0, expenses: 0, sortKey: key };
            monthlyData[key].expenses += e.amount;
        });

        return Object.values(monthlyData)
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
            .slice(-6); // Last 6 months
    }, [income, expenses]);

    return stats;
};
