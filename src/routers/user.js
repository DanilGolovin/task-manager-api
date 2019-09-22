const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const {sendWelcomeEmail} = require('../emails/account')
const auth = require('../middleware/auth')
const router = new express.Router()


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('upload a image on jpg or jpeg or png format'))
        }
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('upload'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
 req.user.avatar = buffer //буфер, содержащий буфер всех двоичных данных для этого файла.
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})


router.post('/users/login', async (req, res) => {
    try{

        // Это будет принимать адрес электронной почты и пароль, и он попытается найти пользователя по электронной почте, он будет проверьте пароль.Он либо вернет пользователя, либо не вернет.
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken() //сгенерирует токен для этого пользователя
    res.send({user, token}) //Мы собираемся отправить обратно объект с двумя свойствами, одно свойство пользователя будет по-прежнему содержать все этих пользовательских данных и другого свойства токена будет содержать наш токен.
    }catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            //            Таким образом, это токен, и мы собираемся проверить, не равен ли он тому, который использовался.Это маркер точки запроса, если они не равны, мы вернем true.Сохранение его в массиве токенов, если они равны, в итоге возвращает false, отфильтровывая его иудаляя это.
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status((500).send())
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
    } catch (e) {
        res.status((500).send())
    }
})

//маршрут, который позволяет пользователю получить свой профиль при аутентификации.
router.get('/users/me', auth, async (req, res) => { //auth - промежуточное ПО. То есть ф-я запустится лишь тогда когда ей разрешит auth... типа того
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
       //Таким образом, все, что мы здесь делаем, это удаление пользователя, чья аутентификация достигает того же результата, что у нас было выше.
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router