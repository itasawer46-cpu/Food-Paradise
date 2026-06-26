const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/db');
const Menu = require('./models/Menu');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const Order = require('./models/Order');
const app = express();
connectDB();
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

// ⚙️ SESSION CONFIGURATION
app.use(session({
    secret: 'FoodParadiseSecretKeyHusnain123', // Ek secure random string
    resave: false,                             // Har request par session dobara save na ho
    saveUninitialized: false,                  // Khali session save na ho
    cookie: { maxAge: 24 * 60 * 60 * 1000 }    // Session 1 din tak valid rahega (milliseconds me)
}));

// Global variable set karne ke liye taake har EJS file me 'user' automatic mil jaye
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

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

// 📊 PROTECTED ADMIN DASHBOARD ROUTE
app.get('/admin/orders', isAdmin, async (req, res) => {
    try {
        const allOrders = await Order.find().populate('foodItem').sort({ createdAt: -1 }); 
        res.render('admin-dashboard', { orders: allOrders });
    } catch (err) {
        console.error("Dashboard error:", err.message);
        res.status(500).send("Dashboard load karte hue koi galti hui.");
    }
});


// 🧪 TEMPORARY TEST ROUTE (Sirf check karne ke liye)
app.get('/make-me-admin', (req, res) => {
    // Hum ne session me fake admin data daal diya
    req.session.user = { username: "Husnain", role: "admin" };
    res.send("Mubarak ho! Aap admin ban gaye hain. Ab menu page ya dashboard check karo.");
});

app.get('/make-me-user', (req, res) => {
    // Hum ne session me ordinary customer data daal diya
    req.session.user = { username: "Zain", role: "customer" };
    res.send("Aap normal user ban gaye hain. Ab button automatic gayab ho jayega.");
});

// 📝 1. GET SIGNUP: Sirf form ka page dikhane ke liye
app.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});

// 📥 2. POST SIGNUP: Jab user register ka button dabaye to data database me save karne ke liye
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check A: Kya is email ka user pehle se register ha?
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('signup', { error: 'Yeh Email pehle se registered ha! 🛑' });
        }

        // Check B: Password ko secure/hash karo (Salting mechanism)
        const salt = await bcrypt.genSalt(10); // 10 rounds of encryption keys
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check C: Naya user create karo (Pehli dafa agar tum chahte ho ke tum admin bano, to role manually de sakte ho)
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'customer' // By default customer hoga (Apne account ke liye isay 'admin' likh kar ek dafa register kar lena!)
        });

        await newUser.save(); // Database me save kar diya

        // Signup ke baad direct login screen par bhej do
        res.redirect('/login');

    } catch (err) {
        console.error("Signup Error:", err.message);
        res.render('signup', { error: 'Account banane me koi galti hui.' });
    }
});


// 🔑 1. GET LOGIN: Login form ka page dikhane ke liye
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// 🔓 2. POST LOGIN: User ko verify kar ke session start karne ke liye
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check karo kya user is email se database me ha?
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Ghalat Email ya Password! 🛑' });
        }

        // 2. Encrypted password ko check karo (Bcrypt verify karega)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Ghalat Email ya Password! 🛑' });
        }

        // 3. Agar password sahi ha, to session me user ka data save kar lo (Login Successful)
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role // Yeh tumhara 'admin' role uthayega!
        };

        // Login ke baad user ko seedha menu page ya home page par redirect karo
        res.redirect('/menu'); 

    } catch (err) {
        console.error("Login Error:", err.message);
        res.render('login', { error: 'Login karte hue koi galti hui.' });
    }
});

// 👮‍♂️ ADMIN CHECK CHECKPOST
function isAdmin(req, res, next) {
    // Check 1: Kya user session me majood ha?
    // Check 2: Kya us user ka role 'admin' ha?
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next(); // 🟢 Agar admin ha to ijazat ha, agay jaane do!
    }
    
    // 🛑 Agar admin nahi ha, to agay nahi jaane dena aur error de dena ha
    res.status(403).send("Access Denied: Sirf Husnain Bhai (Admin) allowed hain! 🛑");
}

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log("Server running on port 3000"));
}
module.exports = app;