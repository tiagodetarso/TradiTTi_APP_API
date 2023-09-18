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

const clientUserRoutes = require('./routes/clientUsersRoutes')
app.use('/clientuser', clientUserRoutes)

const productRoutes = require('./routes/productRoutes')
app.use('/product', productRoutes)

const clientRoutes = require('./routes/clientRoutes')
app.use('/client', clientRoutes)

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
        app.listen(process.env.MONGO_PORT || 4500)
    })
    .catch((err) => console.log(err))


// entregar uma porta
app.listen(process.env.CLIENT_PORT || 4000)
