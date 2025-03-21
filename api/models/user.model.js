import mongoose from 'mongoose';
// import mongooseSequence from 'mongoose-sequence'; // Import mongoose-sequence correctly

const userSchema = new mongoose.Schema({
  userID: { type: Number, unique: true },
  UserName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  mobile: { type: Number, required: true },
});

// Auto-increment for userID
// userSchema.plugin(mongooseSequence, { inc_field: 'userID' });

const User = mongoose.model('User', userSchema);

export default User;
