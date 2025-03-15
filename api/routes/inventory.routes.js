import express from 'express';
import {
    createInventory,
    getAllInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    getInventoryByCategory,
    getLowStockItems,
    updateStockStatus
} from '../controllers/inventory.controller.js';

const router = express.Router();

// Basic CRUD routes
router.post('/', createInventory);
router.get('/', getAllInventory);
router.get('/:id', getInventoryById);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);

// Additional routes
router.get('/category/:category', getInventoryByCategory);
router.get('/status/low-stock', getLowStockItems);
router.put('/:id/stock-status', updateStockStatus);

export default router;
