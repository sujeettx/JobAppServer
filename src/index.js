import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoute from './routes/authRoute.js';
import jobRoute from './routes/jobRoute.js';
import {connectDB} from './config/db.js'

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// Routes
app.use('/users', authRoute);
app.use('/jobs', jobRoute);
app.get('/',(req,res)=>{
    res.send("Welcome to Job Application API")
})
// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
