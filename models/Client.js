const mongoose = require('mongoose')

const Client = mongoose.model('Client',{
    clientNumber: String,
    name: String,
    isOpen: Boolean,
    deliveryGap: String,
    pickupGap: String,
    deliveryFee: Object
})

module.exports = Client