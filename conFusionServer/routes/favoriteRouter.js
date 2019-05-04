const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../model/favorite');
var authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions,authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser, (req,res,next) => {
    Favorites.find({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites)=>{
        if(favorites !== null) {
        res.statusCode = 200;
       res.setHeader('Content-Type', 'application/json');
       res.json(favorites);
        } else {
            var err = new Error(req.user.username +"has no favorites");
          err.status = 404;
          return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
   Favorites.findOne({user:req.user._id})
    .then((favorite) => {
        // if for that user no favorite dish is there
        if(favorite === null) {
            Favorites.create({user:req.user._id,dishes: req.body})
            .then((favorite) => {
                 Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                res.statusCode=200;
               res.setHeader('Content-Type', 'application/json');
               res.json(favorite);
                },(err) => next(err))
                .catch((err) => next(err))
            },(err) => next(err))
            .catch((err) => next(err))
        } else {
            for(var j =0;j<req.body.length;j++) {
                if(favorite.dishes.indexOf(req.body[j]._id) === -1) {
                  favorite.dishes.push(req.body[j]._id);
                }
            }
            favorite.save()
            .then((favorite) => {
               Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                res.statusCode=200;
               res.setHeader('Content-Type', 'application/json');
               res.json(favorite);
                },(err) => next(err))
                .catch((err) => next(err))
            },(err) => next(err))
            .catch((err) => next(err))
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorite');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
  Favorites.findOneAndDelete({user: req.user._id})
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json([]);
  },(err) => next(err))
 .catch((err) => next(err))
});

// perform opearation specific to promo id
favoriteRouter.route('/:favoriteId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('user')
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user:req.user._id})
    .then((favorite) => {
        // if for that user no favorite dish is there
        if(favorite === null) {
            console.log("req",req.params.dishId);
            Favorites.create({user:req.user._id,dishes: [req.params.favoriteId]})
            .then((favorite) => {
                 Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                res.statusCode=200;
               res.setHeader('Content-Type', 'application/json');
               res.json(favorite);
                },(err) => next(err))
                .catch((err) => next(err))
            },(err) => next(err))
            .catch((err) => next(err))
        } else {
            // check if already that dish stored as a favorite dish
            if(favorite.dishes.indexOf(req.params.favoriteId) === -1) {
            favorite.dishes.push(req.params.favoriteId);
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                res.statusCode=200;
               res.setHeader('Content-Type', 'application/json');
               res.json(favorite);
                },(err) => next(err))
                .catch((err) => next(err))
            },(err) => next(err))
            .catch((err) => next(err))
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json("already exist as a favorite dish");
            }
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
     res.statusCode = 403;
    res.end('Put operation not supported on /favorite/'+req.params.favoriteId);
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user:req.user._id})
    .then((favorite) => {
        if(favorite !== null) {
         if(favorite.dishes.indexOf(req.params.favoriteId) !== -1){
           favorite.dishes.splice(favorite.dishes.indexOf(req.params.favoriteId),1);
           favorite.save()
           .then((favorite) => {
               if(favorite.dishes.length >= 1) {
                Favorites.findById(favorite._id)
               .populate('user')
               .populate('dishes')
               .then((favorite) => {
              res.statusCode = 200;
              res.setHeader('Content-Type','application/json');
              res.json(favorite);
               },(err) => next(err))
            .catch((err) => next(err))
               } else {
                   Favorites.findByIdAndRemove(favorite._id)
                   .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json([]);
                 }, (err) => next(err))
                 .catch((err) => next(err));
               }
              
           },(err) => next(err))
        .catch((err) => next(err))
         } else {
        var err = new Error("This dish id :" + req.params.favoriteId+"is not your favorite dish.");
        err.status = 404;
        return next(err);
         }
        } else {
        var err = new Error(req.user.username+ "has no favorites");
        err.status = 404;
        return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err))
});

module.exports = favoriteRouter;