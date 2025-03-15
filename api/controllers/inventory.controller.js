import Inventory from '../models/inventory.model.js';

// Create new inventory item
export const createInventory = async (req, res) => {
    try {
        const newInventory = new Inventory(req.body);
        const savedInventory = await newInventory.save();
        res.status(201).json(savedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all inventory items
export const getAllInventory = async (req, res) => {
    try {
        const inventoryItems = await Inventory.find();
        res.json(inventoryItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get inventory item by ID
export const getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findOne({ inventoryID: req.params.id });
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update inventory item
export const updateInventory = async (req, res) => {
    try {
        const updatedInventory = await Inventory.findOneAndUpdate(
            { inventoryID: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedInventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json(updatedInventory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete inventory item
export const deleteInventory = async (req, res) => {
    try {
        const deletedInventory = await Inventory.findOneAndDelete({ inventoryID: req.params.id });
        if (!deletedInventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }
        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get inventory by category
export const getInventoryByCategory = async (req, res) => {
    try {
        const inventoryItems = await Inventory.find({ Category: req.params.category });
        res.json(inventoryItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
    try {
        const lowStockItems = await Inventory.find({ StockStatus: 'low-stock' });
        res.json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update stock status
export const updateStockStatus = async (req, res) => {
    try {
        const inventory = await Inventory.findOne({ inventoryID: req.params.id });
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        // Update stock status based on quantity and reorder threshold
        if (inventory.Quantity <= 0) {
            inventory.StockStatus = 'out-of-stock';
        } else if (inventory.Quantity <= inventory.reorderThreshold) {
            inventory.StockStatus = 'low-stock';
        } else {
            inventory.StockStatus = 'in-stock';
        }

        const updatedInventory = await inventory.save();
        res.json(updatedInventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};