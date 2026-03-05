import express from 'express';
import mongoose from 'mongoose';
import Plan from '../models/Plan.js';
import Session from '../models/Session.js';

const router = express.Router();

// Helper to get next occurrence of a day of week
const getNextDayOfWeek = (startDate, dayOfWeekStr) => {
    const days = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDay = days[dayOfWeekStr];
    let date = new Date(startDate);

    // Find the first occurrence
    while (date.getDay() !== targetDay) {
        date.setDate(date.getDate() + 1);
    }
    return date;
};

// Create a new Plan and automatically generate Sessions for the first cycle
router.post('/create', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const planData = req.body;

        // Calculate 4 Weeks (28 days) sub-plan end date based on start date
        const startDate = new Date(planData.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 28);

        const totalSessions = planData.sessionsPerWeek * 4;
        const totalFee = totalSessions * planData.feePerSession;

        const initialSubPlan = {
            cycleNumber: 1,
            startDate: startDate,
            endDate: endDate,
            totalSessions,
            feePerSession: planData.feePerSession,
            totalFee: totalFee,
            oneTimeFees: planData.oneTimeFees || 0,
        };

        planData.subPlans = [initialSubPlan];

        const newPlan = new Plan(planData);
        const savedPlan = await newPlan.save({ session });
        const subPlanId = savedPlan.subPlans[0]._id;

        // Generate Sessions
        const sessionsToCreate = [];

        // Iterate over 4 weeks
        for (let week = 0; week < 4; week++) {
            for (const pattern of planData.schedulePattern) {
                let sessionDate = getNextDayOfWeek(startDate, pattern.dayOfWeek);
                sessionDate.setDate(sessionDate.getDate() + (week * 7));

                sessionsToCreate.push({
                    planRef: savedPlan._id,
                    subPlanId: subPlanId,
                    tutorRef: savedPlan.tutorRef,
                    studentRefs: [savedPlan.studentRef], // For batches this would be multiple 
                    subject: savedPlan.subject,
                    scheduledDate: sessionDate,
                    scheduledTime: pattern.time,
                    durationHours: savedPlan.sessionDuration,
                    status: 'Scheduled'
                });
            }
        }

        await Session.insertMany(sessionsToCreate, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ plan: savedPlan, message: `Successfully created plan and ${sessionsToCreate.length} sessions.` });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
});

// Get plans for a user (student or tutor)
router.get('/', async (req, res) => {
    try {
        const plans = await Plan.find().populate('studentRef').populate('tutorRef').sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
