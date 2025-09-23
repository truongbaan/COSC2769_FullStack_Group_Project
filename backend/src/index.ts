/* RMIT University Vietnam 
# Course: COSC2769 - Full Stack Development 
# Semester: 2025B 
# Assessment: Assignment 02 
# Author: Truong Ba An
# ID: s3999568 */

const PORT = 5000
import express from 'express';
import apiRouter from './routes/router';
import cookieParser from 'cookie-parser';
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express()

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 450,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes."
});


//for cookies :D
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://cosc-2769-full-stack-group-project.vercel.app'],
    credentials: true,
  })
);


// Middleware to parse JSON bodies
app.use(express.json());

// Mount the main API router under the '/api' base path.
app.use("/api", generalLimiter , apiRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
