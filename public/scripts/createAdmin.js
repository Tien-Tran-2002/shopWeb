const mongoose = require('mongoose');
const argon2 = require('argon2');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/my-shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Đã kết nối MongoDB');
}).catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
});

// Định nghĩa schema người dùng (có thể giống file models/user.js của bạn)
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: {
        type: String,
        default: 'user'
    }
});

const User = mongoose.model('User', userSchema);

// Hàm tạo tài khoản admin
async function createAdmin() {
    try {
        const hashedPassword = await argon2.hash('admin123'); // thay đổi mật khẩu tại đây nếu muốn

        const admin = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('✅ Tài khoản admin đã được tạo!');
        mongoose.disconnect();
    } catch (err) {
        console.error('❌ Lỗi khi tạo admin:', err);
        mongoose.disconnect();
    }
}

createAdmin();
