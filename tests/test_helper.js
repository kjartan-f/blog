const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)


const initialBlogs = [
  {
    title: 'BLog item 1',
    author: 'Kjartan',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  },
  {
    title: 'BLog item 2',
    author: 'Kjartan',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 5,
  },
  {
    title: 'BLog item 3',
    author: 'Mamma',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 3,
  },
  {
    title: 'BLog item 4',
    author: 'Amma',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 17,
  }

]

const blogList = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const userList = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({
    title : 'delete right away',
    author: 'kjartan',
    url : 'url'
  })

  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const login = async () => {
  const loggedInUser = await api
    .post('/api/login')
    .send({ username: 'kjartanf', password: 'lykilorð' })

  return loggedInUser.body.token
}


module.exports = {
  blogList, userList, nonExistingId, initialBlogs, login
}