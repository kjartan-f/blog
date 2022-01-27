const config = require('./utils/config')
const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const mongoose = require('mongoose')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')


mongoose.connect(config.MONGODB_URI).then(() => {
  logger.info('connected to MongoDB')
}).catch(error => {
  logger.info('error conencting to MongoDB', error.message)
})

app.use(cors())
app.use(middleware.tokenExtractor)
app.use(express.json())
app.use(middleware.requestLogger)

app.use(express.static('build'))

app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if(process.env.NODE_ENV === 'test') {
  const resetRouter = require('./controllers/reset')
  app.use('/api/testing', resetRouter)
}


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app