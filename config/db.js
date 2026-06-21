const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Hum abhi local MongoDB use kar rahe hain, database ka naam 'fooddrop' rakha ha
        await mongoose.connect('mongodb+srv://itasawer46_db_user:YKTt89ywb5uRmvf@cluster0.kgewmoh.mongodb.net/GymProduction?retryWrites=true&w=majority');
        console.log('MongoDB Connected Successfully... 🔌');
    } catch (err) {
        console.error('Database Connection Failed: ', err.message);
        process.exit(1); // Agar connect na ho to app band ho jaye
    }
};

module.exports = connectDB;