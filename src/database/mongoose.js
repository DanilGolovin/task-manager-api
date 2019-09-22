const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false     //в false, которое будет обращаться к предупреждению об устаревании, пока оно не будет адресовано
})

