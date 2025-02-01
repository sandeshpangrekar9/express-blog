require('dotenv').config();
const mongoose = require('mongoose');
const dbConfig = require('../configs/database.js');
const Category = require('../models/category');

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

// Seed category if they do not exist
const seedCategories = async () => {
    try {
        const categories = [
            { name: 'Entertainment' },
            { name: 'Sports' },
            { name: 'Education' },
            { name: 'Technology' },
            { name: 'Food' },
            { name: 'Automobile' },
            { name: 'Business' },
            { name: 'Lifestyle' }
        ];

        for (const category of categories) {
            // Check if the category already exists
            const existingCategory = await Category.findOne({ name: category.name });
            if (existingCategory) {
                console.log(`Category "${category.name}" already exists. Skipping...`);
            } else {
                // Insert the category if it doesn't exist
                await Category.create(category);
                console.log(`Category "${category.name}" has been added.`);
            }
        }
        console.log('Category seeding completed');
    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the seeding script
const runSeeder = async () => {
    await connectDB();
    await seedCategories();
};

runSeeder();