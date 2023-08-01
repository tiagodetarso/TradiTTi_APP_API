const router = require('express').Router()
const bcrypt = require('bcrypt')

const Client = require('../models/Client')

// CLIENT REGISTRATION ROUTE
router.post('/register', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, name} = req.body

    // validations
    if (!clientNumber) {
        return res.status(422).json({msg: "Não há número do cliente"})
    }

    if (!name) {
        return res.status(422).json({msg: "Não há nome do cliente"})
    }

    // check if client exists
    const clientExists = await Client.findOne({
        $or:
            [
               { clientNumber : clientNumber },
               { name: name }
            ]
      })
    
    if (clientExists) {
        return res.status(422).json({ msg: "Um cliente já esta cadastrado com esse número de Cliente e/ou nome!"})
    }

    //create product
    const client = new Client({
        clientNumber,
        name,
        isOpen: false,
        deliveryGap: "",
        pickupGap: "",
        deliveryFee: {
            "NÃO MORO EM ASTORGA": 0,
            "CENTRO": 0,
            "CJ ALVORADA": 0,
            "CJ ANTONIO LOURENÇO I": 0,
            "CJ ANTONIO LOURENÇO II": 0,
            "CJ HAB DIMAS DURAES": 0,
            "CJ HAB VERELENA": 0,
            "CJ SOL NASCENTE": 0,
            "DISTR ICARA": 0,
            "DISTR SANTA ZELIA": 0,
            "DISTR TUPINAMBA": 0,
            "GRALHA AZUL": 0,
            "GRANADA": 0,
            "GLEBA PATRIMONIO": 0,
            "GLEBA RIBEIRÃO": 0,
            "GLEBA PARANAGUÁ": 0,
            "GLEBA PIMPINELA": 0,
            "JD ALTO DA BOA VISTA": 0,
            "JD ASTORGA": 0,
            "JD BALNEARIO GUANABARA": 0,
            "JD BELA VISTA": 0,
            "JD BELUCO": 0,
            "JD CENTRAL": 0,
            "JD DAS TORRES I": 0,
            "JD DAS TORRES II": 0,
            "JD IMPERIAL": 0,
            "JD ITALIA": 0,
            "JD JACOMO VISCARDI": 0,
            "JD LICCE I": 0,
            "JD LICCE II": 0,
            "JD LIOGI CAVALARI": 0,
            "JD LONDRINA": 0,
            "JD NOVA VENEZA": 0,
            "JD PANORAMA I": 0,
            "JD PARANORAMA II": 0,
            "JD PARANA I": 0,
            "JD PARANA II": 0,
            "JD PLANALTO": 0,
            "JD SAO BENEDITO": 0,
            "JD SAO JOSE": 0,
            "JD SAO PAULO": 0,
            "JD SINUELO": 0,
            "JD TAQUARI": 0,
            "JD VITORIA REGIA": 0,
            "JOAO JULIANI": 0,
            "PQ INDUSTR RECIERI RESQUETI": 0,
            "PQ INDUSTR ADELINO SALVADOR": 0,
            "RES TIMBO": 0,
            "VL APARECIDA": 0,
            "VL BANDEIRANTES": 0,
            "VL BRASIL": 0,
            "VL EDMEIA": 0,
            "VL EDMUNDO ROTHER": 0,
            "VL FRANCISCO SILVA": 0,
            "VL IMAGUIRI": 0,
            "VL INDUSTRIAL": 0,
            "VL IVO MENDES": 0,
            "VL MOREIRA": 0,
            "VL NOVA": 0,
            "VL NOVA AMERICA": 0,
            "VL OLIVIA": 0,
            "VL PAULISTA": 0,
            "VL RIOS": 0,
            "VL SAMUEL": 0,
            "VL TREVISAN": 0,
            "VL ZANIN": 0
        }
    })

    //save new clientUser
    try {
        await client.save()
        res.status(200).json({msg:`Client cadastrado com sucesso!`})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// CLIENT ISOPEN ROUTE
router.post('/isopen', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber } = req.body

    // validations
    if (!clientNumber) {
        return res.status(422).json({msg: "Não foi passado o número do cliente"})
    }

    // check if client exists
    const clientExists = await Client.findOne({ clientNumber : clientNumber })
    
    if (!clientExists) {
        return res.status(422).json({ msg: "Não há cliente cadastrado com esse número de cliente"})
    }

    //save new clientUser
    try {
        const content = {name: clientExists.name, isOpen: clientExists.isOpen,}
        res.status(200).json({msg: "Pesquisa realizada com sucesso!", content})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// CLIENT OPEN/CLOSE ROUTE
router.patch('/openclose', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const { clientNumber, isOpen } = req.body

    // find client
    const clientExists = await Client.findOne({ clientNumber : clientNumber })
    
    if (!clientExists) {
        return res.status(422).json({ msg: "Esse cliente não existe."})
    }

    try{
        if(isOpen === false) {
            const updateClient = await Client.findOneAndUpdate({clientNumber: clientNumber}, {isOpen: isOpen})
            res.status(200).json({msg: "Sua loja foi fechada com SUCESSO"})
        } else {
            const updateClient = await Client.findOneAndUpdate({clientNumber: clientNumber}, {isOpen: isOpen})
            res.status(200).json({msg: "Sua loja foi aberta com SUCESSO"})
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }

})

// CLIENT DELIVERY GAP CHANGE ROUTE
router.patch('/deliverygap', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const { clientNumber, deliveryGap } = req.body

    // find client
    const clientExists = await Client.findOne({ clientNumber : clientNumber })
    
    if (!clientExists) {
        return res.status(422).json({ msg: "Esse cliente não existe."})
    }

    try{  
        const updateClient = await Client.findOneAndUpdate({clientNumber: clientNumber}, {deliveryGap: deliveryGap})
        res.status(200).json({msg: "Tempo DELIVERY atualizado com sucesso"})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// CLIENT PICKUP GAP CHANGE ROUTE
router.patch('/pickupgap', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const { clientNumber, pickupGap } = req.body

    // find client
    const clientExists = await Client.findOne({ clientNumber : clientNumber })
    
    if (!clientExists) {
        return res.status(422).json({ msg: "Esse cliente não existe."})
    }

    try{  
        const updateClient = await Client.findOneAndUpdate({clientNumber: clientNumber}, {pickupGap: pickupGap})
        res.status(200).json({msg: "Tempo BALCÃO atualizado com sucesso"})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// CLIENT DELIVERY FEE CHANGE ROUTE
router.patch('/deliveryfee', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const { clientNumber, neighborhood, fee } = req.body
    const bairro = `deliveryFee.${neighborhood}`

    // find client
    const clientExists = await Client.findOne({ clientNumber : clientNumber })
    
    if (!clientExists) {
        return res.status(422).json({ msg: "Esse cliente não existe."})
    }

    try{  
        const updateClient = await Client.findOneAndUpdate({clientNumber: clientNumber}, {$set:{[bairro]: Number(fee)}},{new:true})
        res.status(200).json({msg: "Taxa de Entrega atualizada com sucesso"})
    }
    catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// CLIENT DELYVERYGAP ROUTE
router.post('/getdeliverygap', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber } = req.body

    // validations
    if (!clientNumber) {
        return res.status(422).json({msg: "Não foi passado o número do cliente"})
    }

    // check if client exists
    const clientExists = await Client.findOne({ clientNumber : clientNumber })
    
    if (!clientExists) {
        return res.status(422).json({ msg: "Não há cliente cadastrado com esse número de cliente"})
    }

    //save new clientUser
    try {
        const content = {deliveryGap: clientExists.deliveryGap}
        res.status(200).json({msg: "Pesquisa realizada com sucesso!", content})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// CLIENT PICKUPGAP ROUTE
router.post('/getpickupgap', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber } = req.body

    // validations
    if (!clientNumber) {
        return res.status(422).json({msg: "Não foi passado o número do cliente"})
    }

    // check if client exists
    const clientExists = await Client.findOne({ clientNumber : clientNumber })
    if (!clientExists) {
        return res.status(422).json({ msg: "Não há cliente cadastrado com esse número de cliente"})
    }

    //save new clientUser
    try {
        const content = {pickupGap: clientExists.pickupGap}
        res.status(200).json({msg: "Pesquisa realizada com sucesso!", content})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// CLIENT DELYVERY FEE ROUTE
router.post('/getdeliveryfee', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber } = req.body
    
    // validations
    if (!clientNumber) {
        return res.status(422).json({msg: "Não foi passado o número do cliente"})
    }

    // check if client exists
    const clientExists = await Client.findOne({ clientNumber : clientNumber })
    
    if (!clientExists) {
        return res.status(422).json({ msg: "Não há cliente cadastrado com esse número de cliente"})
    }
    //save new clientUser
    try {
        const content = {deliveryFee: clientExists.deliveryFee}
        res.status(200).json({msg: "Pesquisa realizada com sucesso!", content})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})


module.exports = router