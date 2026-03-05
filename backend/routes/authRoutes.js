import express from 'express';
// import User from '../models/User.js'; // We would use this in a real scenario
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // MVP Hardcoded login
    if (email === 'demo@guardiantutoring.com' && password === 'password') {
        const user = {
            id: 'mock-id',
            name: 'Sarah Jenkins',
            email: 'demo@guardiantutoring.com',
            role: 'Admission Manager'
        };
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });

        return res.json({ token, user });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
});

router.get('/me', (req, res) => {
    // Mock endpoint to verify session
    res.json({
        user: {
            id: 'mock-id',
            name: 'Sarah Jenkins',
            email: 'demo@guardiantutoring.com',
            role: 'Admission Manager'
        }
    });
});

export default router;
