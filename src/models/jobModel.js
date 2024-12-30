import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    requirements: {
        type: [String],
        required: true
    },
    experienceLevel: {
        type: String,
        required: true,
        enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Expert Level']
    },
    employmentType: {
        type: String,
        required: true,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']
    },
    openings: {
        type: Number,
        required: true,
        min: 1
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    salary: {
        type: String,
        required: true,
        trim: true
    },
    deadlineDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Deadline date must be in the future'
        }
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobHighlights: {
        type: [String],
        default: []
    },
    keySkills: {
        type: [String],
        required: true
    },
    applicants: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    }],
    applicantCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for company details
JobSchema.virtual('companyDetails', {
    ref: 'User',
    localField: 'companyId',
    foreignField: '_id',
    justOne: true
});

const Job = mongoose.model('Job', JobSchema);
export default Job;