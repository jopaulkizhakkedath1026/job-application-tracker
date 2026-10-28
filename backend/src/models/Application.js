import mongoose from 'mongoose';

export const VALID_STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted', 'Declined'];
export const FINAL_STATUSES = ['Rejected', 'Accepted', 'Declined'];
export const JOB_TYPES = ['Full-time', 'Internship', 'Contract'];

export const ALLOWED_TRANSITIONS = {
  Applied: ['Interview', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: ['Accepted', 'Declined'],
  Rejected: [],
  Accepted: [],
  Declined: []
};

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: VALID_STATUSES
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    comment: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: {
        values: JOB_TYPES,
        message: '{VALUE} is not a valid job type. Must be Full-time, Internship, or Contract'
      }
    },
    appliedDate: {
      type: Date,
      required: [true, 'Applied date is required'],
      validate: {
        validator: function (value) {
          if (!value) return false;
          // Disallow future date (allow up to end of today UTC/local)
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return value <= today;
        },
        message: 'Applied date cannot be in the future'
      }
    },
    expectedSalary: {
      type: Number,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: VALID_STATUSES,
      default: 'Applied'
    },
    followUpDate: {
      type: Date,
      required: true
    },
    statusHistory: [statusHistorySchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for isOverdue
applicationSchema.virtual('isOverdue').get(function () {
  if (this.status !== 'Applied' || !this.followUpDate) {
    return false;
  }
  return new Date() > new Date(this.followUpDate);
});

// Helper static method for active check
applicationSchema.statics.isFinalStatus = function (status) {
  return FINAL_STATUSES.includes(status);
};

const Application = mongoose.model('Application', applicationSchema);

export default Application;
