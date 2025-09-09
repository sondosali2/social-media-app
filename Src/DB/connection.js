import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongo_uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};
export default connectDB