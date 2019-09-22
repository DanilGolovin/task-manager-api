const  jwt = require("jsonwebtoken")
const  User = require("../models/user")

const auth = async (req, res, next) => {
    //    код, который проверяет пользователя
    try {
        //Таким образом, здесь токен const будет хранить действительное значение
        const token = req.header('Authorization').replace('Bearer ', '')//поиск заголовка, если заголовок авторизации отсутствует, заголовок будет возвращаться неопределенным
        const decoded = jwt.verify(token, process.env.JWT_SECRET)//мы хотим убедиться, что он был создан нашим сервером и срок его действия истек
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({error: 'Please authenticate'})
    }
}

module.exports = auth