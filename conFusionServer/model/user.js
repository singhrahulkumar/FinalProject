var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    // automatically added by passpportlocalmongoose
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // password:  {
    //     type: String,
    //     required: true
    // },
     firstname: {
      type: String,
        default: ''
    },
    lastname: {
      type: String,
        default: ''
    },
    facebookId: String,
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);