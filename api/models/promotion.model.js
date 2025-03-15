import mongoose, { Schema } from 'mongoose';

// Define the Promotion schema
const promotionSchema = new mongoose.Schema({
    promotionID: {
        type: Number,
        required: true,
        unique: true  
    },
    type: {
        type: String,
        enum: ['Discount Code', 'Loyalty'],  
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    promoCreatedDate: {
        type: Date,
        default: Date.now  
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    promoCode: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Create the model
const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;