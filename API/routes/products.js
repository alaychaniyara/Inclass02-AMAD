const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../auth/check-auth');

const Product = require('../models/product');

router.get('/', (req,res,next)=>{
    Product.find()
        .select('name price _id')
        .exec()
        .then(docs => {
            console.log("Displaying all docs", docs);
            const response = {
                count: docs.length,
                products:docs.map(doc => {
                    return{
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        url: {
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/products/' + doc._id
                            }
                        }
                    }
                })
            };
            // if(docs.length >= 0){//optional piece of code
                res.status(200).json(response);
            /*}else{
                res.status(404).json({
                    message: 'No entries found'
                })
            }*/
        })
        .catch(err => {
            console.log("Logging error! ", err);
            res.status(500).json({error:err});
        });
});

router.post('/',checkAuth, (req,res,next)=>{
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save()
        .then(result => {
        console.log(result);
            res.status(201).json({
                message: 'Created product successfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url : 'http://localhost:3000/products' + result._id
                    }
                }
            });
    }).catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            });
        });
});

router.get('/:productId', (req,res,next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(doc => {
            console.log("From mongo database", doc);
            if(doc){
                res.status(200).json({
                    message : 'Loading chosen product',
                    product : {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                });
            }else{
                res.status(404).json({message:'No valid entry found for provided id'});
            }

    })
        .catch(err => {
            console.log(err);
            res.status(500).json({error:err});
        });
});

router.patch('/:productId',checkAuth, (req,res,next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id},{$set:updateOps})
        .exec()
        .then(result => {
            console.log("Success updating product", result);
            res.status(200).json({
                message: 'Successfully updated product information',
                product: {
                    name: result.name,
                    price: result.price,
                    request: {
                        type: 'GET',
                        description: 'Getting more information',
                        url: 'http://localhost:3000/products/' + id
                    }
                }
            });
        })
        .catch(err => {
            console.log("Error logged", err);
            res.status(500).json({
                error:err
            });
        });
});

router.delete('/:productId', checkAuth, (req,res,next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message : "Product successfully deleted",
                name: result.name,
                price: result.price,
                request: {//because product is deleted we are asking to user to may be add more data this way
                    type: 'POST',
                    url: 'http://localhost:3000/products/',
                    body:{
                        name: 'String',
                        price: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            });
        });
});

module.exports = router;