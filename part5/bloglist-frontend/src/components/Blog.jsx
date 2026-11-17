import { useState } from 'react'

const Blog = ({ blog, updateLikes, deleteBlog, currentUser }) => {
  const [detailsVisible, setDetailsVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 4,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  const toggleDetails = () => {
    setDetailsVisible(!detailsVisible)
  }

  const handleLike = () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user ? blog.user.id || blog.user : null,
    }
    updateLikes(blog.id, updatedBlog)
  }

  const handleRemove = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      deleteBlog(blog.id)
    }
  }

  const blogCreatorUsername = blog.user?.username || (typeof blog.user === 'string' ? blog.user : null)
  const isCreator =
    currentUser &&
    (blogCreatorUsername === currentUser.username || !blog.user)

  return (
    <div style={blogStyle} className="blog" data-testid="blog-item">
      <div className="blog-header">
        <span className="blog-title">{blog.title}</span>{' '}
        <span className="blog-author">{blog.author}</span>
        <button onClick={toggleDetails} className="toggle-details-button">
          {detailsVisible ? 'hide' : 'view'}
        </button>
      </div>

      {detailsVisible && (
        <div className="blog-details">
          <div className="blog-url">
            <a href={blog.url} target="_blank" rel="noreferrer">
              {blog.url}
            </a>
          </div>
          <div className="blog-likes">
            likes {blog.likes}{' '}
            <button onClick={handleLike} className="like-button">
              like
            </button>
          </div>
          <div className="blog-creator">
            {blog.user?.name || blog.user?.username || 'unknown user'}
          </div>
          {isCreator && (
            <button
              onClick={handleRemove}
              style={{ backgroundColor: '#2196F3', color: 'white', borderRadius: 4 }}
              className="remove-button"
            >
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog
