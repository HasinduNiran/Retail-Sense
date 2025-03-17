import express from 'express';
import multer from 'multer';
import path from 'path';
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

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Timestamp + original filename
    }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    }
});

// Routes that need image upload handling
router.post('/', upload.single('image'), createInventory);
router.put('/:id', upload.single('image'), updateInventory);

// Basic routes without file handling
router.get('/', getAllInventory);
router.get('/:id', getInventoryById);
router.delete('/:id', deleteInventory);

// The problem with these routes is that they conflict with /:id
// We need to make them more specific to ensure proper routing
// Moving them before the /:id route will solve this

// Additional routes
// These need to be BEFORE the /:id route to avoid conflicts
router.get('/category/:category', getInventoryByCategory);
router.get('/status/low-stock', getLowStockItems);
router.put('/:id/stock-status', updateStockStatus);

export default router;