import express from 'express';
import { 
  createCustomOrder, 
  getAllCustomOrders, 
  getUserCustomOrders, 
  getCustomOrderById,
  updateCustomOrderStatus,
  approveAndConvertToOrder,
  rejectCustomOrder,
  deleteCustomOrder
} from '../controllers/customOrder.controller.js';

const router = express.Router();

// Public routes
router.post('/create', createCustomOrder);
router.get('/', getAllCustomOrders);
router.get('/user/:userId', getUserCustomOrders);
router.get('/:id', getCustomOrderById);

// Status management routes
router.put('/:id/status', updateCustomOrderStatus);
router.put('/:id/approve', approveAndConvertToOrder);
router.put('/:id/reject', rejectCustomOrder);
router.delete('/:id', deleteCustomOrder);

export default router;
