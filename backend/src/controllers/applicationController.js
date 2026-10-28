import Application, {
  ALLOWED_TRANSITIONS,
  FINAL_STATUSES,
  JOB_TYPES,
  VALID_STATUSES
} from '../models/Application.js';
import { generateApplicationId } from '../utils/idGenerator.js';

// @desc    Get all applications with optional search and status filter
// @route   GET /api/applications
export const getApplications = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim() !== '') {
      filter.company = { $regex: search.trim(), $options: 'i' };
    }

    const applications = await Application.find(filter).sort({ createdAt: -1 });

    // Aggregate stats for quick overview
    const statsAggregation = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Accepted: 0,
      Declined: 0,
      Rejected: 0,
      overdue: 0
    };

    const allAppsForOverdue = await Application.find({ status: 'Applied' }).select('followUpDate');
    const now = new Date();
    allAppsForOverdue.forEach((app) => {
      if (app.followUpDate && now > new Date(app.followUpDate)) {
        stats.overdue += 1;
      }
    });

    statsAggregation.forEach((item) => {
      if (stats[item._id] !== undefined) {
        stats[item._id] = item.count;
      }
      stats.total += item.count;
    });

    res.status(200).json({
      success: true,
      message: 'Applications fetched successfully',
      data: {
        applications,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch applications: ${error.message}`,
      data: null
    });
  }
};

// @desc    Get counts & stats summary
// @route   GET /api/applications/stats
export const getApplicationStats = async (req, res) => {
  try {
    const statsAggregation = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Accepted: 0,
      Declined: 0,
      Rejected: 0,
      overdue: 0
    };

    const appliedApps = await Application.find({ status: 'Applied' }).select('followUpDate');
    const now = new Date();
    appliedApps.forEach((app) => {
      if (app.followUpDate && now > new Date(app.followUpDate)) {
        stats.overdue += 1;
      }
    });

    statsAggregation.forEach((item) => {
      if (stats[item._id] !== undefined) {
        stats[item._id] = item.count;
      }
      stats.total += item.count;
    });

    res.status(200).json({
      success: true,
      message: 'Application stats fetched successfully',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch stats: ${error.message}`,
      data: null
    });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
        data: null
      });
    }

    const nextAllowedTransitions = ALLOWED_TRANSITIONS[application.status] || [];

    res.status(200).json({
      success: true,
      message: 'Application details fetched successfully',
      data: {
        ...application.toJSON(),
        allowedNextStatuses: nextAllowedTransitions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch application: ${error.message}`,
      data: null
    });
  }
};

// @desc    Create a new application
// @route   POST /api/applications
export const createApplication = async (req, res) => {
  try {
    const { company, jobRole, jobType, appliedDate, expectedSalary, notes } = req.body;

    // Validate required fields
    if (!company || !company.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required',
        data: null
      });
    }

    if (!jobRole || !jobRole.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required',
        data: null
      });
    }

    if (!jobType || !JOB_TYPES.includes(jobType)) {
      return res.status(400).json({
        success: false,
        message: `Job type must be one of: ${JOB_TYPES.join(', ')}`,
        data: null
      });
    }

    if (!appliedDate) {
      return res.status(400).json({
        success: false,
        message: 'Applied date is required',
        data: null
      });
    }

    const parsedAppliedDate = new Date(appliedDate);
    if (isNaN(parsedAppliedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid applied date format',
        data: null
      });
    }

    // Backend validation: Applied Date cannot be a future date
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    if (parsedAppliedDate > todayEnd) {
      return res.status(400).json({
        success: false,
        message: 'Applied date cannot be in the future',
        data: null
      });
    }

    // Duplicate rule check:
    // "The same Company and Job Role (case-insensitive) must not be added again while an earlier application for it is still active (not in a final status). Return status 409 and show the message on the form."
    const existingActiveApplication = await Application.findOne({
      company: { $regex: `^${company.trim()}$`, $options: 'i' },
      jobRole: { $regex: `^${jobRole.trim()}$`, $options: 'i' },
      status: { $nin: FINAL_STATUSES }
    });

    if (existingActiveApplication) {
      return res.status(409).json({
        success: false,
        message: `An active application (${existingActiveApplication.applicationId}) for '${jobRole.trim()}' at '${company.trim()}' already exists with status '${existingActiveApplication.status}'. You cannot create a duplicate until it reaches a final status (Rejected, Accepted, or Declined).`,
        data: null
      });
    }

    // Auto-generate Application ID
    const applicationId = await generateApplicationId(company.trim());

    // Auto Follow-up Date: 7 days after the Applied Date
    const followUpDate = new Date(parsedAppliedDate);
    followUpDate.setDate(followUpDate.getDate() + 7);

    // Initial status history
    const initialStatusHistory = [
      {
        status: 'Applied',
        changedAt: new Date(),
        comment: 'Application recorded'
      }
    ];

    const application = new Application({
      applicationId,
      company: company.trim(),
      jobRole: jobRole.trim(),
      jobType,
      appliedDate: parsedAppliedDate,
      expectedSalary: expectedSalary ? Number(expectedSalary) : null,
      notes: notes ? notes.trim() : '',
      status: 'Applied',
      followUpDate,
      statusHistory: initialStatusHistory
    });

    const savedApplication = await application.save();

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: savedApplication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create application: ${error.message}`,
      data: null
    });
  }
};

// @desc    Edit application (Company, Role, Job Type, Salary, Notes)
// @route   PUT /api/applications/:id
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { company, jobRole, jobType, expectedSalary, notes } = req.body;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
        data: null
      });
    }

    // Disallow editing Application ID and Applied Date
    if (req.body.applicationId && req.body.applicationId !== application.applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID cannot be modified after creation',
        data: null
      });
    }

    if (req.body.appliedDate) {
      const origDate = new Date(application.appliedDate).toISOString().split('T')[0];
      const newDate = new Date(req.body.appliedDate).toISOString().split('T')[0];
      if (origDate !== newDate) {
        return res.status(400).json({
          success: false,
          message: 'Applied date cannot be modified after creation',
          data: null
        });
      }
    }

    const updatedCompany = company ? company.trim() : application.company;
    const updatedRole = jobRole ? jobRole.trim() : application.jobRole;

    // Check duplicate rule if company or role is changed
    if (
      (updatedCompany.toLowerCase() !== application.company.toLowerCase() ||
        updatedRole.toLowerCase() !== application.jobRole.toLowerCase()) &&
      !FINAL_STATUSES.includes(application.status)
    ) {
      const existingConflict = await Application.findOne({
        _id: { $ne: application._id },
        company: { $regex: `^${updatedCompany}$`, $options: 'i' },
        jobRole: { $regex: `^${updatedRole}$`, $options: 'i' },
        status: { $nin: FINAL_STATUSES }
      });

      if (existingConflict) {
        return res.status(409).json({
          success: false,
          message: `Cannot update: An active application for '${updatedRole}' at '${updatedCompany}' already exists.`,
          data: null
        });
      }
    }

    if (jobType && !JOB_TYPES.includes(jobType)) {
      return res.status(400).json({
        success: false,
        message: `Job type must be one of: ${JOB_TYPES.join(', ')}`,
        data: null
      });
    }

    application.company = updatedCompany;
    application.jobRole = updatedRole;
    if (jobType) application.jobType = jobType;
    if (expectedSalary !== undefined) {
      application.expectedSalary = expectedSalary !== '' && expectedSalary !== null ? Number(expectedSalary) : null;
    }
    if (notes !== undefined) application.notes = notes.trim();

    const updatedApp = await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update application: ${error.message}`,
      data: null
    });
  }
};

// @desc    Update application status (Workflow state transition)
// @route   PATCH /api/applications/:id/status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: nextStatus, comment } = req.body;

    if (!nextStatus || !VALID_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        data: null
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
        data: null
      });
    }

    const currentStatus = application.status;

    // Check if current status is final
    if (FINAL_STATUSES.includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status '${currentStatus}' is a final status and cannot be changed`,
        data: null
      });
    }

    // Check allowed transitions
    const validTransitions = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!validTransitions.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from '${currentStatus}' to '${nextStatus}'. Allowed transitions: ${validTransitions.length ? validTransitions.join(', ') : 'None (Final status)'}`,
        data: null
      });
    }

    // Apply valid transition
    application.status = nextStatus;
    application.statusHistory.push({
      status: nextStatus,
      changedAt: new Date(),
      comment: comment ? comment.trim() : `Status transitioned to ${nextStatus}`
    });

    const savedApp = await application.save();

    res.status(200).json({
      success: true,
      message: `Application status transitioned from ${currentStatus} to ${nextStatus}`,
      data: savedApp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update status: ${error.message}`,
      data: null
    });
  }
};

// @desc    Delete an application
// @route   DELETE /api/applications/:id
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
        data: null
      });
    }

    // Delete Rule:
    // "An application can be deleted only if its status is Applied or in a final status. Applications in Interview or Offer status must not be deleted, and the backend must return an error in that case."
    if (application.status === 'Interview' || application.status === 'Offer') {
      return res.status(400).json({
        success: false,
        message: `Applications in '${application.status}' status cannot be deleted. Only applications with status 'Applied' or final statuses (Rejected, Accepted, Declined) can be deleted.`,
        data: null
      });
    }

    await Application.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Application ${application.applicationId} was deleted successfully`,
      data: { id: application._id, applicationId: application.applicationId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to delete application: ${error.message}`,
      data: null
    });
  }
};
