const mongoose = require('mongoose');

// 1. Schema Design (Rules for Food Items)
const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Food item name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Breakfast', 'Lunch', 'Dinner'] // Sirf in teeno me se koi ek option select ho sakega
    },
    image: {
        type: String, // Yahan hum image ka path ya URL store karenge
        default: '/booster.png' // Agar koi image nahi lagayega to default booster wali chalaygi
    },
    isAvailable: {
        type: Boolean,
        default: true // Khana abhi order ke liye available ha ya nahi
    }
}, { 
    timestamps: true // Yeh automatic 'createdAt' aur 'updatedAt' ke time save kar lega
});

// 2. Model Create & Export
// 'Menu' naam ka collection MongoDB me automatic plural ho kar 'menus' ban jayega
const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;