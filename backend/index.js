const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000

// MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db(); // Replace with your database name if not included in the URI
        console.log("Connected to MongoDB cluster");
    } catch (e) {
        console.error("Failed to connect to MongoDB", e);
        process.exit(1); // Exit the process if database connection fails
    }
}

connectToDatabase();

// Middleware to parse JSON bodies
app.use(express.json());

// Simple route to test the database connection
app.get('/test-db', async (req, res) => {
    if (!db) {
        return res.status(500).send('Database not connected');
    }
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
    await client.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
});