const router = require('express').Router()
const bcrypt = require('bcrypt')

const ClientUser = require('../models/ClientUser')
const Token = require('../models/Token')

const nodemailer = require('nodemailer')
const { VirtualType } = require('mongoose')

//nodemailer parameters
const user = process.env.NODEMAILER_USER_MAIL
const pass = process.env.NODEMAILER_PASSWORD
const clientId = process.env.NODEMAILER_CLIENT_ID
const clientSecret = process.env.NODEMAILER_CLIENT_SECRET
var token = ""
var transporter

async function RefreshToken() {
    try {
       const refreshToken0001 = await Token.findOne({ clientNumber: "0001" })
       return refreshToken0001
    } catch (error) {
       console.error("Erro ao buscar o token:", error)
    }
}

function NewToken () {
(async () => {
    token = await RefreshToken()

    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: 'OAuth2',
            user: user,
            pass: pass,
            clientId: clientId,
            clientSecret: clientSecret,
            refreshToken: token.refreshToken
        }
    })
 })()}

 NewToken()
 setInterval(NewToken, 60*60*1000)

// CLIENTUSER LOGIN ROUTE
router.post('/login', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, userName, password } = req.body

    // validations
    if (!userName) {
        return res.status(422).json({msg: "Você não digitou seu nome de usuário!"})
    }

    if (!password) {
        return res.status(422).json({msg: "Você não digitou a senha!"})
    }

    // check if clientUser exists
    const clientUser = await ClientUser.findOne({
            $and:
                [
                   { clientNumber : clientNumber },
                   { userName: userName }
                ]
          })

    if (!clientUser) {
        return res.status(404).json({ msg: "Esse nome de usuário não existe no sistema."})
    }

    // check if the password match
    const checkPassword = await bcrypt.compare(password, clientUser.password)

    if (!checkPassword ) {
        return res.status(422).json({msg: "Senha inválida!"})
    }
    
    try {
        const content =
            {
                id: clientUser.id,
                name: clientUser.name,
                userName: clientUser.userName,
                isManager: clientUser.isManager,
            }
        res.status(200).json({msg: "Login realizado com sucesso", content})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// CUSTOMER USER REGISTRATION ROUTE
router.post('/userregister', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, name, userName, email, isManager, password, confirmPassword } = req.body

    // validations
    if (!name) {
        return res.status(422).json({msg: "O preenchimento do campo 'nome' é obrigatório!"})
    }

    if (!userName) {
        return res.status(422).json({msg: "O preenchimento do campo 'sobrenome' é obrigatório!"})
    }

    if (!email) {
        return res.status(422).json({msg: "O preenchimento do campo 'e-mail' é obrigatório!"})
    }

    if (!password) {
        return res.status(422).json({msg: "Você precisa definir uma senha!"})
    }

    if (password !== confirmPassword) {
        return res.status(422).json({msg: 'As senhas digitadas não são iguais'})
    }

    // check if clientUser exists
    const clientUserExists = await ClientUser.findOne({
        $and:
            [
               { clientNumber : clientNumber },
               { userName: userName }
            ]
      })
    
    if (clientUserExists) {
        return res.status(422).json({ msg: "Já há um usuário registrado com nome de usuário."})
    }

    //create password
    const salt = await bcrypt.genSalt(4)
    const passwordHash = await bcrypt.hash(password, salt)

    //generate password retrieve code
    const retrievePasswordCode = []
    for (var i=0; i<6; i++) {
        let aleatorio = Math.floor(Math.random() * 10)
        retrievePasswordCode.push(aleatorio)
    }
    const codigoString = `${retrievePasswordCode[0]}${retrievePasswordCode[1]}${retrievePasswordCode[2]}${retrievePasswordCode[3]}${retrievePasswordCode[4]}${retrievePasswordCode[5]}`

    //create clientUser
    const clientUser = new ClientUser({
        clientNumber,
        name,
        userName,
        email,
        isManager,
        password: passwordHash,
        confirmationRetrieveCode: codigoString,
    })

    //save new clientUser
    try {
        await clientUser.save()
        res.status(201).json({msg:`Usuário cadastrado com sucesso!`})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// SEND PASSWORD RETRIEVE CODE ROUTE (usa o nodemailer)
router.post('/retrievepass', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, userName } = req.body

    // validations

    if (!userName) {
        return res.status(422).json({msg: "Você não digitou seu nome de usuário!", content: ''})
    }

    // check if user exists
    const clientUser = await ClientUser.findOne({
        $and:
            [
               { clientNumber : clientNumber },
               { userName: userName }
            ]
      })
    
    if (!clientUser) {
        return res.status(404).json({ msg: "Não foi encontrado cadastro de com este nome de usuário e/ou nº do cliente!", content: ''})
    }

    const mailOptions = {
        from: user,
        to: clientUser.email,
        subject: 'Código de Recuperação de Senha - Bosto Esfiharia TradiTTi App',
        text: 
            `Olá ${clientUser.name}!

            Você solicitou código para redefinição a senha do Boston Esfiharia TradiTTi App.

            O código para que possa redefinir a senha é: ${clientUser.confirmationRetrieveCode}

            Atenciosamente,
            Equipe TradiTTi App`    
    }

    try {
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error)
            } else {
                res.status(201).json({ msg:`Código de recuperação enviado para ${clientUser.email}`, content: clientUser.email })
            }
        })
    
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!", content: ''})
    }
})

// PASSWORD RESET ROUTE
router.patch('/resetpass', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const { clientNumber, userName, confirmationRetrieveCode, password, confirmPassword } = req.body

    // validations
    if (!clientNumber) {
        return res.status(422).json({msg: "Você não digitou o número do cliente!"})
    }

    if (!userName) {
        return res.status(422).json({msg: "Você não digitou seu nome de usuário!"})
    }

    if (!confirmationRetrieveCode) {
        return res.status(422).json({msg: "Você não digitou o código de recuperação!"})
    }

    if (!password) {
        return res.status(422).json({msg: "Você não digitou uma nova senha!"})
    }

    if (!confirmPassword) {
        return res.status(422).json({msg: "Você não digitou a confirmação da nova senha!"})
    }

    if(password !== confirmPassword) {
        return res.status(422).json({msg: "As senhas digitadas são diferentes entre si!"})
    }

    // find clientUser
    const clientUser = await ClientUser.findOne({
        $and:
            [
               { clientNumber : clientNumber },
               { userName: userName }
            ]
      })

    // check if the validate/retrieve code
    if (confirmationRetrieveCode !== clientUser.confirmationRetrieveCode) {
        return res.status(422).json({msg: "O código de recuperação digitado esta incorreto!"})
    }

    const saltt = await bcrypt.genSalt(4)
    const newPasswordHash = await bcrypt.hash(password, saltt)

    const retrievePasswordCode = []
    for (var i=0; i<6; i++) {
        let aleatorio = Math.floor(Math.random() * 10)
        retrievePasswordCode.push(aleatorio)
    }
    const codigoString = `${retrievePasswordCode[0]}${retrievePasswordCode[1]}${retrievePasswordCode[2]}${retrievePasswordCode[3]}${retrievePasswordCode[4]}${retrievePasswordCode[5]}`

    try {
        const updatePassword = await ClientUser.findOneAndUpdate({$and:[{ clientNumber : clientNumber },{ userName: userName }]}, {password: newPasswordHash})
        const updateCode = await ClientUser.findOneAndUpdate({$and:[{ clientNumber : clientNumber },{ userName: userName }]}, {confirmationRetrieveCode: codigoString })
    
        res.status(200).json({msg: "Senha redefinida com sucesso!"})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// PASSWORD CHANGE ROUTE
router.patch('/changepass', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const { clientNumber, userName, password, newPassword, confirmNewPassword } = req.body

    // validations
    if (!clientNumber) {
        return res.status(422).json({msg: "Você não digitou o número do cliente!"})
    }

    if (!userName) {
        return res.status(422).json({msg: "Você não digitou seu nome de usuário!"})
    }

    if (!newPassword) {
        return res.status(422).json({msg: "Você não digitou uma nova senha!"})
    }

    if (!confirmNewPassword) {
        return res.status(422).json({msg: "Você não digitou a confirmação da nova senha!"})
    }

    if(newPassword !== confirmNewPassword) {
        return res.status(422).json({msg: "As senhas digitadas são diferentes entre si!"})
    }

    // check if customer exists
    const clientUser = await ClientUser.findOne({
        $and:
            [
               { clientNumber : clientNumber },
               { userName: userName }
            ]
      })

    // check if the password match
    const checkPassword = await bcrypt.compare(password, clientUser.password)

    if (!checkPassword ) {
        return res.status(422).json({msg: "Senha inválida!"})
    }
  
    const saltt = await bcrypt.genSalt(8)
    const newPasswordHash = await bcrypt.hash(newPassword, saltt)

    try {
        const updatePassword = await ClientUser.findOneAndUpdate({$and:[{ clientNumber : clientNumber },{ userName: userName }]}, {password: newPasswordHash})
    
        res.status(200).json({msg: "Senha alterada com sucesso!"})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

module.exports = router