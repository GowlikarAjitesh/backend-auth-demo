require('dotenv').config();

const express = require('express');
const connectToDB = require('./database/db');
const authRoutes = require('./routes/auth-routes');
const homeRoutes = require('./routes/home-routes');
const adminRoutes = require('./routes/admin-routes');
const uploadImageRoutes = require('./routes/image-routes');
const app = express();
 

//connect to database
connectToDB();


//middleware
app.use(express.json());

//create routes
app.use('/api/auth/', authRoutes);
app.use('/api/home/', homeRoutes);
app.use('/api/admin/', adminRoutes);
app.use('/api/image/', uploadImageRoutes);

//listening to ports
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})