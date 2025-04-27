// routes/feedback.routes.js
import express from 'express';
import * as feedbackController from '../controllers/feedback.controller.js';

const router = express.Router();

router.post('/create', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback);
router.get('/:userId', feedbackController.getFeedbackByUserId);
router.put('/:id', feedbackController.updateFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

export default router;