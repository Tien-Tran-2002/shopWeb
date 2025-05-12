const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import model Product
const Comment = require('../models/Comment');

// Trang chủ hiển thị danh sách sản phẩm
router.get('/', async (req, res) => {
    try {
        const products = await Product.find(); // Lấy tất cả sản phẩm từ DB

        // Kiểm tra xem người dùng đã đăng nhập chưa
        const currentUser = req.user ? req.user : null;

        // Truyền products và currentUser vào view
        res.render('index', { products, currentUser}); 
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

// API tìm kiếm nhanh trên navbar
router.get('/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        if (!keyword) {
            return res.json([]); // Trả mảng rỗng nếu không nhập gì
        }

        // Tìm sản phẩm theo tên (không phân biệt hoa thường)
        const products = await Product.find({ 
            name: { $regex: keyword, $options: 'i' }
        }).limit(10); // Giới hạn 10 sản phẩm

        res.json(products); // Trả về JSON
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Trang chi tiết sản phẩm
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Tìm sản phẩm theo ID
        if (!product) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }

        // Lấy tất cả đánh giá của sản phẩm này
        const comments = await Comment.find({ productId: product._id });

        res.render('product-detail', { product, comments, user: req.user });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

// Thêm đánh giá vào sản phẩm
router.post('/:id/review', async (req, res) => {
    const { rating, comment } = req.body; // Lấy rating và comment từ form
    const username = req.user?.username || 'Ẩn danh';

    try {
        // Tìm sản phẩm theo ID
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }

        // Tạo mới một Comment
        const newComment = new Comment({
            productId: product._id,
            username,
            rating,
            comment,
        });

        // Lưu đánh giá mới
        await newComment.save();

        // Cập nhật rating trung bình của sản phẩm
        await product.updateAverageRating();

        // Lưu lại thông tin sản phẩm
        await product.save();

        // Sau khi gửi đánh giá, redirect lại trang chi tiết sản phẩm
        res.redirect(`/products/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi gửi đánh giá');
    }
});





module.exports = router;
