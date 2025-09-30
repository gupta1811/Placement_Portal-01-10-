// Run this script to create demo users in your MongoDB
// node scripts/createDemoUsers.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

require('dotenv').config();

const createDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if demo users already exist
    const existingStudent = await User.findOne({ email: 'student@demo.com' });
    const existingRecruiter = await User.findOne({ email: 'recruiter@demo.com' });
    const existingAdmin = await User.findOne({ email: 'admin@demo.com' });

    const demoUsers = [];

    if (!existingStudent) {
      demoUsers.push({
        name: 'Demo Student',
        email: 'student@demo.com',
        password: 'password123',
        role: 'student'
      });
    }

    if (!existingRecruiter) {
      demoUsers.push({
        name: 'Demo Recruiter',
        email: 'recruiter@demo.com',
        password: 'password123',
        role: 'recruiter'
      });
    }

    if (!existingAdmin) {
      demoUsers.push({
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: 'password123',
        role: 'admin'
      });
    }

    if (demoUsers.length > 0) {
      const result = await User.insertMany(demoUsers);
      console.log(`✅ Created ${result.length} demo users:`);
      result.forEach(user => {
        console.log(`   ${user.role}: ${user.email} / password123`);
      });
    } else {
      console.log('✅ All demo users already exist:');
      console.log('   student: student@demo.com / password123');
      console.log('   recruiter: recruiter@demo.com / password123');  
      console.log('   admin: admin@demo.com / password123');
    }

    await mongoose.disconnect();
    console.log('\nDone! You can now test login with these credentials.');
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    process.exit(1);
  }
};

createDemoUsers();
