import Job from '../models/jobModel.js';

// Create new job
export const createJob = async (req, res) => {
    try {
        const { title, description, experienceLevel, location, salary, deadlineDate } = req.body;

        if (!title || !description || !experienceLevel || !location || !salary || !deadlineDate) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const job = new Job({
            title,
            description,
            experienceLevel,
            location,
            salary,
            deadlineDate,
            companyId: req.user.userId,
        });

        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all jobs with filters (for students)
export const getAllJobs = async (req, res) => {
    try {
        const { experienceLevel, location } = req.query;
        let query = {};

        if (experienceLevel) query.experienceLevel = experienceLevel;
        if (location) query.location = location;
        query.deadlineDate = { $gt: new Date() };

        const jobs = await Job.find(query)
            .populate('companyId', 'profile.companyName')
            .select('-applicants')
            .sort({ createdAt: -1 });

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get job by ID (for students)
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('companyId', 'profile.companyName')
            .select('-applicants');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Get company's posted jobs
export const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ companyId: req.user.userId })
            .sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get applicants for company's jobs
export const getApplicants = async (req, res) => {
    try {
        const jobs = await Job.find({ companyId: req.user.userId })
            .populate('applicants.studentId', 'profile.name profile.email profile.education profile.skills')
            .select('title applicants');

        const applicants = jobs.map(job => ({
            jobTitle: job.title,
            applicants: job.applicants.map(a => ({
                student: a.studentId,
                appliedAt: a.appliedAt,
                status: a.status
            }))
        }));

        res.status(200).json(applicants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Apply for job (students)
export const applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (new Date(job.deadlineDate) < new Date()) {
            return res.status(400).json({ message: 'Deadline passed' });
        }

        const alreadyApplied = job.applicants.some(
            applicant => applicant.studentId.toString() === req.user.userId
        );

        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied' });
        }

        job.applicants.push({
            studentId: req.user.userId,
            appliedAt: new Date(),
            status: 'pending'
        });

        await job.save();
        res.status(200).json({ message: 'Applied successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update job
export const updateJob = async (req, res) => {
    try {
        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.userId },
            { $set: req.body },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};