const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Lưu ID người dùng (nếu có đăng nhập)
    username: String,
    email: String,
    phone: String,
    address: String,
    province: String,
    district: String,
    ward: String,
    paymentMethod: String, // Phương thức thanh toán
    items: [
        {
            itemId: mongoose.Schema.Types.ObjectId,  // ID sản phẩm
            name: String,
            quantity: Number,
            price: Number
        }
    ],
    totalAmount: Number,  // Tổng giá trị đơn hàng
    status: { type: String, default: 'Đang xử lý' },  // Trạng thái đơn hàng
    createdAt: { type: Date, default: Date.now }
});

// Tạo model từ schema
module.exports = mongoose.model('Order', orderSchema);
