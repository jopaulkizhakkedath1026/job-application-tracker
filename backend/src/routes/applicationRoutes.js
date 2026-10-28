import express from 'express';
import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  getApplicationStats,
  updateApplication,
  updateApplicationStatus
} from '../controllers/applicationController.js';

const router = express.Router();

// Stats summary route
router.get('/stats', getApplicationStats);

// Application list and creation
router.route('/')
  .get(getApplications)
  .post(createApplication);

// Single application operations
router.route('/:id')
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

// Status transition route
router.patch('/:id/status', updateApplicationStatus);

export default router;
