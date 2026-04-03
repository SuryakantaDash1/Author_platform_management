/**
 * Seed Super Admin Account
 *
 * Run this script to create the initial Super Admin:
 *   npx ts-node src/scripts/seedAdmin.ts
 *
 * Or add to package.json scripts:
 *   "seed:admin": "ts-node src/scripts/seedAdmin.ts"
 *
 * Default credentials:
 *   Email: admin@povital.com
 *   Password: Admin@1234
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

import User from '../models/User.model';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@povital.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Super';
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'Admin';

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('ERROR: MONGODB_URI not found in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('\n========================================');
      console.log('Super Admin already exists!');
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  User ID: ${existingAdmin.userId}`);
      console.log('========================================\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Generate unique userId
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const userId = `ADM${timestamp}${randomSuffix}`;

    // Create super admin
    const admin = await User.create({
      userId,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // Will be hashed by pre-save hook
      role: 'super_admin',
      tier: 'enterprise',
      isActive: true,
      isRestricted: false,
    });

    console.log('\n========================================');
    console.log('Super Admin created successfully!');
    console.log('========================================');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  User ID:  ${admin.userId}`);
    console.log(`  Role:     super_admin`);
    console.log('========================================');
    console.log('\nUse these credentials to login at /admin/login');
    console.log('Change the password immediately after first login!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('Failed to seed admin:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
