const express = require('express');

const testRouter = express.Router();


testRouter.route('/')
.all((req,res,next) => {
    console.log("req",req);
    res.status = 200;
    next();
})
.get((req,res,next) => {
    console.log("req",req);
    res.end("test router get")
})

module.exports = testRouter;