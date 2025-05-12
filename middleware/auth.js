function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Bạn cần đăng nhập trước khi đặt hàng');
    res.redirect('/auth/login');
}

module.exports = { ensureAuthenticated };
