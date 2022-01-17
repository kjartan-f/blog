const { describe, beforeEach, test, expect, afterAll } = require('@jest/globals')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const User = require('../models/user')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('lykilorð',10)
    const user = new User({
      username: 'root',
      passwordHash: passwordHash
    })

    await user.save()
  })

  test('add a valid user', async () => {
    const userList = await helper.userList()

    const newUser = {
      username: 'kjartanf',
      name: 'kjartan',
      password: 'a-secret-password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const userListEnd = await helper.userList()
    expect(userListEnd).toHaveLength(userList.length + 1)
  })

  test('add a invalid user', async () => {
    const userList = await helper.userList()

    const newUser = {
      username: 'kj',
      name: 'kjartan',
      password: 'a-'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const userListEnd = await helper.userList()
    expect(userListEnd).toHaveLength(userList.length)
  })

})

afterAll(() => {
  mongoose.connection.close()
})