const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRouter = require('./routes/auth');
const friendsRouter = require('./routes/friends');
const filesRouter = require('./routes/files');
const usersRouter = require('./routes/users');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const cors = require('cors');
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/', (req, res) => {
  res.send('NodeShare API running');
});

// API routes
app.use('/auth', authRouter);
app.use('/friends', friendsRouter);
app.use('/files', filesRouter);
app.use('/users', usersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; 
