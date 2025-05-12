const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Khai báo schema cho sản phẩm
const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], // Liên kết với Comment
    rating: { type: Number, default: 0 },
    category: { type: String, required: true },
    saleprice: { type: Number },
    createdAt: { type: Date, default: Date.now },  // Thêm trường createdAt với giá trị mặc định là thời gian hiện tại
});

// Phương thức để cập nhật đánh giá trung bình
productSchema.methods.updateAverageRating = async function() {
    try {
        // Lấy tất cả các đánh giá liên quan đến sản phẩm này
        const comments = await mongoose.model('Comment').find({ productId: this._id });
        const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
        const averageRating = comments.length ? totalRating / comments.length : 0;
        
        // Cập nhật rating trung bình cho sản phẩm
        this.rating = averageRating;
        await this.save();
    } catch (err) {
        console.error('Error updating average rating:', err);
    }
};

// Tạo model từ schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
