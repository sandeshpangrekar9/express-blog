require('dotenv').config();
const mongoose = require('mongoose');
const dbConfig = require('../configs/database.js');
const Role = require('../models/role');

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

// Seed roles if they do not exist
const seedRoles = async () => {
    try {
        const roles = [
            { name: 'admin' },
            { name: 'user' },
        ];

        for (const role of roles) {
            // Check if the role already exists
            const existingRole = await Role.findOne({ name: role.name });
            if (existingRole) {
                console.log(`Role "${role.name}" already exists. Skipping...`);
            } else {
                // Insert the role if it doesn't exist
                await Role.create(role);
                console.log(`Role "${role.name}" has been added.`);
            }
        }
        console.log('Role seeding completed');
    } catch (error) {
        console.error('Error seeding roles:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the seeding script
const runSeeder = async () => {
    await connectDB();
    await seedRoles();
};

runSeeder();
