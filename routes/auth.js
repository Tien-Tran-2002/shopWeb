const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Trang Đăng ký (GET)
router.get('/register', (req, res) => {
    res.render('register', {
        error: req.flash('error'),
        success: req.flash('success'),
        user: req.user
    });
});

// Xử lý Đăng ký (POST)
router.post('/register', async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    console.log('🔐 Mật khẩu người dùng nhập khi đăng ký:', password);

    if (!username || !email || !password || !confirm_password) {
        req.flash('error', 'Vui lòng điền đầy đủ thông tin');
        return res.redirect('/auth/register');
    }

    if (password !== confirm_password) {
        req.flash('error', 'Mật khẩu và xác nhận mật khẩu không khớp');
        return res.redirect('/auth/register');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email này đã được đăng ký');
            return res.redirect('/auth/register');
        }

        const newUser = new User({ username, email, password });
        await newUser.save(); // bcrypt/argon2 hash sẽ được xử lý ở schema

        console.log('💾 Mật khẩu sau khi băm và lưu:', newUser.password);

        req.flash('success', 'Đăng ký thành công! Bạn có thể đăng nhập ngay.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Đã xảy ra lỗi trong quá trình đăng ký');
        res.redirect('/auth/register');
    }
});

// Trang Đăng nhập (GET)
router.get('/login', (req, res) => {
    res.render('login', {
        error: req.flash('error'),
        success: req.flash('success'),
        user: req.user
    });
});

// Xử lý Đăng nhập (POST)
router.post('/login', (req, res, next) => {
    const { username, password } = req.body;
    console.log('🧾 Mật khẩu người dùng nhập khi đăng nhập:', password);

    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                req.flash('error', 'Tài khoản không tồn tại');
                return res.redirect('/auth/login');
            }

            console.log('🔒 Mật khẩu đã băm trong DB:', user.password);

            user.matchPassword(password)
                .then(isMatch => {
                    console.log('✅ Kết quả so sánh mật khẩu:', isMatch);

                    if (!isMatch) {
                        req.flash('error', 'Mật khẩu không chính xác');
                        return res.redirect('/auth/login');
                    }

                    req.login(user, (err) => {
                        if (err) return next(err);
                    
                        if (user.role === 'admin') {
                            return res.redirect('/admin/dashboard');
                        }
                    
                        return res.redirect('/');
                    });
                })
                .catch(err => {
                    console.error(err);
                    req.flash('error', 'Đã xảy ra lỗi khi so sánh mật khẩu');
                    res.redirect('/auth/login');
                });
        })
        .catch(err => {
            console.error(err);
            req.flash('error', 'Đã xảy ra lỗi khi tìm người dùng');
            res.redirect('/auth/login');
        });
});

// Xử lý Đăng xuất
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', 'Đăng xuất thành công');
        res.redirect('/');
    });
});

module.exports = router;
