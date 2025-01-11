import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });
const uri = process.env.MONGODB_URI;

export const connectDb = async () => {
    try {
      const connect = await mongoose.connect(uri);
      console.log("Server is Connected to Database");
    } catch (err) {
      console.log("Server is NOT connected to Database", err.message);
    }
  };