const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000

// MongoDB connection string for Mongoose
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';

// Middleware to parse JSON bodies
app.use(express.json());

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected using Mongoose...'))
    .catch(err => console.error('MongoDB connection error:', err));

// Route to test Mongoose connection (optional, but helpful)
app.get('/test-mongoose', (req, res) => {
    try {
        // Try to list collections to verify connection
        const collections = await db.listCollections().toArray();
        res.status(200).json({ message: 'Database connection successful', collections: collections.map(c => c.name) });
    } catch (error) {
        console.error("Error testing database connection:", error);
        res.status(500).send('Error testing database connection');
    }
});

app.get('/', (req, res) => {
    res.send('Hello World! API is running.');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Close the MongoDB connection when the application is closing
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
});