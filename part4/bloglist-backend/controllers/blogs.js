const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  })
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author || '',
    url: body.url,
    likes: body.likes !== undefined ? body.likes : 0,
    user: user._id,
    comments: [],
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  const populatedBlog = await Blog.findById(savedBlog._id).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  })

  response.status(201).json(populatedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user && blog.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'only creator can delete a blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  user.blogs = user.blogs.filter(
    bId => bId.toString() !== request.params.id.toString()
  )
  await user.save()

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const blogToUpdate = {
    title,
    author,
    url,
    likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    blogToUpdate,
    { new: true, runValidators: true, context: 'query' }
  ).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  })

  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const { comment } = request.body
  if (!comment) {
    return response.status(400).json({ error: 'comment content required' })
  }

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  blog.comments = blog.comments ? blog.comments.concat(comment) : [comment]
  await blog.save()

  const updatedBlog = await Blog.findById(blog._id).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  })

  response.status(201).json(updatedBlog)
})

module.exports = blogsRouter
