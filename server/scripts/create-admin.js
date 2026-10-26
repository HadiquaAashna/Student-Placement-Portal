import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    const existing = await User.findOne({ email: 'admin@placement.edu' });
    if (existing) {
      console.log('Admin already exists');
    } else {
      await User.create({
        email: 'admin@placement.edu',
        password: 'admin123',
        role: 'admin',
        isApproved: true
      });
      console.log('Admin created: admin@placement.edu / admin123');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Create Admin Failed:', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

createAdmin();
