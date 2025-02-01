require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const dbConfig = require('../configs/database.js');
const Post = require('../models/post');
const Category = require('../models/category');
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

const seedPosts = async () => {

    // Create an array of 50 posts
    const posts = [];
    const requiredPostsCount = 50;
  
    for (let i = 0; i < requiredPostsCount; i++) {

        const user = await User.aggregate([{ $sample: { size: 1 } }]); 
        // Since aggregate() returns an array, we can access the first element

        const category = await Category.aggregate([{ $sample: { size: 1 } }]); 

        const post = {
            title: faker.book.title(),
            description: faker.commerce.productDescription(),
            category_id: category[0]._id,
            user_id: user[0]._id
        };

        posts.push(post);
    }
  
    try {
      // Insert posts into the database
      await Post.insertMany(posts);
      console.log(`${requiredPostsCount} posts have been seeded.`);
      mongoose.connection.close();
    } catch (err) {
      console.error('Error seeding posts:', err);
    }
};

// Run the seeding script
const runSeeder = async () => {
    await connectDB();
    await seedPosts();
};

runSeeder();