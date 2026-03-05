import express from 'express';
import Tutor from '../models/Tutor.js';

const router = express.Router();

// Get all tutors
router.get('/', async (req, res) => {
    try {
        const tutors = await Tutor.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(tutors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new tutor profile
router.post('/', async (req, res) => {
    try {
        const newTutor = new Tutor(req.body);
        const savedTutor = await newTutor.save();
        res.status(201).json(savedTutor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update tutor profile
router.put('/:id', async (req, res) => {
    try {
        const updatedTutor = await Tutor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTutor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
