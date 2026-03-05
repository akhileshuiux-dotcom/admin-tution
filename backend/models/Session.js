import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    planRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    subPlanId: { type: mongoose.Schema.Types.ObjectId }, // Reference to the sub-plan cycle
    tutorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
    studentRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // Array for potential batched sessions
    subject: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    durationHours: { type: Number, required: true },
    googleMeetLink: { type: String },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Rescheduled', 'Rescheduled: New', 'Cancelled', 'Disputed'],
        default: 'Scheduled'
    },
    attendance: [{
        studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        status: { type: String, enum: ['Present', 'Absent', 'Pending'], default: 'Pending' }
    }],
    homeworkGiven: { type: Boolean, default: false },
    homeworkNotes: { type: String },
    originalSessionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' }, // For rescheduled sessions
    managersRemarks: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        category: { type: String }, // Student, Tutor, General
        severity: { type: String },
        comment: String,
        date: Date
    }]
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
