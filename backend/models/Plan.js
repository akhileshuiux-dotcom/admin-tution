import mongoose from 'mongoose';

const subPlanSchema = new mongoose.Schema({
    cycleNumber: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalSessions: { type: Number, required: true },
    feePerSession: { type: Number, required: true },
    totalFee: { type: Number, required: true },
    oneTimeFees: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
});

const planSchema = new mongoose.Schema({
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    tutorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
    subject: { type: String, required: true },
    planType: { type: String, enum: ['One-on-One', 'Twin', 'Batch', 'Revision'], required: true },
    sessionsPerWeek: { type: Number, required: true },
    sessionDuration: { type: Number, required: true }, // in hours
    schedulePattern: [{
        dayOfWeek: String,
        time: String
    }],
    batchRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }, // if applicable
    twinStudentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // if applicable
    subPlans: [subPlanSchema],
    status: {
        type: String,
        enum: ['New', 'Active', 'Pending Renewal', 'Inactive', 'Course Completion', 'Scheduled Leave (Normal)', 'Scheduled Leave (Annual)', 'Discontinuation', 'Tutor Change'],
        default: 'New'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
