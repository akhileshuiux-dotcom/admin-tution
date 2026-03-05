import mongoose from 'mongoose';

const tutorPayrollSchema = new mongoose.Schema({
    tutorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
    tutorName: { type: String, required: true }, // denormalized for display
    month: { type: String, required: true }, // e.g. "March 2026"
    baseSalary: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    hoursLogged: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    paidAt: { type: Date, default: null },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

// Virtual: calculated_pay = baseSalary + (hourlyRate * hoursLogged)
tutorPayrollSchema.virtual('calculatedPay').get(function () {
    return this.baseSalary + (this.hourlyRate * this.hoursLogged);
});

tutorPayrollSchema.set('toJSON', { virtuals: true });
tutorPayrollSchema.set('toObject', { virtuals: true });

const TutorPayroll = mongoose.model('TutorPayroll', tutorPayrollSchema);
export default TutorPayroll;
