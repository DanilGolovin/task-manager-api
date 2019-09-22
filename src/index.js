const express = require('express')
const multer = require('multer')
require('./database/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express()     //новое экспресс-приложение
// Теперь, в конце концов, мы собираемся развернуть это в Heroku.
// Итак, сразу же я получу значение порта, посмотрев сначала на точку точка EMV точка процесса, который мы знаем,
// что нам нужно сделать, чтобы наше приложение работало на Heroku.
// Тогда, если этого не будет, я вернусь к чему-то, что я могу использовать для локальной разработки, например, к третьему порту.

const port = process.env.PORT



app.use(express.json()) //будет автоматически передавать входящий Jason объекту, чтобы мы могли получить к нему доступ в наших обработчиках запросов
//Мы получаем доступ к запросу и ответу точно так же, как если бы мы использовали приложение .get
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log("Server is up on port " + port)
})

