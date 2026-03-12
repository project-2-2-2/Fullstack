import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/exam');
        console.log("MongoDB is now connected");
    } catch (error) {
        console.log("MongoDB connection failed!", error.message);
    }
}

export default connectDB;