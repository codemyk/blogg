const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

require('dotenv').config();

const app = express();

mongoose.connect("mongodb+srv://admin1:admin1234@course-booking.cz1m5.mongodb.net/blog-app-API?retryWrites=true&w=majority&appName=Course-Booking");

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas'));

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', 'https://blogg-red-ten.vercel.app/login'// frontend origin
  credentials: true
}));

app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);

if(require.main === module){
    app.listen(process.env.PORT || 4000, () => {
        console.log(`API is now online on port ${ process.env.PORT || 4000 }`)
    });
}

module.exports = {app, mongoose};