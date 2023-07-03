const mongoose = require('mongoose')

const ClientUser = mongoose.model('ClientUser',{
    clientNumber: String,
    name: String,
    userName: String,
    email: String,
    isManager: Boolean,
    password: String,
    confirmationRetrieveCode: String
})

module.exports = ClientUser