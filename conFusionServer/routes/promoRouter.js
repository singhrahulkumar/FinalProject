const express = require('express');
const bodyParser = require('body-parser');
const Promos = require('../model/promo');
var authenticate = require('../authenticate');
const cors = require('./cors');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promos.find(req.query)
    .then((promos)=>{
       res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(promos);
    },(err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Promos.create(req.body)
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
     Promos.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err)); 
});

// perform opearation specific to promo id
promoRouter.route('/:promoid')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promos.findById(req.params.promoid)
     .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('Post operation not supported on /promotions');
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
     Promos.findByIdAndUpdate(req.params.promoid, {
        $set: req.body
    }, { new: true })
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Promos.findByIdAndRemove(req.params.promoid)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = promoRouter;