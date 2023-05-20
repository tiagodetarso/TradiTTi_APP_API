// configuração inicial
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const app = express()


const cors = require('cors')

// utilizar o cors
app.use(cors({origin: '*'}))

// forma de ler JSON
app.use(
    express.urlencoded({
        extended: true
    }),)

// config json response
app.use(express.json())

// rotas
const customerRoutes = require('./routes/customerRoutes')
app.use('/customer', customerRoutes)

// Rota inicial / endpoint
app.get('/', (req, res) => {
    res.status(200).json({msg: "API TradiTTio App!"})
})

//Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose
    .connect(
        `mongodb+srv://${dbUser}:${dbPassword}@cluster0.edwo045.mongodb.net/?retryWrites=true&w=majority`
        )
    .then(() => {
        console.log('Conectado ao banco de dados')
        app.listen(4500)
    })
    .catch((err) => console.log(err))


// entregar uma porta
app.listen(4000)


/*
Projeto NodeMailer
https://console.cloud.google.com/apis/credentials?project=nodemailer-386913 

Refresh Token
https://developers.google.com/oauthplayground/?code=4/0AbUR2VN916R0hSPFV3nVWGTC_0ge53Wao298x-wHb587z-ChBmEmEG5asMEnznqlU6I9cA&scope=https://mail.google.com/
*/