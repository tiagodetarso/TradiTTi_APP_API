const router = require('express').Router()
const bcrypt = require('bcrypt')

const Customer = require('../models/Customer')

const nodemailer = require('nodemailer')

//nodemailer parameters
const user = process.env.NODEMAILER_USER_MAIL
const pass = process.env.NODEMAILER_PASSWORD
const clientId = process.env.NODEMAILER_CLIENT_ID
const clientSecret = process.env.NODEMAILER_CLIENT_SECRET
const refreshToken = process.env.NODEMAILER_REFRESH_TOKEN

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: 'OAuth2',
        user: user,
        pass: pass,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken
    }
})

// CUSTOMER REGISTER ROUTE (usa o nodemailer)
router.post('/register', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, firstName, lastName, email, phoneWP, phoneOther, street, number, complement, reference, neighborhood, city, state, postalCode, password, confirmPassword } = req.body

    // validations
    if (!firstName) {
        return res.status(422).json({msg: "O preenchimento do campo 'nome' é obrigatório!"})
    }

    if (!lastName) {
        return res.status(422).json({msg: "O preenchimento do campo 'sobrenome' é obrigatório!"})
    }

    if (!email) {
        return res.status(422).json({msg: "O preenchimento do campo 'e-mail' é obrigatório!"})
    }

    if (!phoneWP && !phoneOther) {
        return res.status(422).json({msg: "Ao menos um dos números de telefone deve ser preenchido."})
    }

    if (!street) {
        return res.status(422).json({msg: "O preenchimento do nome da rua, travessa ou avenida é obrigatório!"})
    }

    if (!number) {
        return res.status(422).json({msg: "O preenchimento do número da casa ou edifício é obrigatório!"})
    }

    if (!neighborhood) {
        return res.status(422).json({msg: "A escolha de um bairro ou distrito é obrigatória!"})
    }

    if (!city) {
        return res.status(422).json({msg: "O preenchimento do nome da cidade é obrigatório!"})
    }

    if (!state) {
        return res.status(422).json({msg: "O preenchimento do estado é obrigatório!"})
    }

    if (!password) {
        return res.status(422).json({msg: "Você precisa definir uma senha!"})
    }

    if (password.length < 4) {
        return res.status(422).json({msg: "Sua senha precisa ter, no mínimo, 4 caracteres"})
    }

    if (password !== confirmPassword) {
        return res.status(422).json({msg: 'As senhas digitadas não são iguais'})
    }

    // check if customer exists
    const customerExists = await Customer.findOne({
        $and:
            [
               { clientNumber : clientNumber },
               { email: email }
            ]
      })
    
    if (customerExists && customerExists.emailConfirmation === true) {
        return res.status(422).json({ msg: "Já há um cliente registrado com este e-mail. Use outro endereço ou recupere a senha do e-mail tentado"})
    }

    if (customerExists && customerExists.emailConfirmation === false) {
        
        const mailOptions = {
            from: user,
            to: email,
            subject: 'Código de Confirmação de Cadastro - Bosto Esfiharia TradiTTi App',
            text: 
                `Olá, ${customerExists.name}!
    
                Você realizou seu cadastro no Bosto Esfiharia TradiTTi App com sucesso.
    
                Porém ainda resta uma etapa para começar a utilizá-lo que é a confirmação do cadastro.
    
                O código para confirmação do seu cadastro é: ${customerExists.confirmationRetrieveCode}
    
    
                Atenciosamente,
                Equipe TradiTTi App`    
        }

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error)
            } else {
                res.status(201).json({msg:`Código de confirmação enviado para ${email}`})
            }
        })

        return res.status(422).json({ msg: `E-mail já cadastrado. Código de confirmação reenviado` }) 
    }

    //create password
    const salt = await bcrypt.genSalt(7)
    const passwordHash = await bcrypt.hash(password, salt)

    //generate password retrieve code
    const retrievePasswordCode = []
    for (var i=0; i<6; i++) {
        let aleatorio = Math.floor(Math.random() * 10)
        retrievePasswordCode.push(aleatorio)
    }
    const codigoString = `${retrievePasswordCode[0]}${retrievePasswordCode[1]}${retrievePasswordCode[2]}${retrievePasswordCode[3]}${retrievePasswordCode[4]}${retrievePasswordCode[5]}`

    const name = firstName+' '+lastName

    //create customer
    const customer = new Customer({
        clientNumber,
        name,
        email,
        phoneWP,
        phoneOther,
        adress:{
            street,
            number,
            complement,
            reference,
            neighborhood,
            city,
            state,
            postalCode
        },
        password: passwordHash,
        confirmationRetrieveCode: codigoString,
        emailConfirmation: false
    })

    const mailOptions = {
        from: user,
        to: email,
        subject: 'Código de Confirmação de Cadastro - Bosto Esfiharia TradiTTi App',
        text: 
            `Olá, ${name}!

            Você realizou seu cadastro no Bosto Esfiharia TradiTTi App com sucesso.

            Porém ainda resta uma etapa para começar a utilizá-lo que é a confirmação do cadastro.

            O código para confirmação do seu cadastro é: ${codigoString}


            Atenciosamente,
            Equipe TradiTTi App`    
    }

    //save new customer
    try {
        await customer.save()
    
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error)
            } else {
                res.status(201).json({msg:`Código de confirmação enviado para ${email}`})
            }
        })
    
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})


// CUSTOMER LOGIN ROUTE
router.post('/login', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, email, password } = req.body

    // validations
    if (!email) {
        return res.status(422).json({msg: "Você não digitou o endereço de e-mail!"})
    }

    if (!password) {
        return res.status(422).json({msg: "Você não digitou a senha!"})
    }

    // check if customer exists
    const customer = await Customer.findOne({
            $and:
                [
                   { clientNumber : clientNumber },
                   { email: email }
                ]
          })

    if (!customer) {
        return res.status(404).json({ msg: "Não foi encontrado cliente com este endereço de e-mail!"})
    }

    // check if the password match
    const checkPassword = await bcrypt.compare(password, customer.password)

    if (!checkPassword ) {
        return res.status(422).json({msg: "Senha inválida!"})
    }
    
    if (!customer.emailConfirmation) {
        return res.status(422).json({msg: "Seu cadastro não foi validado!"})
    }

    try {
        const content =
            {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                adress: customer.adress,
                phoneWP: customer.phoneWP
            }
        res.status(200).json({msg: "Login realizado com sucesso", content})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})


// E-MAIL VALIDATION ROUTE
router.patch('/validate', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const { clientNumber, email, confirmationRetrieveCode } = req.body

    // validations
    if (!confirmationRetrieveCode) {
        return res.status(422).json({msg: "Você não digitou o código de confirmação!"})
    }

    // check if customer exists
    const customer = await Customer.findOne({
        $and:
            [
               { clientNumber : clientNumber },
               { email: email }
            ]
      })
    
    if (!customer) {
        return res.status(404).json({ msg: "Não foi encontrado cadastro de cliente com este endereço de e-mail!"})
    }

    // check if the validate/retrieve code
    if (confirmationRetrieveCode !== customer.confirmationRetrieveCode) {
        return res.status(422).json({msg: "O código digitado esta incorreto!"})
    } else {

    const retrievePasswordCode = []
    for (var i=0; i<6; i++) {
        let aleatorio = Math.floor(Math.random() * 10)
        retrievePasswordCode.push(aleatorio)
    }
    const codigoString = `${retrievePasswordCode[0]}${retrievePasswordCode[1]}${retrievePasswordCode[2]}${retrievePasswordCode[3]}${retrievePasswordCode[4]}${retrievePasswordCode[5]}`

    try {
        const updateConfirmationRetrieveCode = await Customer.findOneAndUpdate({$and:[{ clientNumber : clientNumber },{ email: email }]}, {confirmationRetrieveCode: codigoString})
        const updateEmailConfirmation = await Customer.findOneAndUpdate({$and:[{ clientNumber : clientNumber },{ email: email }]}, {emailConfirmation: true})
    
        res.status(200).json({msg: "Cadastro validado com sucesso!"})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
    }
})


// SEND PASSWORD RETRIEVE CODE ROUTE (usa o nodemailer)
router.post('/sendcode', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, email } = req.body

    // validations
    if (!email) {
        return res.status(422).json({msg: "Você não digitou o e-mail!"})
    }

    // check if customer exists
    const customer = await Customer.findOne({
        $and:
            [
               { clientNumber : clientNumber },
               { email: email }
            ]
      })
    
    if (!customer) {
        return res.status(404).json({ msg: "Não foi encontrado cadastro de cliente com este endereço de e-mail!"})
    }

    const mailOptions = {
        from: user,
        to: email,
        subject: 'Código de Recuperação de Senha - Bosto Esfiharia TradiTTi App',
        text: 
            `Olá ${customer.name}!

            Você solicitou código para redefinição a senha do Boston Esfiharia TradiTTi App.

            O código para que possa redefinir a senha é: ${customer.confirmationRetrieveCode}

            Atenciosamente,
            Equipe TradiTTi App`    
    }

    try {
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error)
            } else {
                res.status(201).json({msg:`Código enviado para ${email}`})
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})


// PASSWORD RESET ROUTE
router.patch('/reset', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const { clientNumber, email, retrieveCode, password, confirmPassword } = req.body

    // validations
    if (!password) {
        return res.status(422).json({msg: "Você não digitou uma nova senha!"})
    }

    if (!confirmPassword) {
        return res.status(422).json({msg: "Você não digitou a confirmação da nova senha!"})
    }

    if(password !== confirmPassword) {
        return res.status(422).json({msg: "As senhas digitadas são diferentes entre si!"})
    }

    // find customer
    const customer = await Customer.findOne({
        $and:
            [
               { clientNumber : clientNumber },
               { email: email }
            ]
      })

    // check if the validate/retrieve code
    if (retrieveCode !== customer.confirmationRetrieveCode) {
        return res.status(422).json({msg: "O código digitado esta incorreto!"})
    }

    const saltt = await bcrypt.genSalt(12)
    const newPasswordHash = await bcrypt.hash(password, saltt)

    const retrievePasswordCode = []
    for (var i=0; i<6; i++) {
        let aleatorio = Math.floor(Math.random() * 10)
        retrievePasswordCode.push(aleatorio)
    }
    const codigoString = `${retrievePasswordCode[0]}${retrievePasswordCode[1]}${retrievePasswordCode[2]}${retrievePasswordCode[3]}${retrievePasswordCode[4]}${retrievePasswordCode[5]}`

    try {
        const updatePassword = await Customer.findOneAndUpdate({$and:[{ clientNumber : clientNumber },{ email: email }]}, {password: newPasswordHash})
        const updateCode = await Customer.findOneAndUpdate({$and:[{ clientNumber : clientNumber },{ email: email }]}, {confirmationRetrieveCode: codigoString })
    
        res.status(200).json({msg: "Senha redefinida com sucesso!"})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

module.exports = router
