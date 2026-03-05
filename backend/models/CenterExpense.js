import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['Tutor Salary', 'Rent', 'Utilities', 'Marketing', 'Software', 'Office Supplies', 'Other'],
        required: true
    },
    payeeName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    receiptAttachmentUrl: { type: String },
    notes: { type: String },
    payrollRef: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorPayroll', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    auditLog: [{ userId: String, action: String, timestamp: Date }],
}, { timestamps: true });

const CenterExpense = mongoose.model('CenterExpense', expenseSchema);
export default CenterExpense;
