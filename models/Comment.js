const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Liên kết đến sản phẩm
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Tự động tạo trường createdAt và updatedAt

module.exports = mongoose.model('Comment', commentSchema);
