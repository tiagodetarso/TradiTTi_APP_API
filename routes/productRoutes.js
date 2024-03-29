const router = require('express').Router()
const bcrypt = require('bcrypt')

const Product = require('../models/Product')

// PRODUCT REGISTRATION ROUTE
router.post('/register', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, type, subType, specification, subSpecification, unity, value } = req.body
    const dataInicial = new Date()

    // validations
    if (!type) {
        return res.status(422).json({msg: "O preenchimento do campo 'Tipo de Produto' é obrigatório!"})
    }

    if (!subType) {
        return res.status(422).json({msg: "O preenchimento do campo 'Subtipo de Produto' é obrigatório!"})
    }

    if (!specification) {
        return res.status(422).json({msg: "O preenchimento do campo 'Especificação' é obrigatório!"})
    }

    if (!unity) {
        return res.status(422).json({msg: "O preenchimento do campo 'Unidade de Venda' é obrigatório!"})
    }

    if (!value) {
        return res.status(422).json({msg: "O preenchimento do campo 'Valor Unitário' é obrigatório!"})
    }

    // check if product exists
    const productExists = await Product.findOne({
        $and:
            [
               { clientNumber : clientNumber },
               { type: type },
               { subType: subType},
               { specification: specification},
               { unity: unity}
            ]
      })
    
    if (productExists) {
        return res.status(422).json({ msg: "Este produto já está cadastrado!"})
    }

    //create product
    const product = new Product({
        clientNumber,
        type,
        subType,
        specification,
        subSpecification,
        unity,
        value,
        promotionValue: 0,
        fixPromotionDay: 7,
        promotionInitialDate: dataInicial,
        promotionFinalDate: dataInicial,
        image:"",
        promotionImage:"",
        thereIs: false
    })

    //save new clientUser
    try {
        await product.save()
        res.status(200).json({msg:`Produto cadastrado com sucesso!`})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// EDIT PRODUCT ROUTE
router.patch('/edit', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const {id, clientNumber, type, subType, specification, subSpecification, unity, value } = req.body

    // validations
    if (!type) {
        return res.status(422).json({msg: "O preenchimento do campo 'Tipo de Produto' é obrigatório!"})
    }

    if (!subType) {
        return res.status(422).json({msg: "O preenchimento do campo 'Subtipo de Produto' é obrigatório!"})
    }

    if (!specification) {
        return res.status(422).json({msg: "O preenchimento do campo 'Especificação' é obrigatório!"})
    }

    if (!unity) {
        return res.status(422).json({msg: "O preenchimento do campo 'Unidade de Venda' é obrigatório!"})
    }

    if (!value) {
        return res.status(422).json({msg: "O preenchimento do campo 'Valor Unitário' é obrigatório!"})
    }

    //save changes
    try {
        const updateProduct = await Product.findOneAndUpdate({_id: id}, {type: type, subType: subType, specification: specification, subSpecification: subSpecification, unity: unity, value:value})
        res.status(200).json({msg:`Produto alterado com sucesso!`})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// EDIT PRODUCT ROUTE
router.patch('/editthereis', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const {id, thereIs } = req.body

    //save changes
    try {
        const updateProduct = await Product.findOneAndUpdate({_id: id}, {thereIs:!thereIs})
        res.status(200).json({msg:`Produto alterado com sucesso!`})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// EDIT PRODUCT IMAGE ROUTE
router.patch('/imageedit', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const {id, image } = req.body

    const imageSize = image.length

    // validations
    if (imageSize > 30000) {
        return res.status(422).json({msg: "A imagem não pode exceder o tamanho de 20Kb"})
    }

    if (!image) {
        return res.status(422).json({msg: "Nenhuma imagem foi selecionada"})
    }

    //save changes
    try {
        const updateProduct = await Product.findOneAndUpdate({_id: id}, {image: image})
        res.status(200).json({msg:`Imagem guardada com sucesso!`})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// PRODUCT LIST ROUTE
router.post('/list', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber } = req.body

    try {
        var product = await Product.find({clientNumber: clientNumber}, '-promotionValue -fixPromotionDay -promotionInitialDate -promotionFinalDate -promotionImage').sort({type:1, subType:1, unity:1, specification:1})
    } catch (error) {
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    } 

    if (!product) {
        res.status(404).json({ msg: "Nenhuma equivalência foi encontrada" })
    } else {
        res.status(200).json({msg: "Pesquisa bem sucedida!", content: product})
    }     
})

// PRODUCT SEARCH ROUTE
router.post('/search', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, specification } = req.body

    try {
        var product = await Product.find({$and:
            [{clientNumber: clientNumber}, {specification: specification}]}, 
            '-promotionValue -fixPromotionDay -promotionInitialDate -promotionFinalDate -promotionImage')
    } catch (error) {
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    } 

    if (!product) {
        res.status(404).json({ msg: "Nenhuma equivalência foi encontrada" })
    } else {
        res.status(200).json({msg: "Pesquisa bem sucedida!", content: product})
    }     
})

// DELETE PRODUCT ROUTE
router.post('/delete', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { id } = req.body

    // validations
    if (!id) {
        return res.status(422).json({msg: "Não foi encontrado documento a ser deletado"})
    }

    try {
        const deleteProduct = await Product.deleteOne({_id: id})
        res.status(200).json({msg: "Produto(s) deletado(s) com sucesso!"})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }

})

// REGISTER PRODUCT PROMOTION ROUTE
router.patch('/promotionregister', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "")

    const { id, promotionValue, fixPromotionDay, promotionInitialDate, promotionFinalDate } = req.body
    const agora = new Date()

    // validations
    if (!promotionValue) {
        return res.status(422).json({msg: "O preenchimento do valor promotional para o produto é obrigatório!"})
    }

    if (!fixPromotionDay && !promotionInitialDate && !promotionFinalDate) {
        return res.status(422).json({msg: "Para cadastrar uma promoção é preciso definir um dia fixo ou um período de tempo!"})
    }

    if (!promotionInitialDate && promotionFinalDate){
        return res.status(422).json({msg: "Ao definir um período de tempo para a promoção, é necessário escolher datas inicial e final!"})
    }

    // check if product exists
    const promotionExists = await Product.findOne({
        $and:
            [
               {_id : id },
               {$or: 
                    [
                        {fixPromotionDay: { $lt: 7 }},
                        {promotionFinalDate: { $gt: agora }}
                    ]
                }
            ]
      })
    
    if (promotionExists) {
        return res.status(422).json({ msg: "Este produto já possui promoção cadastrada!"})
    }

    // change product
    try {
        const updatePromotion = await Product.findOneAndUpdate(
            {_id: id}, 
            {
                promotionValue: promotionValue,
                fixPromotionDay: fixPromotionDay,
                promotionInitialDate: promotionInitialDate,
                promotionFinalDate: promotionFinalDate 
            }
        )
        res.status(200).json({msg:`Promoção cadastrada com sucesso!`})
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// EDIT PRODUCT PROMOTION IMAGE ROUTE
router.patch('/promotionimageregister', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const {id, image} = req.body

    const imageSize = image.length

    // validations
    if (imageSize > 30000) {
        return res.status(422).json({msg: "A imagem não pode exceder o tamanho de 20Kb"})
    }

    if (!image) {
        return res.status(422).json({msg: "Nenhuma imagem foi selecionada"})
    }

    //save changes
    try {
        const updateProduct = await Product.findOneAndUpdate({_id: id}, {promotionImage: image})
        res.status(200).json({msg:`Imagem da promoção guardada com sucesso!`})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// PRODUCT PROMOTION SEARCH ROUTE
router.post('/promotionlist', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber } = req.body
    const agora = new Date()

    try {
        var product = await Product.find(
            {$and:
                [
                    {clientNumber: clientNumber},
                    {$or: 
                        [
                            {fixPromotionDay: { $lt: 7 }},
                            {promotionFinalDate: { $gt: agora }}
                        ]
                    }
                ]
            },
            '-type -value -subSpecification -image')

    } catch (error) {
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    } 

    if (!product) {
        res.status(404).json({ msg: "Nenhuma equivalência foi encontrada" })
    } else {
        res.status(200).json({msg: "Pesquisa bem sucedida!", content: product})
    }     
})

// DELETE PRODUCT PROMOTION ROUTE
router.patch('/deletepromotion', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const { id } = req.body

    // change promotion
    try {
        const updatePromotion = await Product.findOneAndUpdate(
            {_id: id}, 
            {
                promotionValue: 0,
                fixPromotionDay: 7,
                promotionInitialDate: new Date(),
                promotionFinalDate: new Date()
            }
        )
        res.status(200).json({msg:`Promocao(oes) deletada(s) com sucesso!`})
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// EDIT PRODUCT PROMOTION ROUTE
router.patch('/promotionedit', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const { id, promotionValue, fixPromotionDay, promotionInitialDate, promotionFinalDate } = req.body
   

    // validations
    if (!promotionValue) {
        return res.status(422).json({msg: "O preenchimento do valor promotional para o produto é obrigatório!"})
    }

    if (!fixPromotionDay && !promotionInitialDate && !promotionFinalDate) {
        return res.status(422).json({msg: "Para cadastrar uma promoção é preciso definir um dia fixo ou um período de tempo!"})
    }

    if (!promotionInitialDate && promotionFinalDate){
        return res.status(422).json({msg: "Ao definir um período de tempo para a promoção, é necessário escolher datas inicial e final!"})
    }

    // change promotion
    try {const updatePromotion = await Product.findOneAndUpdate(
            {_id: id}, 
            {
                promotionValue: promotionValue,
                fixPromotionDay: fixPromotionDay,
                promotionInitialDate: promotionInitialDate,
                promotionFinalDate: promotionFinalDate 
            }
        )
        res.status(200).json({msg:`Promoção alterada com sucesso!`})
    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// EDIT PRODUCT IMAGE ROUTE
router.patch('/promotionimageedit', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "PATCH")

    const {id, image } = req.body

    const imageSize = image.length

    // validations
    if (imageSize > 30000) {
        return res.status(422).json({msg: "A imagem não pode exceder o tamanho de 20Kb"})
    }

    if (!image) {
        return res.status(422).json({msg: "Nenhuma imagem foi selecionada"})
    }

    //save changes
    try {
        const updateProduct = await Product.findOneAndUpdate({_id: id}, {promotionImage: image})
        res.status(200).json({msg:`Imagem guardada com sucesso!`})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    }
})

// PRODUCT SEARCH ROUTE FOR MOBILE LIST
router.post('/mobilelist', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber } = req.body

    try {
        var product = await Product.find({$and:[{clientNumber: clientNumber}, {thereIs:true}, {subType: {$ne: 'adicional es'}}, {subType: {$ne: 'adicional ed'}},{subType: {$ne: 'adicional pd'}}]}, '-image -promotionImage').sort({type:-1, subType:1, unity:1, specification:1})

        let thereIs = false
        var arrangedData = []
        let productData = []
        let titles = []
        for (const element of product) {
            for (let i=0; i < titles.length; i++) {
                if (element.subType === titles[i]) {
                    thereIs = true
                }
            }
            if (thereIs === false) {
                titles.push(element.subType)
            } else {
                thereIs = false
            }
            productData.push(element)
        }
        
        for (let i=0; i<titles.length; i++) {
            let titulo = titles[i]
            let dados = []

            for (product of productData) {
                if (product.subType === titulo) {
                    dados.push(product)
                }
            }
            arrangedData.push({title: titulo, data: dados})
        }

    } catch (error) {
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    } 

    if (!product) {
        res.status(404).json({ msg: "Nenhuma equivalência foi encontrada" })
    } else {
        res.status(200).json({msg: "Pesquisa bem sucedida!", content: arrangedData})
    }     
})

// EXTRA SEARCH ROUTE FOR MOBILE LIST
router.post('/extralist', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, subType } = req.body

    try {
        var product = await Product.find({$and:[{clientNumber: clientNumber}, {thereIs:true}, {subType: subType}]}, '-image -promotionImage').sort({specification:1})

    } catch (error) {
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    } 

    if (!product) {
        res.status(404).json({ msg: "Nenhuma equivalência foi encontrada" })
    } else {
        res.status(200).json({msg: "Pesquisa bem sucedida!", content: product})
    }     
})

// EDIT PRODUCT IMAGE ROUTE
router.post('/image', async(req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { id } = req.body

    // validations
    if (!id) {
        return res.status(422).json({msg: "Nenhum produto foi selecionado"})
    }

    try {
        var product = await Product.find({_id: id})
        var image = product[0].image
    } catch (error) {
        res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    } 

    if (!product) {
        res.status(404).json({ msg: "Nenhuma equivalência foi encontrada" })
    } else {
        res.status(200).json({msg: "Pesquisa bem sucedida!", content: image})
    }
})

// COMBO MISTO LIST ROUTE
router.post('/combomistolist', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, subType1, subType2 } = req.body

    try {
        var product = await Product.find({$and:
            [
                {clientNumber: clientNumber},
                {thereIs: true},
                {subType:[subType1, subType2]},
                {specification: {$ne: 'carne'}}
            ]
        }, 'specification').sort({subType:1, specification:1})
    } catch (error) {
        return res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    } 
    if (!product) {
        return res.status(404).json({ msg: "Nenhuma equivalência foi encontrada" })

    } else {
        return res.status(200).json({msg: "Pesquisa bem sucedida!", content: product})
    }     
})

// COMBO DIVERSO LIST ROUTE
router.post('/combodiversolist', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, subType } = req.body

    try {
        var product = await Product.find({
                clientNumber: clientNumber,
                thereIs: true,
                subType:subType,
                specification: {$nin: ['atum', 
                                    'portuguesa', 
                                    'carne com cream cheese', 
                                    'tomate seco',
                                    'carne',
                                    'rúcula com bacon',
                                    'brócolis com bacon'
                                ]}
        }, 'specification').sort({subType:1, specification:1})
    } catch (error) {
        return res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    } 
    if (!product) {
        return res.status(404).json({ msg: "Nenhuma equivalência foi encontrada" })

    } else {
        return res.status(200).json({msg: "Pesquisa bem sucedida!", content: product})
    }     
})

// COMBO ESPECIAL LIST ROUTE
router.post('/comboespeciallist', async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST")

    const { clientNumber, subType } = req.body

    try {
        var product = await Product.find({
                clientNumber: clientNumber,
                thereIs: true,
                subType:subType,
                specification: {$in: ['atum', 'portuguesa', 'carne com cream cheese', 'tomate seco']}
        }, 'specification').sort({subType:1, specification:1})
    } catch (error) {
        return res.status(500).json({msg: "Erro no servidor. Tente novamente, mais tarde!"})
    } 
    if (!product) {
        return res.status(404).json({ msg: "Nenhuma equivalência foi encontrada" })

    } else {
        return res.status(200).json({msg: "Pesquisa bem sucedida!", content: product})
    }     
})


module.exports = router