import express from 'express';
import Enquiry from '../models/Enquiry.js';

const router = express.Router();

// Get all enquiries
router.get('/', async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new enquiry
router.post('/', async (req, res) => {
    try {
        const newEnquiry = new Enquiry(req.body);
        const savedEnquiry = await newEnquiry.save();
        res.status(201).json(savedEnquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update enquiry
router.put('/:id', async (req, res) => {
    try {
        const updatedEnquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedEnquiry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete enquiry
router.delete('/:id', async (req, res) => {
    try {
        await Enquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
