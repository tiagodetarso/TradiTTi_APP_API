const mongoose = require('mongoose')

const Token = mongoose.model('Token',{
    clientNumber: String,
    refreshToken: String
})

module.exports = Token