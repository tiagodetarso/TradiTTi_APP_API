const mongoose = require('mongoose')

const Product = mongoose.model('Product',{
    clientNumber: String,
    type: String,
    subType: String,
    specification: String,
    subSpecification: String,
    unity: String,
    value: Number, 
    promotionValue: Number,
    fixPromotionDay: Number,
    promotionInitialDate: Date,
    promotionFinalDate: Date,
    image: String,
    promotionImage: String,
    thereIs: Boolean
})

module.exports = Product