import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = event => {
    event.preventDefault()
    createBlog({
      title,
      author,
      url,
    })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={handleSubmit}>
        <div>
          title:
          <input
            id="title"
            data-testid="title"
            type="text"
            value={title}
            name="Title"
            onChange={({ target }) => setTitle(target.value)}
            placeholder="write blog title here"
            required
          />
        </div>
        <div>
          author:
          <input
            id="author"
            data-testid="author"
            type="text"
            value={author}
            name="Author"
            onChange={({ target }) => setAuthor(target.value)}
            placeholder="write blog author here"
          />
        </div>
        <div>
          url:
          <input
            id="url"
            data-testid="url"
            type="text"
            value={url}
            name="Url"
            onChange={({ target }) => setUrl(target.value)}
            placeholder="write blog url here"
            required
          />
        </div>
        <button id="create-blog-button" type="submit">
          create
        </button>
      </form>
    </div>
  )
}

export default BlogForm
