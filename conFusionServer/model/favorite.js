const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user:  {
       // type: String,
       // required: true
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [{
              type:mongoose.Schema.Types.ObjectId,
              ref: 'dish'
            }]
}, {
    timestamps: true
});

var Favorites = mongoose.model('Favorite',favoriteSchema);
module.exports = Favorites;