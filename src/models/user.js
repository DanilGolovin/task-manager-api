const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})
// позволяет нам настроить один из этих виртуальных реальных байт. Теперь это виртуально, потому что мы на самом деле не меняем то, что мы храним для пользовательского документа, это просто способ для мангуста выяснить, как эти две вещи связаны.
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', //Таким образом, локальное поле ID пользователя представляет собой связь между этим полем и владельцем поля задачи, которое также идентификатор пользователя.
    foreignField: 'creator'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token}) //добавляем в массив
    await user.save()
    return token
}


userSchema.statics.findByCredentials = async (email, password) => {
    const  user = await User.findOne({email})

    if(!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await  bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}
//hash-пароль в виде простого текста перед сохранением
userSchema.pre('save', async function (next) {  //Первое - это название события, которое будет сохранено в нашем случае. И вторая - это функция, которая запускается прямо здесь.
    const user = this//Это дает нам доступ к отдельному пользователю, который будет сохранен.получаю данные непосредственно перед сохранением печати, и пользователь может получить доступ к различным фрагментам данных, которые были предоставлены.
    if (user.isModified('password')) { //Это будет верно, когда пользователь впервые создан И это также будет верно, если пользователь обновляется, и пароль был одной из вещей, измененных
        user.password = await bcrypt.hash(user.password, 8) //берем простой текстовый пароль и хэшируем его, затем используем это значение хеша для переопределения
    }
    next()
})

userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({creator: user._id})
    next()
})
//создание можели user
const User = mongoose.model('User', userSchema) //  Итак, здесь мы собираемся создать константу, называемую пользовательской схемой, и мы собираемся установить это с помощью оператора new со следующей схемой S капитала Mongoose точка, и мы собираемся передать ему объект, который определяет все свойства для этой схемы.

module.exports = User



// //создание экземплярa
// const secondUser = new User({
//     name: 'DIMa',
//     email: 'DIMa@gmail.com',
//     password: 'фыфыфыф'
// })
// //метод save не принимает никаких аргументов,Это просто сохранение данныx
// secondUser.save().then(() => {
//     console.log(secondUser)
// }).catch((error) => {
//     console.log('Error: ', error)
// })
