// Middleware kiểm tra quyền admin
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next(); // Chỉ cho phép admin
    }
    res.redirect('/login'); // Chuyển hướng đến trang login nếu không phải admin
}

// Middleware kiểm tra người dùng đã đăng nhập
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Nếu đã đăng nhập, cho phép truy cập
    }
    res.redirect('/login'); // Nếu chưa đăng nhập, chuyển hướng đến trang login
}

module.exports = { isAuthenticated, isAdmin };
