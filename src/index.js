const express = require('express')
const multer = require('multer')
require('./database/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express()     // новое экспресс-приложение

const port = process.env.PORT

app.use(express.json()) // будет распознавать входящий объект запроса как обьект JSON

// подрубаем роуты
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log("Server is up on port " + port)
})

