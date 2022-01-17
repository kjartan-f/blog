const { afterAll, test, expect, describe, beforeEach } = require('@jest/globals')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('lykilorð',10)
  const user = new User({
    username: 'kjartanf',
    passwordHash: passwordHash
  })

  const savedUser = await user.save()
  const userId = savedUser._id.toString()


  await Blog.deleteMany({})
  const Blogs = helper.initialBlogs.map(blog => new Blog({ ...blog, user: userId }))
  const promiseArray = Blogs.map(blog => blog.save())
  await Promise.all(promiseArray)


})

const api = supertest(app)



describe('initial list of blogs', () => {

  test('blogs are rerturned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await helper.blogList()

    expect(response).toHaveLength(helper.initialBlogs.length)
  })

})

describe('view a specific blog', () => {

  test('success with a valid id', async () => {
    const blogList = await helper.blogList()
    const blogToView = blogList[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    expect(resultBlog.body).toEqual(processedBlogToView)

  })

  test('fail with status code 404', async () => {
    const delId = await helper.nonExistingId()
    await api
      .get(`/api/blogs/${delId}`)
      .expect(404)
  })

  test('not a valid id returns 400', async () => {
    const notValidId = '61dca6770aa6b119280'
    await api
      .get(`/api/blogs/${notValidId}`)
      .expect(400)
  })

})

describe('adding a new blog', () => {

  test('success in adding and validating data', async () => {

    const token =  await helper.login()

    const newBlog = {
      title: 'BLog item temp',
      author: 'Kjartan',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(201)
      .expect('Content-type', /application\/json/)

    const response = await helper.blogList()
    const titles = response.map(blog => blog.title)
    expect(response).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain(newBlog.title)

  })

  test('fails without a token', async () => {

    const newBlog = {
      title: 'BLog item temp',
      author: 'Kjartan',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-type', /application\/json/)

    const response = await helper.blogList()
    expect(response).toHaveLength(helper.initialBlogs.length)

  })

  test('fails with invalid data', async () => {
    const token =  await helper.login()

    const newBlog = {
      author: 'Kjartan',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(400)

    const response = await helper.blogList()
    expect(response).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without title and url returns status 400', async () => {
    const token =  await helper.login()

    const newBlog = {
      author: 'Kjartan'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(400)

  })

  test('blog returns default value 0 for likes', async () => {
    const token =  await helper.login()

    const newBlog = {
      title: 'BLog without likes',
      author: 'Kjartan',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll'
    }

    const addBlog = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)

    const addedBlog = await api.get(`/api/blogs/${addBlog.body.id}`)

    expect(addedBlog.body.likes).toBe(0)
  })


  test('unique indentifier is called id', async () => {
    const blogList = await helper.blogList()
    const blogToCheck = blogList[0]

    expect(blogToCheck.id).toBeDefined
  })

})


describe('deletion of a blog', () => {

  test('succeeds with status code 204 if id is valid', async () => {
    const token =  await helper.login()

    const blogList = await helper.blogList()
    const blogToDelete = blogList[0]

    console.log('SOME BLOGGGGGGG',blogToDelete, token)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const blogListAfter = await helper.blogList()
    expect(blogListAfter).toHaveLength(helper.initialBlogs.length -1)

    const titles = blogListAfter.map(blog => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })

})


afterAll(() => {
  mongoose.connection.close()
})
