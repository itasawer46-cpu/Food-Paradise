const mongoose = require('mongoose');

// 📝 User Data ka Structure Define Kiya
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, // 🛑 Ek email se do account nahi ban sakte
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['customer', 'admin'], // 👑 Sirf customer ya admin hi role ho sakta ha
        default: 'customer'          // Naya register hone wala automatic pehle customer hoga
    }
}, { timestamps: true }); // Is se data save hone ka exact time (createdAt) auto save ho jata ha

module.exports = mongoose.model('User', userSchema);