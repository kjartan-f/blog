const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})


blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if(!request.user) {
    return response.status(401).json( { error: 'invalid token' })
  }

  const user = await User.findById(request.user)

  const blog = new Blog({
    title: body.title,
    url: body.url,
    author: user.name,
    likes: body.likes,
    user: user._id

  })
  const savedBlog = await blog.save().then(blog => blog.populate('user', { username: 1, name: 1 }))

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {

  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, request.body, { new: true })
    .populate('user', { username: 1, name: 1 })
  response.json(updatedBlog)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response) => {

  console.log('USER DATAAAAAA',request.user, request.params.id)

  if (!request.user) {
    return response.status(401).json( { error: 'invalid token' } )
  }

  const blog = await Blog.findById(request.params.id)
  if (blog.user.toString() !== request.user) {
    return response.status(401).json( { error: 'invalid user' } )
  }

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter