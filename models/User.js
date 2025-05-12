// models/user.js
const mongoose = require('mongoose');
const argon2 = require('argon2');

// Định nghĩa schema của người dùng
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    }
});

// Băm mật khẩu trước khi lưu vào database
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        // Băm mật khẩu chỉ khi mật khẩu thay đổi
        this.password = await argon2.hash(this.password);
        next();
    } catch (err) {
        next(err);
    }
});

// Kiểm tra mật khẩu khi người dùng đăng nhập
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // So sánh mật khẩu người dùng nhập vào với mật khẩu đã băm
    return await argon2.verify(this.password, enteredPassword);
};

module.exports = mongoose.model('User', UserSchema);
