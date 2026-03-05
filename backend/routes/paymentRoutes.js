import express from 'express';
import Payment from '../models/Payment.js';
import Plan from '../models/Plan.js';

const router = express.Router();

// Get all payments (Audit / Verification view)
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('studentRef', 'fullName')
            .populate('planRef', 'subject planType')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Record a new payment (Verify Payment)
router.post('/verify', async (req, res) => {
    try {
        const { planId, subPlanId, studentId, amountPaid, bankAccount } = req.body;

        // Create payment record
        const payment = new Payment({
            planRef: planId,
            subPlanId,
            studentRef: studentId,
            amountDue: amountPaid, // simplifying for MVP
            amountReceived: amountPaid,
            bankAccountCredited: bankAccount,
            status: 'Verified',
            // verifiedBy: req.user.id
        });

        await payment.save();

        // Update Plan cycle
        await Plan.updateOne(
            { _id: planId, 'subPlans._id': subPlanId },
            {
                $set: {
                    'subPlans.$.paymentStatus': 'Paid',
                    'subPlans.$.amountPaid': amountPaid,
                    'status': 'Active'
                }
            }
        );

        res.status(201).json({ message: 'Payment verified and plan updated successfully', payment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
