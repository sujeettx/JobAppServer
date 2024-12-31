import Job from '../models/jobModel.js';
// Error handler utility
const handleError = (res, error, customMessage) => {
    console.error('Error:', error);
    const status = error.status || 500;
    const message = customMessage || error.message || 'Internal server error';
    return res.status(status).json({ success: false, message });
};

// Create new job
export const createJob = async (req, res) => {
    try {
        const { title, description, requirements, experienceLevel, location, salary, deadlineDate, 
               employmentType, openings, jobHighlights, keySkills } = req.body;

        // Validate required fields
        const requiredFields = ['title', 'description', 'experienceLevel', 'location', 'salary', 'deadlineDate'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const job = new Job({
            title, 
            description,
            requirements,
            experienceLevel,
            location, 
            salary, 
            deadlineDate, 
            employmentType,
            openings,
            jobHighlights,
            keySkills,
            companyId: req.user.userId,
        });

        await job.save();
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        handleError(res, error, 'Error creating job');
    }
};

// Create multiple jobs
export const createMultipleJobs = async (req, res) => {
    try {
        const { jobs } = req.body;

        if (!Array.isArray(jobs) || jobs.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of jobs'
            });
        }

        // Validate each job and add companyId
        const jobsToCreate = jobs.map(job => ({
            ...job,
            companyId: req.user.userId
        }));

        // Validate required fields for all jobs
        const requiredFields = ['title', 'description', 'experienceLevel', 'location', 'salary', 'deadlineDate'];
        const invalidJobs = jobsToCreate.filter(job => 
            requiredFields.some(field => !job[field])
        );

        if (invalidJobs.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some jobs are missing required fields',
                invalidJobs
            });
        }

        const createdJobs = await Job.insertMany(jobsToCreate);
        res.status(201).json({ success: true, data: createdJobs });
    } catch (error) {
        handleError(res, error, 'Error creating multiple jobs');
    }
};
// Get all jobs with filters (for students)
export const getAllJobs = async (req, res) => {
    try {
        const { experienceLevel, location, employmentType, keySkills } = req.query;
        let query = { deadlineDate: { $gt: new Date() } };
        
        if (experienceLevel) query.experienceLevel = experienceLevel;
        if (location) query.location = location;
        if (employmentType) query.employmentType = employmentType;
        if (keySkills) query.keySkills = { $in: keySkills.split(',') };
        
        const jobs = await Job.find(query)
            .populate('companyId', 'profile.companyName profile.industry profile.website email')
            .select('-applicants')
            .sort({ createdAt: -1 });
        
        res.status(200).json(jobs);
    } catch (error) {
        handleError(res, error, 'Error fetching jobs');
    }
};

// Get job by ID (for students)
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('companyId', 'profile.companyName profile.industry profile.website email')
            .select('-applicants');
        
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        
        res.status(200).json(job);
    } catch (error) {
        handleError(res, error, 'Error fetching job');
    }
};

// Get company's posted jobs
export const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ companyId: req.params.id })
            .sort({ createdAt: -1 })
            .populate('applicants','studentId')
        res.status(200).json(jobs);
    } catch (error) {
        handleError(res, error, 'Error fetching company jobs');
    }
};

// Get applicants for company's jobs
export const getApplicants = async (req, res) => {
    try {
        const jobs = await Job.find({ companyId: req.user.userId })
            .populate('applicants.studentId', 'profile.fullName profile.resume profile.portfolio')
            .select('title applicants');

        const applicants = jobs.map(job => ({
            jobTitle: job.title,
            applicants: job.applicants.map(a => ({
                student: a.prfile.fullName,
                appliedAt: a.appliedAt,
                resume: a.prfile.resume,
                portfolio: a.prfile.portfolio,
            }))
        }));

        res.status(200).json({ success: true, data: applicants });
    } catch (error) {
        handleError(res, error, 'Error fetching applicants');
    }
};

// Apply for job (students)
export const applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (new Date(job.deadlineDate) < new Date()) {
            return res.status(400).json({ success: false, message: 'Application deadline has passed' });
        }

        const alreadyApplied = job.applicants.some(
            applicant => applicant.studentId.toString() === req.user.userId
        );

        if (alreadyApplied) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }

        job.applicants.push({
            studentId: req.user.userId,
            appliedAt: new Date(),
        });

        await job.save();
        res.status(200).json({ success: true, message: 'Applied successfully' });
    } catch (error) {
        handleError(res, error, 'Error applying for job');
    }
};

// Update job
export const updateJob = async (req, res) => {
    try {
        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.userId },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
        }

        res.status(200).json({ success: true, data: job });
    } catch (error) {
        handleError(res, error, 'Error updating job');
    }
};

// Delete job
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ 
            _id: req.params.id, 
            companyId: req.user.userId 
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
        }

        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        handleError(res, error, 'Error deleting job');
    }
};