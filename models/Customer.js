const mongoose = require('mongoose')

const Adress = new mongoose.Schema({
    street: String,
    number: Number,
    complement: String,
    reference: String,
    neighborhood: String,
    city: String,
    state: String,
    postalCode: String
})

const Customer = mongoose.model('Customer',{
    clientNumber: String,
    name: String,
    email: String,
    phoneWP: String,
    phoneOther: String,
    adress: Adress,
    password: String,
    confirmationRetrieveCode: String,
    emailConfirmation: Boolean
})

module.exports = Customer