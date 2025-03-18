import mongoose from 'mongoose';

const retrievedInventorySchema = new mongoose.Schema({
    inventoryID: {
        type: Number,
        required: true,
        ref: 'Inventory'
    },
    ItemName: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    retrievedQuantity: {
        type: Number,
        required: true,
        min: 1
    },
    Brand: {
        type: String,
        required: true
    },
    Sizes: {
        type: [String],
        required: true
    },
    Colors: {
        type: [String],
        required: true
    },
    Gender: {
        type: String,
        enum: ['Men', 'Women', 'Unisex'], // Add 'Men' to allowed values
        required: false
      },
    Style: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    unitPrice: {
        type: Number,
        required: false  // Make unit price optional
      },
    retrievedDate: {
        type: Date,
        default: Date.now
    }
});

const RetrievedInventory = mongoose.model('RetrievedInventory', retrievedInventorySchema);
export default RetrievedInventory;
