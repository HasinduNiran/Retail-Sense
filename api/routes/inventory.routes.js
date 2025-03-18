import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/inventory');
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        // Clean the original filename to remove spaces and special characters
        const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
        cb(null, `${Date.now()}-${cleanFileName}`);
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

// Additional routes - these need to be BEFORE the /:id route to avoid conflicts
router.get('/category/:category', getInventoryByCategory);
router.get('/status/low-stock', getLowStockItems);

// Basic routes
router.get('/', getAllInventory);
router.get('/:id', getInventoryById);
router.post('/', upload.single('image'), createInventory);
router.put('/:id', upload.single('image'), updateInventory);
router.delete('/:id', deleteInventory);
router.put('/:id/stock-status', updateStockStatus);

export default router;