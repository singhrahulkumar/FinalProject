var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config.js');
var User = require('./model/user');
var Dishes = require('./model/dish');

exports.local =passport.use(new LocalStrategy(User.authenticate()));
// support for session in passport
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        //console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = function(req,res,next) {
    if(req.user.admin) {
        next();
    } else {
        var err = new Error("You are not Authorized to Perform this Operation.")
        err.status = 403;
        next(err);
    }
};

exports.checkAuthor = function(req,res,next) {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish != null && dish.comments.id(req.params.commentId) != null) {
            console.log(dish.comments.id(req.params.commentId).author.equals(req.user._id));
            console.log(dish.comments.id(req.params.commentId).author,req.user._id);
           if(dish.comments.id(req.params.commentId).author.equals(req.user._id)) {
             next();
           } else {
              var err = new Error("You are not Authorized to Perform this Operation.")
              err.status = 403;
              next(err);
            }
        } 
         else if (dish == null) {
            var err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
             next(err);
        }
        else {
            var err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
             next(err);            
        }

    })
    .catch((err) => next(err));
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                return done(null, user);
            }
            else {
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err)
                        return done(err, false);
                    else
                        return done(null, user);
                })
            }
        });
    }
));