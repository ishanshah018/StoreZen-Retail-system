const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const ProfileRouter = require('./Routes/ProfileRouter');
const ManagerRouter = require('./Routes/ManagerRouter');

require('dotenv').config();
require('./Models/db');

const app = express();
const PORT = process.env.PORT || 8080;


// Health check endpoint
app.get('/ping', (req, res) => {
    res.send("PONG")
});


// Middleware setup
app.use(bodyParser.json());
app.use(cors());


// API routes
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);
app.use('/profile', ProfileRouter);
app.use('/manager', ManagerRouter);


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});