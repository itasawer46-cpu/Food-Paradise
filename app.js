const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const Menu = require('./models/Menu');
const Order = require('./models/Order');
const app = express();
connectDB();
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res)=>{
    res.render('index')
})
// 1. Bilkul top par Menu model ko require karo (jahan connectDB require kiya tha)

// 2. Yeh test route dalo data insert karne ke liye
app.get('/seed-menu', async (req, res) => {
    try {
        // Pehle check karte hain agar data pehle se hi mojood to nahi
        const existingItems = await Menu.find();
        if (existingItems.length > 0) {
            return res.send('Database me data pehle se mojood ha, dobara insert karne ki zaroorat nahi!');
        }

        // Agar database khali ha to yeh 3 items insert kar do
        await Menu.create([
            {
                name: 'Desi Omelette & Paratha',
                description: 'Freshly made crispy lachha paratha served with a traditional spicy omelette and hot chai.',
                price: 180,
                category: 'Breakfast',
                image: '/booster.png' // Abhi ke liye hum booster image hi use kar rahe hain
            },
            {
                name: 'Chicken Biryani (VIP Single)',
                description: 'Spicy Karachi-style biryani with premium basmati rice, juicy chicken piece, and raita.',
                price: 280,
                category: 'Lunch',
                image: '/booster.png'
            },
            {
                name: 'Daal Makhni & Roti',
                description: 'Ghar jaisi yummy daal makhni topped with butter, served with 2 fresh tandoori rotis.',
                price: 150,
                category: 'Dinner',
                image: '/booster.png'
            }
        ]);

        res.send('💥 Mazaidaar Dummy Data Successfully Inserted into MongoDB!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Opps! Data insert karte hue koi galti ho gayi.');
    }
});

app.get('/menu', async(req,res)=>{
    try {
        const foodItems = await Menu.find();

        res.render('menu',{items:foodItems});
    } catch (err) {
        console.log('Menu Load karna me masla a gaya : ',err.message);
        res.status(500).send('Server Error : Menu Loaded Fail');
    }
})
// 📦 1. GET ROUTE: Order Form Dikhane Ke Liya
app.get('/order', async (req, res) => {
    try {
        // Hum saare available khane dropdown me dikhane ke liye fetch kar rahe hain
        const foodItems = await Menu.find();
        res.render('order', { items: foodItems });
    } catch (err) {
        res.status(500).send('Order page load karne me masla aaya.');
    }
});

// 📥 2. POST ROUTE: Form Submit Hone Par Data Save Karne Ke Liya
app.post('/place-order', async (req, res) => {
    try {
        const { customerName, phoneNumber, deliveryAddress, foodItem, planType } = req.body;
        
        // Database me naya order create karo
        await Order.create({
            customerName,
            phoneNumber,
            deliveryAddress,
            foodItem,
            planType
        });

        res.render('order-success',{name:customerName});
    } catch (err) {
        console.error(err);
        res.status(500).send('Order place karte hue koi galti hui.');
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log("Server running on port 3000"));
}
module.exports = app;