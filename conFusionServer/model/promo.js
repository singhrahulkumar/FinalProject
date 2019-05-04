const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const currency = mongoose.Types.Currency;

const promoSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        label: {
            type: String,
            default: ''
        },
        price: {
            type: currency,
            min: 0,
            required: true
        },
        description: {
            type: String,
            required:true
        },
        featured: {
            type: Boolean,
            required: true
        }
},{
    timestamps: true
});

var promos = mongoose.model('promo',promoSchema);

module.exports = promos;