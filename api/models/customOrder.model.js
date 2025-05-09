import mongoose from 'mongoose';

const customOrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design'
  },
  imageUrl: {
    type: String,
    required: true
  },
  clothingType: {
    type: String,
    enum: ['tshirt', 'dress', 'pants', 'jacket'],
    required: true
  },
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  customerInfo: {
    name: String,
    email: String,
    mobile: String
  },
  deliveryInfo: {
    address: String,
    city: String,
    postalCode: String
  },
  convertedToOrder: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: String,
    ref: 'Order'
  },
  conversionError: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const CustomOrder = mongoose.model('CustomOrder', customOrderSchema);
export default CustomOrder;
