// app.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

// Import các router
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const indexRouter = require('./routes/index');
const productRoutes = require('./routes/product');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');
const checkoutRouter = require('./routes/checkout');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/my-shop')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// Cấu hình Passport
require('./config/passport')(passport);

// Middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;  // gán user hiện tại vào res.locals
    next();
});
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true
}));
// ← thêm ngay sau express-session
app.use((req, res, next) => {
    // đảm bảo luôn có mảng cart trong session
    if (!req.session.cart) req.session.cart = [];
    // expose cho tất cả template
    res.locals.cartItems = req.session.cart;
    next();
  });
  
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Đăng ký các route
app.use('/auth', authRouter);  // Đảm bảo các route liên quan đến auth như /auth/login, /auth/register
app.use('/user', userRouter);  // Đảm bảo các route liên quan đến người dùng như /user/profile
app.use('/', indexRouter);     // Route cho trang chủ và các route không cần tiền tố
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);
app.use('/cart', cartRoutes);  // Route cho giỏ hàng
app.use('/checkout', checkoutRouter); //Route cho thanh toán

// Tạo view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

// Khởi động server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
