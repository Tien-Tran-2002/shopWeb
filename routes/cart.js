const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Middleware kiểm tra đăng nhập
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Bạn cần đăng nhập trước khi đặt hàng');
    return res.redirect('/auth/login');
}

// Route hiển thị giỏ hàng
router.get('/view', async (req, res) => {
    try {
        const cart = req.session.cart || [];
        const itemIds = cart.map(item => item.itemId);
        const products = await Product.find({ _id: { $in: itemIds } });

        const cartItems = cart.map(item => {
            const product = products.find(p => p._id.toString() === item.itemId);
            return {
                product,
                quantity: item.quantity
            };
        });

        res.render('cart', { cartItems });
    } catch (err) {
        console.error('Lỗi khi hiển thị giỏ hàng:', err);
        res.status(500).send('Lỗi máy chủ');
    }
});

// API trả về JSON giỏ hàng
router.get('/', (req, res) => {
    res.json(req.session.cart || []);
});

// Thêm sản phẩm vào giỏ hàng
router.post('/add', (req, res) => {
    const { itemId, quantity } = req.body;
    if (!itemId || !quantity) {
        return res.status(400).json({ error: 'Cần cung cấp ID sản phẩm và số lượng' });
    }

    if (!req.session.cart) req.session.cart = [];

    const existingItem = req.session.cart.find(item => item.itemId === itemId);
    if (existingItem) {
        existingItem.quantity += parseInt(quantity, 10);
    } else {
        req.session.cart.push({ itemId, quantity: parseInt(quantity, 10) });
    }

    res.redirect('/cart/view');
});

// Đặt hàng (yêu cầu đăng nhập)
// Đặt hàng (thêm sản phẩm vào giỏ hàng từ trang chi tiết sản phẩm)
router.post('/order', ensureAuthenticated, (req, res) => {
    const { itemId, quantity } = req.body;
    if (!itemId || !quantity) {
        return res.status(400).json({ error: 'Thiếu ID sản phẩm hoặc số lượng' });
    }
    if (!req.session.cart) req.session.cart = [];
    const cart = req.session.cart;
    const existingItem = cart.find(i => i.itemId === itemId);
    if (existingItem) {
        existingItem.quantity += parseInt(quantity, 10);
    } else {
        cart.push({ itemId, quantity: parseInt(quantity, 10) });
    }
    req.session.cart = cart;
    req.flash('success', 'Đã thêm vào giỏ hàng');
    
    // Redirect về trang trước đó, không ép vào /cart/view
    const referer = req.get('Referer') || '/';
    res.redirect(referer);
});


// Cập nhật số lượng sản phẩm
router.post('/update', (req, res) => {
    const updatedQuantities = req.body.quantities;

    // Kiểm tra nếu không có dữ liệu
    if (!updatedQuantities) {
        req.flash('error', 'Không có dữ liệu cập nhật');
        return res.redirect('/cart/view');
    }

    if (!req.session.cart) req.session.cart = [];

    req.session.cart = req.session.cart.map(item => {
        if (updatedQuantities[item.itemId]) {
            item.quantity = parseInt(updatedQuantities[item.itemId]);
        }
        return item;
    });

    req.flash('success', 'Đã cập nhật số lượng sản phẩm');
    res.redirect('/cart/view');
});


// Xóa một sản phẩm khỏi giỏ hàng
router.post('/remove/:itemId', (req, res) => {
    const { itemId } = req.params;
    req.session.cart = (req.session.cart || []).filter(item => item.itemId.toString() !== itemId.toString());
    res.redirect('/cart/view');
});


// Xóa toàn bộ giỏ hàng
router.delete('/clear', (req, res) => {
    req.session.cart = [];
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng', cart: [] });
});

module.exports = router;