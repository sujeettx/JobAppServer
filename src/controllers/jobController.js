import Job from '../models/jobModel.js';

// Create a new job posting
export const createJob = async (req, res) => {
    try {
        const { title, description, experienceLevel, location, salary, deadlineDate } = req.body;

        // Validate required fields
        if (!title || !description || !experienceLevel || !location || !salary || !deadlineDate) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can post jobs' });
        }

        const job = new Job({
            title,
            description,
            experienceLevel,
            location,
            salary,
            deadlineDate,
            companyId: req.user.userId,
            companyName: req.user.companyName || 'Unknown Company',
        });

        await job.save();
        res.status(201).json({ message: 'Job posted successfully', job });
    } catch (error) {
        res.status(500).json({ message: 'Error creating job', error: error.message });
    }
};

// Get all jobs with optional filters
export const getAllJobs = async (req, res) => {
    try {
        const { experienceLevel, location } = req.query;
        let query = {};

        // Add filters if provided
        if (experienceLevel) query.experienceLevel = experienceLevel;
        if (location) query.location = location;

        // Only show jobs with future deadlines
        query.deadlineDate = { $gt: new Date() };

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
};

// Get jobs posted by the logged-in company
export const getMyJobs = async (req, res) => {
    try {
        if (req.user.role !== 'company') {
            return res.status(403).json({ message: 'Only companies can view their jobs' });
        }

        const jobs = await Job.find({ 
            companyId: req.user.userId 
        }).sort({ createdAt: -1 });

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
};

// Apply for a job
export const applyForJob = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can apply for jobs' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if job deadline has passed
        if (new Date(job.deadlineDate) < new Date()) {
            return res.status(400).json({ message: 'Application deadline has passed' });
        }

        // Check if already applied
        const alreadyApplied = job.applicants.some(
            (applicant) => applicant.studentId.toString() === req.user.userId
        );
        if (alreadyApplied) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Add applicant
        job.applicants.push({ 
            studentId: req.user.userId,
            appliedAt: new Date()
        });
        await job.save();

        res.status(200).json({ message: 'Application submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error applying for job', error: error.message });
    }
};

// Delete a job (only by the company who posted it)
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.companyId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only delete your own jobs' });
        }

        await job.deleteOne();
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
};

// Update a job (only by the company who posted it)
export const updateJob = async (req, res) => {
    try {
        const { title, description, experienceLevel, location, salary, deadlineDate } = req.body;

        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.companyId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only update your own jobs' });
        }

        // Validate deadline date if provided
        if (deadlineDate && new Date(deadlineDate) < new Date()) {
            return res.status(400).json({ message: 'Deadline date must be in the future' });
        }

        // Update job fields
        if (title) job.title = title;
        if (description) job.description = description;
        if (experienceLevel) job.experienceLevel = experienceLevel;
        if (location) job.location = location;
        if (salary) job.salary = salary;
        if (deadlineDate) job.deadlineDate = deadlineDate;

        await job.save();
        res.status(200).json({ message: 'Job updated successfully', job });
    } catch (error) {
        res.status(500).json({ message: 'Error updating job', error: error.message });
    }
};