import Inventory from '../models/inventory.model.js';

// Create new inventory item
export const createInventory = async (req, res) => {
    try {
        // Check if either file or image URL is provided
        if (!req.file && !req.body.image) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const inventoryData = {
            ...req.body,
            image: req.file ? req.file.path : req.body.image // Use file path or URL
        };

        const newInventory = new Inventory(inventoryData);
        const savedInventory = await newInventory.save();
        res.status(201).json(savedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
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
        const updateData = {
            ...req.body,
            ...(req.file && { image: req.file.path }),
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

// Update stock status and quantity
export const updateStockStatus = async (req, res) => {
    try {
        const inventory = await Inventory.findOne({ 
            inventoryID: parseInt(req.params.id) 
        });
        
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        // Allow quantity update if provided in body
        if (req.body.Quantity !== undefined) {
            inventory.Quantity = parseInt(req.body.Quantity);
        }

        // Update stock status based on quantity and threshold
        inventory.StockStatus = 
            inventory.Quantity <= 0 ? 'out-of-stock' :
            inventory.Quantity <= inventory.reorderThreshold ? 'low-stock' :
            'in-stock';

        const updatedInventory = await inventory.save();
        res.json(updatedInventory);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update stock status', error: error.message });
    }
};