const express = require('express')
const cors = require('cors');
require('dotenv').config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const userRoute = require('./routes/users')
const dataRoute = require('./routes/getData')

// test route
app.use('/api/users', userRoute);
app.use('/api/mydata', dataRoute)

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
