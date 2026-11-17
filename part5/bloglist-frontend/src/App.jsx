import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  const blogFormRef = useRef()

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  useEffect(() => {
    blogService.getAll().then(initialBlogs => {
      setBlogs(initialBlogs.sort((a, b) => b.likes - a.likes))
    })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const savedUser = JSON.parse(loggedUserJSON)
      setUser(savedUser)
      blogService.setToken(savedUser.token)
    }
  }, [])

  const handleLogin = async event => {
    event.preventDefault()
    try {
      const loggedInUser = await loginService.login({
        username,
        password,
      })

      window.localStorage.setItem(
        'loggedBlogappUser',
        JSON.stringify(loggedInUser)
      )
      blogService.setToken(loggedInUser.token)
      setUser(loggedInUser)
      setUsername('')
      setPassword('')
      showNotification(`welcome back ${loggedInUser.name}`)
    } catch (exception) {
      showNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    blogService.setToken(null)
    showNotification('logged out successfully')
  }

  const createBlog = async blogObject => {
    try {
      blogFormRef.current.toggleVisibility()
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog).sort((a, b) => b.likes - a.likes))
      showNotification(
        `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`
      )
    } catch (exception) {
      showNotification('failed to create blog', 'error')
    }
  }

  const updateLikes = async (id, blogObject) => {
    try {
      const returnedBlog = await blogService.update(id, blogObject)
      setBlogs(
        blogs
          .map(b => (b.id !== id ? b : returnedBlog))
          .sort((a, b) => b.likes - a.likes)
      )
    } catch (exception) {
      showNotification('failed to update likes', 'error')
    }
  }

  const deleteBlog = async id => {
    try {
      await blogService.remove(id)
      setBlogs(blogs.filter(b => b.id !== id))
      showNotification('blog removed successfully')
    } catch (exception) {
      showNotification('failed to delete blog', 'error')
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification notification={notification} />
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              id="username"
              data-testid="username"
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
              required
            />
          </div>
          <div>
            password
            <input
              id="password"
              data-testid="password"
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
              required
            />
          </div>
          <button id="login-button" type="submit">
            login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification notification={notification} />
      <p>
        {user.name} logged in{' '}
        <button id="logout-button" onClick={handleLogout}>
          logout
        </button>
      </p>

      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={createBlog} />
      </Togglable>

      <div style={{ marginTop: 15 }} className="blogs-list">
        {blogs.map(blog => (
          <Blog
            key={blog.id}
            blog={blog}
            updateLikes={updateLikes}
            deleteBlog={deleteBlog}
            currentUser={user}
          />
        ))}
      </div>
    </div>
  )
}

export default App
