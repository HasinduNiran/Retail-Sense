import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userID: { type: Number},
  feedbackID: { type: Number, unique: true },
  productID: { type: String, required: true },
  rating: { type: String, required: true},
  comment: { type: String},
  orderID: { type: String , required: true},
});


const feedback = mongoose.model('feedback', feedbackSchema);

export default feedback;

