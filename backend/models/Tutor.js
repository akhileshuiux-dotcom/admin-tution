import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
    dayOfWeek: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
});

const tutorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactNumber: { type: String, required: true },
    address: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
    educationalQualifications: [{ type: String }],
    teachingExperienceMonths: { type: Number },
    subjectExpertise: [{ subject: String, proficiency: String }], // Beginner, Intermediate, Advanced, Expert
    classesCanTeach: [{ type: String }],
    syllabusExpertise: [{ syllabus: String, experienceYears: String }],
    languagesSpoken: [{ language: String, proficiency: String }],
    googleMeetLink: { type: String },
    networkConnectivity: { type: String },
    device: { type: String },
    boardType: { type: String },
    bankDetails: {
        accountNumber: String,
        bankName: String,
        ifscCode: String,
        accountHolderName: String
    },
    availability: [availabilitySchema],
    status: { type: String, enum: ['Active', 'Inactive', 'Scheduled Leave'], default: 'Active' },
    remarks: [{ date: Date, comment: String, severity: String }]
}, { timestamps: true });

const Tutor = mongoose.model('Tutor', tutorSchema);
export default Tutor;
