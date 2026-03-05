import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    studentName: { type: String, required: true }, // denormalized for cash deals
    planType: {
        type: String,
        enum: ['Cycle 1', 'Cycle 2', 'Cycle 3', 'Admission Fee', 'One-Time'],
        default: 'Cycle 1'
    },
    amountReceived: { type: Number, required: true },
    paymentMode: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Online'],
        default: 'Bank Transfer'
    },
    serviceProvided: { type: String },
    verificationStatus: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    remarks: { type: String },
    receiptId: { type: String },
    // Audit trail: [{userId, action, oldStatus, newStatus, timestamp}]
    auditLog: [{ userId: String, action: String, oldStatus: String, newStatus: String, timestamp: Date }],
}, { timestamps: true });

const Income = mongoose.model('Income', incomeSchema);
export default Income;
