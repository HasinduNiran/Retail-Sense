import mongoose, { Schema } from 'mongoose';

// Define the Inventory schema
const inventorySchema = new mongoose.Schema({
    inventoryID: {
        type: Number,
        required: true,
        unique: true // Primary key, ensures uniqueness
    },
    ItemName: {
        type: String,
        required: true,
      },
      Category: {
        type: String,
        required: true,
      },
    reorderThreshold: {
        type: Number,
        required: true // Integer for the minimum stock level before reordering
    },
    Quantity: {
        type: Number,
        required: true // Current stock quantity
    },
    Location: {
        type: String,
        required: true // Location of the item (e.g., "Warehouse A", "Aisle 5")
    },
    StockStatus: {
        type: String,
        enum: ['in-stock', 'low-stock', 'out-of-stock'], // Restricted to these values
        required: true
    },
   
    Brand: {
        type: String,
        required: true // Brand name (e.g., "Nike", "Levi's")
    },
    Sizes: [String],
    Colors: [String],
    Gender: {
        type: String,
        enum: ['Men', 'Women', 'Unisex'], // Target gender
        required: true
    },
    Style: {
        type: String,
        enum: ['Casual', 'Formal', 'Athletic'], // Style or design type
        required: true
    },
    SupplierName: {
        type: String,
        required: true,
      },
      SupplierContact: {
        type: String,
        required: true,
      }
    //   imageUrls: {
    //     type: Array,
    //     required: true,
    //   },
    //   haveOffer: {
    //     type: Boolean,
    //     required: true,
    //     default: false,
    //   }

}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create the model
const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;