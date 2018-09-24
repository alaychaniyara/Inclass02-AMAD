const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Routing all the requests to appropriate pages
const productRoutes =  require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

try{
    mongoose.connect(
        'mongodb+srv://amad_user:'+process.env.ATLAS_PW+'@amad-customer-jvsta.mongodb.net/test?retryWrites=true',
        {
            useNewUrlParser:true
        }
    );
    mongoose.set('useCreateIndex', true);
}catch(error){
    return res.status(401).json({
        message : 'Server connect fail'
    });
}

//Applying the the morgan and body parser here.enabling url-encoded and json formats
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Applying CORS- giving access to any client
app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Origin','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        req.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET, OPTIONS');
        return res.status(200).json({})
    }
    next();
});
//Closing CORS. Always add before the routes.

//Routes handling requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users',userRoutes);

app.use((req,res,next) => {
    const error = new Error("Not found");
    error.status =404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error :{
            message : error.message
        }
    });
});

module.exports = app;
