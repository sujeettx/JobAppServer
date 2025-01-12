import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });
const uri = process.env.MONGODB_URI;

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}