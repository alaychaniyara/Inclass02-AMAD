const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../auth/check-auth');

const Order = require('../models/order');
const Product = require('../models/product');


router.get('/', (req,res,next) => {
   Order.find()
       .select ('_id quantity product')
       .populate('product','name')
        .exec()
       .then(docs => {
           console.log(docs);
           const response = {
               count: docs.length,
               products:docs.map(doc => {
                   return {
                       product: doc.product,
                       quantity: doc.quantity,
                       _id: doc._id,
                       url: {
                           request: {
                               type: 'GET',
                               url: 'http://localhost:3000/orders/' + doc._id
                           }
                       }
                   }
               })
           }
           res.status(200).json(response);
       }).catch(err => {
           console.log(err);
           res.status(500).json(err);
   });
});

router.post('/',checkAuth, (req,res,next) => {
    //Before retrieving orders first look if there is a product in the products table!!!!
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'No product found'
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: 'Order stored',
                        createdOrder: {
                            _id: result._id,
                            product: result.product,
                            quantity: result.quantity
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + result._id
                        }
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        message: 'Product not found',
                        error: err
                    });
                });
        });

    router.get('/:orderId', (req, res, next) => {
        const id = req.params.orderId;
        Order.findById(id).select('_id product quantity')
            .then(result => {
                console.log('Data for a specific order', result);
                if (result) {
                    res.status(200).json({
                        message: 'Loading chosen product',
                        product: {
                            quantity: result.name,
                            product: result.product,
                            _id: result._id,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/orders/' + result._id
                            }
                        }
                    });
                } else {
                    res.status(404).json({message: 'No valid entry found for provided id'});
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({error: err});
            });
    });

    router.delete('/:orderId', checkAuth, (req, res, next) => {
        const id = req.params.orderId;
        Order.remove({_id: id})
            .exec()
            .then(result => {
                res.status(200).json({
                    message: "Order successfully deleted",
                    product: result.product,
                    quantity: result.quantity,
                    request: {//because order is deleted we are asking to user to may be add more data this way
                        type: 'POST',
                        url: 'http://localhost:3000/orders/',
                        body: {
                            product: 'String',
                            quantity: 'Number'
                        }
                    }
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    });
});

module.exports = router;