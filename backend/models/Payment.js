import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    planRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    subPlanId: { type: mongoose.Schema.Types.ObjectId, required: true },
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },

    amountDue: { type: Number, required: true },
    amountReceived: { type: Number, required: true },

    bankAccountCredited: { type: String, required: true },

    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Verified', 'Pending', 'Failed'], default: 'Verified' },

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },

    paymentMethod: { type: String },
    receiptId: { type: String },
    isOneTimeFeeIncluded: { type: Boolean, default: false }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
