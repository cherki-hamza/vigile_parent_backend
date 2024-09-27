// server.js
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const childRoutes = require('./routes/childRoutes');
const dotenv = require('dotenv');
const cors = require('cors');  // Add this line

dotenv.config();
const app = express();

app.use(cors());  // Add this line
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/children', childRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
