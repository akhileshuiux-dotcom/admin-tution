import mongoose from 'mongoose';

const demoRequestSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    topic: { type: String },
    preferredDate: { type: Date },
    preferredTime: { type: String },
    status: {
        type: String,
        enum: ['New', 'Draft', 'Tutor Assigned', 'Tutor Accepted', 'Demo Scheduled', 'Demo Completed', 'Not Proceeding', 'Not Interested', 'Redemo', 'Demo Successful', 'Plan Created'],
        default: 'New'
    },
    assignedTutors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Potential tutors
    finalTutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Selected tutor
    demoConductedDurationMs: { type: Number },
}, { timestamps: true });

const followUpSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Pending', 'Completed', 'Rescheduled', 'Closed'], default: 'Pending' },
    resolutionNotes: { type: String }
}, { timestamps: true });

const enquirySchema = new mongoose.Schema({
    studentName: { type: String, required: true, maxLength: 100 },
    grade: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String },
    preferredChannel: { type: String, default: 'Email' },
    syllabus: { type: String },
    publication: { type: String },
    location: { type: String, required: true },
    country: { type: String, required: true },
    timezone: { type: String },
    admissionFee: { type: Number },
    studentPricing: { type: Number }, // added by admission manager
    contactVia: { type: String },
    remarks: { type: String, maxLength: 500 },
    status: {
        type: String,
        enum: ['New', 'Processing', 'Completed', 'Failed'],
        default: 'New'
    },
    failureReason: { type: String, maxLength: 500 },
    demoRequests: [demoRequestSchema],
    followUps: [followUpSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
