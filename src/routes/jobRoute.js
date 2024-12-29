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
router.get('/',authorize(['student']),getAllJobs);                              // tested
router.get('/:id',authorize(['student']),getJobById ); // get job by id         // tested
router.post('/:id/apply', authorize(['student']), applyForJob);                 // tested

// Company routes
router.post('/', authorize(['company']), createJob);                             // tested
router.get('/my/:id',getMyJobs);                                                 // tested    later on for again testing      
router.get('/applicants', authorize(['company']), getApplicants);                // later test
router.put('/:id', authorize(['company']), updateJob);                           // tested
router.delete('/:id', authorize(['company']), deleteJob);                        // test

// Error handler for invalid routes
router.use('*', (req, res) => {
    res.status(404).json({ message: 'Job route not found please again check the route url' });
});

export default router;