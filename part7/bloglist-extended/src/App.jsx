import { useState, useEffect } from 'react'
import { Routes, Route, Link, useMatch, useNavigate } from 'react-router-dom'
import blogService from './services/blogs'
import userService from './services/users'
import loginService from './services/login'

const Navigation = ({ user, handleLogout }) => {
  const navStyle = {
    background: '#e0e0e0',
    padding: 10,
    marginBottom: 15,
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  }

  return (
    <div style={navStyle}>
      <Link to="/">blogs</Link>
      <Link to="/users">users</Link>
      {user ? (
        <span>
          <em>{user.name} logged in</em>{' '}
          <button onClick={handleLogout}>logout</button>
        </span>
      ) : null}
    </div>
  )
}

const Notification = ({ notification }) => {
  if (!notification || !notification.message) return null
  const style = {
    color: notification.type === 'error' ? 'red' : 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }
  return <div style={style}>{notification.message}</div>
}

const BlogList = ({ blogs, createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [formVisible, setFormVisible] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    createBlog({ title, author, url })
    setTitle('')
    setAuthor('')
    setUrl('')
    setFormVisible(false)
  }

  const blogItemStyle = {
    padding: 8,
    border: '1px solid #ddd',
    marginBottom: 5,
    borderRadius: 4,
  }

  return (
    <div>
      <h2>blogs</h2>
      {!formVisible ? (
        <button onClick={() => setFormVisible(true)}>create new blog</button>
      ) : (
        <div style={{ marginBottom: 15 }}>
          <h3>create new</h3>
          <form onSubmit={handleSubmit}>
            <div>
              title:
              <input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              author:
              <input value={author} onChange={e => setAuthor(e.target.value)} />
            </div>
            <div>
              url:
              <input value={url} onChange={e => setUrl(e.target.value)} required />
            </div>
            <button type="submit">create</button>
            <button type="button" onClick={() => setFormVisible(false)}>
              cancel
            </button>
          </form>
        </div>
      )}

      <div style={{ marginTop: 15 }}>
        {blogs.map(blog => (
          <div key={blog.id} style={blogItemStyle}>
            <Link to={`/blogs/${blog.id}`}>
              {blog.title} by {blog.author}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

const SingleBlog = ({ blog, handleLike, handleAddComment, user, handleDelete }) => {
  const [commentText, setCommentText] = useState('')

  if (!blog) return <p>Blog not found</p>

  const onCommentSubmit = e => {
    e.preventDefault()
    if (!commentText.trim()) return
    handleAddComment(blog.id, commentText.trim())
    setCommentText('')
  }

  const isCreator =
    user && (blog.user?.username === user.username || !blog.user)

  return (
    <div>
      <h2>
        {blog.title} by {blog.author}
      </h2>
      <div>
        <a href={blog.url} target="_blank" rel="noreferrer">
          {blog.url}
        </a>
      </div>
      <div>
        {blog.likes} likes{' '}
        <button onClick={() => handleLike(blog)}>like</button>
      </div>
      <div>added by {blog.user?.name || blog.user?.username || 'anonymous'}</div>
      {isCreator && (
        <button onClick={() => handleDelete(blog.id, blog.title)} style={{ color: 'red' }}>
          remove
        </button>
      )}

      <h3>comments</h3>
      <form onSubmit={onCommentSubmit}>
        <input
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="write a comment..."
        />
        <button type="submit">add comment</button>
      </form>
      <ul>
        {(blog.comments || []).map((c, idx) => (
          <li key={idx}>{c}</li>
        ))}
      </ul>
    </div>
  )
}

const UsersList = ({ users }) => {
  return (
    <div>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <Link to={`/users/${u.id}`}>{u.name || u.username}</Link>
              </td>
              <td>{u.blogs ? u.blogs.length : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const SingleUser = ({ user }) => {
  if (!user) return <p>User not found</p>

  return (
    <div>
      <h2>{user.name || user.username}</h2>
      <h3>added blogs</h3>
      <ul>
        {(user.blogs || []).map(b => (
          <li key={b.id || b._id}>{b.title}</li>
        ))}
      </ul>
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [users, setUsers] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    blogService.getAll().then(data => setBlogs(data.sort((a, b) => b.likes - a.likes)))
    userService.getAll().then(data => setUsers(data)).catch(() => {})
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const savedUser = JSON.parse(loggedUserJSON)
      setUser(savedUser)
      blogService.setToken(savedUser.token)
    }
  }, [])

  const handleLogin = async e => {
    e.preventDefault()
    try {
      const loggedIn = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(loggedIn))
      blogService.setToken(loggedIn.token)
      setUser(loggedIn)
      setUsername('')
      setPassword('')
      showNotification(`welcome ${loggedIn.name}`)
    } catch {
      showNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
    blogService.setToken(null)
    showNotification('logged out')
  }

  const createBlog = async blogObject => {
    try {
      const created = await blogService.create(blogObject)
      setBlogs(blogs.concat(created).sort((a, b) => b.likes - a.likes))
      showNotification(`a new blog '${created.title}' by ${created.author} added`)
    } catch {
      showNotification('failed to create blog', 'error')
    }
  }

  const handleLike = async blog => {
    try {
      const updated = {
        ...blog,
        likes: blog.likes + 1,
        user: blog.user?.id || blog.user,
      }
      const returned = await blogService.update(blog.id, updated)
      setBlogs(blogs.map(b => (b.id !== blog.id ? b : returned)).sort((a, b) => b.likes - a.likes))
    } catch {
      showNotification('failed to like blog', 'error')
    }
  }

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete ${title}?`)) {
      try {
        await blogService.remove(id)
        setBlogs(blogs.filter(b => b.id !== id))
        showNotification(`deleted blog ${title}`)
        navigate('/')
      } catch {
        showNotification('failed to delete blog', 'error')
      }
    }
  }

  const handleAddComment = async (id, comment) => {
    try {
      const updated = await blogService.addComment(id, comment)
      setBlogs(blogs.map(b => (b.id !== id ? b : updated)))
      showNotification('comment added')
    } catch {
      showNotification('failed to add comment', 'error')
    }
  }

  const blogMatch = useMatch('/blogs/:id')
  const matchedBlog = blogMatch ? blogs.find(b => b.id === blogMatch.params.id) : null

  const userMatch = useMatch('/users/:id')
  const matchedUser = userMatch ? users.find(u => u.id === userMatch.params.id) : null

  if (!user) {
    return (
      <div style={{ maxWidth: 600, margin: '20px auto' }}>
        <h2>Log in to application</h2>
        <Notification notification={notification} />
        <form onSubmit={handleLogin}>
          <div>
            username <input value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            password{' '}
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 15 }}>
      <Navigation user={user} handleLogout={handleLogout} />
      <Notification notification={notification} />
      <h1>blog app</h1>
      <Routes>
        <Route path="/" element={<BlogList blogs={blogs} createBlog={createBlog} />} />
        <Route
          path="/blogs/:id"
          element={
            <SingleBlog
              blog={matchedBlog}
              handleLike={handleLike}
              handleAddComment={handleAddComment}
              user={user}
              handleDelete={handleDelete}
            />
          }
        />
        <Route path="/users" element={<UsersList users={users} />} />
        <Route path="/users/:id" element={<SingleUser user={matchedUser} />} />
      </Routes>
    </div>
  )
}

export default App
