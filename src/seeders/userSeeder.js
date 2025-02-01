require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const dbConfig = require('../configs/database.js');
const Role = require('../models/role');
const User = require('../models/user');

// Connect to MongoDB using Mongoose
const connectDB = async () => {
    try {
        // Use Mongoose to connect to the database
        await mongoose.connect(dbConfig.url);
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit the process with failure
    }
};

// Seeder function
const seedAdmin = async () => {
    try {
      const adminRole = await Role.findOne({ name: 'admin' });
  
      if (!adminRole) {
        console.log('Admin role not found. Please create roles first.');
        return;
      }
  
      // Check if an admin already exists
      const existingAdmin = await User.findOne({ email: 'pangrekarsandesh@gmail.com' });
      if (existingAdmin) {
        console.log('Admin user already exists. Skipping admin seeding.');
        return;
      }
  
      // Create a single admin user
      const adminUser = new User({
        firstname: 'Sandesh',
        lastname: 'Pangrekar',
        email: 'pangrekarsandesh@gmail.com',
        password: await bcrypt.hash('Sandesh@123', 12),
        role_id: adminRole._id,
        profile_picture: 'admin.jpg',
        verified: false
      });
  
      await adminUser.save();
      console.log('1 admin user has been seeded.');
    } catch (err) {
      console.error('Error seeding admin user:', err);
    }
  };

const seedUsers = async () => {

    const userRole = await Role.findOne({ name: 'user' });
    const users = [];
    const requiredUsersCount = 50;
  
    for (let i = 0; i < requiredUsersCount; i++) {

        let email;
        let existingUser;

        // Generate unique email
        do {
            email = faker.internet.email();
            existingUser = await User.findOne({ email });
        } while (existingUser); // Keep generating until we get a unique email


        const user = {
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            email: email,
            password: await bcrypt.hash('Sandesh@123', 12),
            role_id: userRole._id,
            profile_picture: 'user.jpg',
            verified: false
        };

        users.push(user);
    }
  
    try {
      // Insert users into the database
      await User.insertMany(users);
      console.log(`${requiredUsersCount} users have been seeded.`);
      mongoose.connection.close();
    } catch (err) {
      console.error('Error seeding users:', err);
    }
};

// Run the seeding script
const runSeeder = async () => {
    await connectDB();
    await seedAdmin();
    await seedUsers();
};

runSeeder();
