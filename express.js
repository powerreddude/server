import express from 'express';
import session from 'express-session';
import redisClient from './db/redis.js'; // Import Redis connection
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import "dotenv/config"; // Load environment variables

// Import routers
import usersRouter from './routes/users.js'; 
import authRouter from './routes/auth.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Replace with your client URL
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

// Session management
let sessionStore = new RedisStore({
    client: redisClient,
    prefix: 'sess:'  
});

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Example route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Use routers
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

export default app;