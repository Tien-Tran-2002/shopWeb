const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Middleware kiểm tra đăng nhập
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Bạn cần đăng nhập trước khi đặt hàng');
  res.redirect('/auth/login');
}

// GET /checkout
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const cart = req.session.cart || [];
    const products = await Product.find({ _id: { $in: cart.map(i => i.itemId) } });
    const cartItems = cart.map(i => {
      const p = products.find(x => x._id.toString() === i.itemId);
      return { product: p, quantity: i.quantity, price: p.price };
    });
    const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.render('checkout', { cartItems, cartTotal });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi máy chủ');
  }
});

// POST /checkout
router.post('/', ensureAuthenticated, async (req, res) => {
  const { name, email, phone, address, province, district, ward, paymentMethod, amount } = req.body;
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect('/cart/view');

  // Lấy chi tiết sản phẩm
  const products = await Product.find({ _id: { $in: cart.map(i=>i.itemId) } });
  const items = cart.map(i => {
    const p = products.find(x=>x._id.toString()===i.itemId);
    return { itemId: p._id, name: p.name, quantity: i.quantity, price: p.price };
  });
  //const totalAmount = items.reduce((s,i) => s + i.price*i.quantity, 0);
  const totalAmount = parseInt(amount, 10);

  // Tạo & lưu order
  const order = new Order({
    userId: req.user._id,
    name, email, phone, address, province, district, ward,
    paymentMethod, items, totalAmount,
    status: paymentMethod==='MoMo' ? 'PENDING' : 'Đang xử lý'
  });
  await order.save();

  if (paymentMethod === 'MoMo') {
    // Gọi MoMo API
    const accessKey = 'F8BBA842ECF85', secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const partnerCode = 'MOMO', orderInfo = `Thanh toán đơn ${order._id}`;
    const redirectUrl = 'http://localhost:3000/checkout/success';
    const ipnUrl = 'http://localhost:3000/payment/callback';
    const requestType = 'captureWallet';
    const requestId = partnerCode + Date.now();
    const extraData = order._id.toString();

    const rawSignature =
      `accessKey=${accessKey}&amount=${totalAmount}` +
      `&extraData=${extraData}&ipnUrl=${ipnUrl}` +
      `&orderId=${requestId}&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const body = {
      partnerCode, accessKey, requestId,
      amount: totalAmount.toString(), orderId: requestId,
      orderInfo, redirectUrl, ipnUrl, requestType,
      extraData, signature
    };

    try {
      const { data } = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', body);
      return res.redirect(data.payUrl);
    } catch (e) {
      console.error(e);
      req.flash('error','Thanh toán MoMo thất bại');
      return res.redirect('/checkout');
    }
  }

  // COD/ATM/ShopeePay
  req.session.cart = [];
  res.redirect('/checkout/success');
});

// GET /checkout/success
router.get('/success', ensureAuthenticated, (req, res) => {
  // Reset cart nếu MoMo chưa clear
  req.session.cart = [];
  res.render('checkout_success');
});

module.exports = router;
