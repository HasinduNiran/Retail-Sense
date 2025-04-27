import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const connection = mongoose.connection;

const feedbackSchema = new mongoose.Schema({
  userId: { 
    type: String,
    ref: 'User',
    required: true
  },
  feedbackID: { 
    type: Number, 
    unique: true 
  },
  orderId: { 
    type: String, 
    ref: 'Order',
    required: true 
  },
  orderDate: { // New field for order creation date
    type: Date,
    required: true
  },
  items: [ // New field to store item details (similar to Order.items)
    {
      itemTitle: { 
        type: String, 
        required: true, 
        trim: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      img: {
        type: String,
        required: true,
        trim: true
      }
    }
  ],
  rating: { 
    type: String, 
    required: true 
  },
  comment: { 
    type: String 
  }
});

feedbackSchema.plugin(mongooseSequence(connection), { inc_field: 'feedbackID', start_seq: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;