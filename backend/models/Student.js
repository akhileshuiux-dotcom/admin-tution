import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true, maxLength: 100 },
    grade: { type: String, required: true },
    syllabus: { type: String },
    academicYear: { type: String },
    mediumOfCommunication: [{ type: String }], // e.g. English, Malayalam
    publication: { type: String },
    contactMethod: [{ type: String }],
    location: { type: String, required: true },
    school: { type: String },
    parentRemarks: { type: String, maxLength: 500 },
    phoneNumber: { type: String },
    email: { type: String },
    timezone: { type: String },
    country: { type: String, required: true },
    whatsappGroup: { type: String },
    contactVia: { type: String },

    parentName: { type: String },
    tutor: { type: String },

    // High-level student status
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },

    enquiryRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;
