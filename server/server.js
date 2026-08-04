import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Load routes
import authRoutes from './routes/auth.js';
import passport from 'passport';
import ibmcloudAppId from 'ibmcloud-appid';
import appidRoutes, { setupAppIdAuth } from './routes/appid.js';

const { WebAppStrategy } = ibmcloudAppId;
import jobRoutes from './routes/jobs.js';
import studentRoutes from './routes/students.js';
import applicationRoutes from './routes/applications.js';
import adminRoutes from './routes/admin.js';
import chatbotRoutes from './routes/chatbot.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:4321',
    'http://127.0.0.1:4321',
    'https://student-placement-portal-chi.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IBM App ID OAuth (session + passport) must be registered before route mounting
setupAppIdAuth(app);

// Resolve path details for local static upload support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', appidRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Root test route
app.get('/', (req, res, next) => {
  // If IBM App ID dashboard is configured with http://localhost:5000 as the redirect URI
  // (instead of the full callback path), handle the OAuth code directly here via
  // passport so the session/state cookie is preserved — a plain res.redirect() would
  // lose the state and cause passport to reject the callback.
  if (req.query && req.query.code) {
    return passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
      failureRedirect: '/api/auth/appid/failure',
      successRedirect: '/api/auth/appid/after'
    })(req, res, next);
  }
  res.json({ message: 'CampusConnect Placement API running successfully.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
