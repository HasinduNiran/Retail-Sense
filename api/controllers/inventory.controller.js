import Inventory from '../models/inventory.model.js';
import RetrievedInventory from '../models/retrievedInventory.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create new inventory item
export const createInventory = async (req, res) => {
    try {
        // Check if either file or image URL is provided
        if (!req.file && !req.body.image) {
            return res.status(400).json({ message: 'Image is required' });
        }

        // Handle image path
        let imagePath;
        if (req.file) {
            // For form uploads, store relative path
            imagePath = path.join('uploads', 'inventory', path.basename(req.file.path)).replace(/\\/g, '/');
        } else {
            // For direct API requests, ensure path is relative
            const absolutePath = req.body.image;
            if (absolutePath.includes('uploads/inventory')) {
                // If already in correct format, use as is
                imagePath = absolutePath;
            } else {
                // Convert absolute path to relative path
                imagePath = path.join('uploads', 'inventory', path.basename(absolutePath)).replace(/\\/g, '/');
            }
        }

        // Parse numeric fields
        const parsedData = {
            ...req.body,
            Quantity: parseInt(req.body.Quantity),
            reorderThreshold: parseInt(req.body.reorderThreshold),
            image: imagePath
        };

        // Handle arrays
        if (req.body.Sizes) {
            parsedData.Sizes = req.body.Sizes.split(',').map(size => size.trim());
        }
        if (req.body.Colors) {
            parsedData.Colors = req.body.Colors.split(',').map(color => color.trim());
        }

        const newInventory = new Inventory(parsedData);
        const savedInventory = await newInventory.save();
        res.status(201).json(savedInventory);
    } catch (error) {
        console.error('Error creating inventory:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Failed to create inventory item', error: error.message });
    }
};

// Get all inventory items with pagination
export const getAllInventory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [inventoryItems, total] = await Promise.all([
            Inventory.find()
                .skip(skip)
                .limit(parseInt(limit)),
            Inventory.countDocuments()
        ]);

        res.json({
            items: inventoryItems,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch inventory items', error: error.message });
    }
};

// Get inventory item by ID
export const getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findOne({ inventoryID: parseInt(req.params.id) });
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch inventory item', error: error.message });
    }
};

// Update inventory item
export const updateInventory = async (req, res) => {
    try {
        // Handle image path if file is uploaded
        let imagePath;
        if (req.file) {
            // For form uploads, store relative path
            imagePath = path.join('uploads', 'inventory', path.basename(req.file.path)).replace(/\\/g, '/');
        } else if (req.body.image) {
            // For direct API requests, ensure path is relative
            const absolutePath = req.body.image;
            if (absolutePath.includes('uploads/inventory')) {
                // If already in correct format, use as is
                imagePath = absolutePath;
            } else {
                // Convert absolute path to relative path
                imagePath = path.join('uploads', 'inventory', path.basename(absolutePath)).replace(/\\/g, '/');
            }
        }

        const updateData = {
            ...req.body,
            ...(imagePath && { image: imagePath }),
            ...(req.body.Sizes && { 
                Sizes: Array.isArray(req.body.Sizes) ? req.body.Sizes : req.body.Sizes.split(',')
            }),
            ...(req.body.Colors && { 
                Colors: Array.isArray(req.body.Colors) ? req.body.Colors : req.body.Colors.split(',')
            })
        };

        const updatedInventory = await Inventory.findOneAndUpdate(
            { inventoryID: parseInt(req.params.id) },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedInventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        res.json(updatedInventory);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update inventory item', error: error.message });
    }
};

// Delete inventory item
export const deleteInventory = async (req, res) => {
    try {
        const deletedInventory = await Inventory.findOneAndDelete({ 
            inventoryID: parseInt(req.params.id) 
        });
        
        if (!deletedInventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        res.json({ message: 'Inventory item deleted successfully', inventoryID: deletedInventory.inventoryID });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete inventory item', error: error.message });
    }
};

// Get inventory by category
export const getInventoryByCategory = async (req, res) => {
    try {
        const inventoryItems = await Inventory.find({ 
            Category: req.params.category 
        });
        
        if (!inventoryItems.length) {
            return res.status(404).json({ message: 'No items found in this category' });
        }
        
        res.json(inventoryItems);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch category items', error: error.message });
    }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
    try {
        const lowStockItems = await Inventory.find({ 
            StockStatus: 'low-stock' 
        });
        
        res.json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch low stock items', error: error.message });
    }
};

// Update stock status
export const updateStockStatus = async (req, res) => {
    try {
        const { inventoryID } = req.params;
        const { Quantity, action, unitPrice } = req.body;

        // Find the inventory item
        const inventoryItem = await Inventory.findOne({ inventoryID: parseInt(inventoryID) });
        if (!inventoryItem) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        // Update quantity
        const newQuantity = parseInt(Quantity);
        if (isNaN(newQuantity) || newQuantity < 0) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        // If this is a retrieve action, save to RetrievedInventory
        if (action === 'retrieve') {
            const retrievedQuantity = inventoryItem.Quantity - newQuantity;
            const retrievedItem = new RetrievedInventory({
                inventoryID: inventoryItem.inventoryID,
                ItemName: inventoryItem.ItemName,
                Category: inventoryItem.Category,
                retrievedQuantity,
                Brand: inventoryItem.Brand,
                Sizes: inventoryItem.Sizes,
                Colors: inventoryItem.Colors,
                Gender: inventoryItem.Gender,
                Style: inventoryItem.Style,
                image: inventoryItem.image,
                unitPrice: inventoryItem.unitPrice || unitPrice
            });

            await retrievedItem.save();
        }

        // Update stock status based on new quantity
        let stockStatus = 'in-stock';
        if (newQuantity <= 0) {
            stockStatus = 'out-of-stock';
        } else if (newQuantity <= inventoryItem.reorderThreshold) {
            stockStatus = 'low-stock';
        }

        // Update the inventory item
        const updatedInventory = await Inventory.findOneAndUpdate(
            { inventoryID: parseInt(inventoryID) },
            { 
                $set: { 
                    Quantity: newQuantity, 
                    StockStatus: stockStatus,
                    ...(action === 'add' && unitPrice && { unitPrice })
                } 
            },
            { new: true }
        );

        res.json(updatedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all retrieved inventory items
export const getRetrievedInventory = async (req, res) => {
    try {
        const retrievedItems = await RetrievedInventory.find()
            .sort({ retrievedDate: -1 }); // Sort by most recent first

        res.json(retrievedItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};