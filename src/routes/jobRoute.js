import express from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import {
    createJob,
    getAllJobs,
    getMyJobs,
    applyForJob,
    deleteJob,
    updateJob,
} from '../controllers/jobController.js';

const router = express.Router();

// Public routes (if any)

// Routes accessible by both companies and students
router.get('/', authenticate, getAllJobs);

// Company-only routes
router.post('/', authenticate, authorize(['company']), createJob);
router.get('/my-jobs', authenticate, authorize(['company']), getMyJobs);
router.put('/:id', authenticate, authorize(['company']), updateJob);
router.delete('/:id', authenticate, authorize(['company']), deleteJob);

// Student-only routes
router.post('/:id/apply', authenticate, authorize(['student']), applyForJob);

// Error handler for invalid routes
router.use('*', (req, res) => {
    res.status(404).json({ message: 'Job route not found' });
});

export default router;