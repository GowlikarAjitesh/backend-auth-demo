const mongoose = require('mongoose');

const dbUrl = process.env.MONGODB_URL;
const database = process.env.DATABASE;

const url = `${dbUrl}/${database}`;

const connectToDB = async() => {
    try {
        await mongoose.connect(url);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.log('MongoDB connection failed...');
        process.exit(1);
    }
}

module.exports = connectToDB;