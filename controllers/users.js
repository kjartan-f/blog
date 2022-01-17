const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs', { title: 1, url: 1, likes: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  if (typeof body.password === 'undefined') {
    response.status(400).json({ error: 'password is missing' })
  } else if (body.password.length < 3) {
    response.status(400).json({ error: 'password is to short, min length is 3' })
  } else {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash: passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
  }

})

module.exports = usersRouter