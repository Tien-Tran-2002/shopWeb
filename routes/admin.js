const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Order = require('../models/Order');

// Hàm dùng để tìm kiếm sản phẩm (để tái sử dụng)
function searchProducts(search) {
    const query = search ? { name: new RegExp(search, 'i') } : {};
    return Product.find(query);
}

// Trang Dashboard cho Admin
router.get('/dashboard', async (req, res) => {
    const search = req.query.search || ''; // Lấy từ query params
    try {
        const products = await searchProducts(search); // Tìm sản phẩm
        res.render('admin-dashboard', { products, search, product: null });
    } catch (err) {
        console.log(err);
        res.status(500).send('Lỗi khi tải dữ liệu sản phẩm.');
    }
});

// Thêm sản phẩm mới (admin) - POST request
router.post('/products/new', async (req, res) => {
    const { name, description, price, image, category, saleprice } = req.body;
    try {
        const newProduct = new Product({ name, description, price, image,  category, saleprice });
        await newProduct.save();
        req.flash('success', 'Sản phẩm đã được thêm thành công');
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.log(err);
        req.flash('error', 'Có lỗi khi thêm sản phẩm');
        res.redirect('/admin/products/new');
    }
});

// Sửa sản phẩm (admin) - GET request
router.get('/products/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product); // Trả về JSON sản phẩm
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Sửa sản phẩm (admin) - POST request
router.post('/products/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, image, category, saleprice } = req.body;

    try {
        const product = await Product.findById(id);
        if (!product) {
            req.flash('error', 'Không tìm thấy sản phẩm');
            return res.redirect('/admin/dashboard');
        }

        // Cập nhật thông tin sản phẩm
        product.name = name;
        product.description = description;
        product.price = price;
        product.image = image;
        product.category = category;
        product.saleprice = saleprice;

        await product.save(); // Lưu thay đổi vào cơ sở dữ liệu

        req.flash('success', 'Cập nhật sản phẩm thành công');
        res.redirect('/admin/dashboard'); // Quay lại trang danh sách sản phẩm
    } catch (err) {
        console.log(err);
        req.flash('error', 'Có lỗi xảy ra khi cập nhật sản phẩm');
        res.redirect('/admin/dashboard');
    }
});

// Xoá sản phẩm (admin)
router.get('/products/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Product.findByIdAndDelete(id);
        req.flash('success', 'Sản phẩm đã được xoá thành công');
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.log(err);
        req.flash('error', 'Có lỗi khi xoá sản phẩm');
        res.redirect('/admin/dashboard');
    }
});

// Sửa Comment (admin) - GET request
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ productId: req.params.id });

        const formattedComments = comments.map(c => ({
            _id: c._id,
            userName: c.username,
            rating: c.rating,
            comment: c.comment
        }));

        res.json(formattedComments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Sửa Comment (admin) - DELETE request
router.delete('/:productId/comments/:commentId', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.commentId);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Xoá thất bại');
    }
});

// Lấy danh sách người dùng (admin)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username email role');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi tải danh sách người dùng');
    }
});

// Thêm người dùng (admin) - POST request
router.post('/users', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Kiểm tra email đã tồn tại chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email đã được sử dụng.' });
        }

        // Tạo người dùng mới
        const user = new User({ username, email, password, role });
        await user.save();

        res.status(201).json({ message: 'Người dùng đã được thêm thành công.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi thêm người dùng.' });
    }
});

// Sửa người dùng (admin) - PUT request
router.post('/users', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Kiểm tra email đã tồn tại chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email đã được sử dụng.' });
        }

        // Tạo người dùng mới
        const user = new User({ username, email, password, role });
        await user.save();

        res.status(201).json({ message: 'Người dùng đã được thêm thành công.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi thêm người dùng.' });
    }
});

// Xoá người dùng (admin) - DELETE request
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        res.json({ message: 'Người dùng đã được xóa thành công.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi xóa người dùng.' });
    }
});

// Lấy thông tin người dùng (admin) - GET request
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send({ message: "Người dùng không tồn tại." });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Lỗi server." });
    }
});

// Lấy danh sách đơn hàng (admin)
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find({},'_id username email totalAmount status');
        res.json(orders);
    } catch (err) {
        console.log(err);
        res.status(500).send('Lỗi khi tải danh sách đơn hàng');
    }
});


// Sửa đơn hàng (admin) - GET request
router.get('/orders/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findById(id).populate('userId', 'username');
        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }
        res.render('edit-order', { order });
    } catch (err) {


// Cập nhật đơn hàng (admin) - POST request
router.post('/orders/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { status, totalAmount } = req.body;  // Thông tin cần cập nhật

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        // Cập nhật thông tin đơn hàng
        order.status = status || order.status;
        order.totalAmount = totalAmount || order.totalAmount;

        await order.save(); // Lưu thay đổi vào cơ sở dữ liệu

        req.flash('success', 'Cập nhật đơn hàng thành công');
        res.redirect('/admin/orders'); // Quay lại trang danh sách đơn hàng
    } catch (err) {
        console.log(err);
        req.flash('error', 'Có lỗi xảy ra khi cập nhật đơn hàng');
        res.redirect('/admin/orders');
    }
});

        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Xoá đơn hàng (admin)
router.delete('/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng để xoá' });
        }
        req.flash('success', 'Đơn hàng đã được xoá thành công');
        res.redirect('/admin/orders');
    } catch (err) {
        console.log(err);
        req.flash('error', 'Có lỗi khi xoá đơn hàng');
        res.redirect('/admin/orders');
    }
});


module.exports = router;
