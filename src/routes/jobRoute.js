import express from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import {
    createJob,
    getAllJobs,
    getMyJobs,
    getApplicants,
    applyForJob,
    updateJob,
    deleteJob,
    getJobById
} from '../controllers/jobController.js';

const router = express.Router();

// now all routes are aunthicated routes
router.use(authenticate);
// Student routes
router.get('/',authorize(['student']),getAllJobs); 
router.get('/:id',authorize(['student']),getJobById ); // get job by id
router.post('/:id/apply', authorize(['student']), applyForJob);

// Company routes
router.post('/', authorize(['company']), createJob);
router.get('/my', authorize(['company']), getMyJobs);
router.get('/applicants', authorize(['company']), getApplicants);
router.put('/:id', authorize(['company']), updateJob);
router.delete('/:id', authorize(['company']), deleteJob);

// Error handler for invalid routes
router.use('*', (req, res) => {
    res.status(404).json({ message: 'Job route not found' });
});

export default router;