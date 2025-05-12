const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  userId: String, // sessionID hoặc userID nếu có đăng nhập
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', cartItemSchema);
