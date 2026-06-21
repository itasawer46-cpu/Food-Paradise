const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required']
    },
    deliveryAddress: {
        type: String,
        required: [true, 'Delivery address/Hostel room is required']
    },
    foodItem: {
        type: mongoose.Schema.Types.ObjectId, // 👈 Yeh Menu collection ki ID se connect karega (Foreign Key)
        ref: 'Menu',
        required: true
    },
    planType: {
        type: String,
        required: true,
        enum: ['Daily', 'Weekly', 'Monthly'] // Subscription plans
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled']
    }
}, { 
    timestamps: true 
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;