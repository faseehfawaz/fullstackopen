// eslint-disable-next-line no-unused-vars
const dummy = blogs => {
  return 1
}

const totalLikes = blogs => {
  return blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)
}

const favoriteBlog = blogs => {
  if (blogs.length === 0) return null

  const fav = blogs.reduce((prev, current) => {
    return (current.likes || 0) > (prev.likes || 0) ? current : prev
  }, blogs[0])

  return {
    title: fav.title,
    author: fav.author,
    likes: fav.likes,
  }
}

const mostBlogs = blogs => {
  if (blogs.length === 0) return null

  const counts = {}
  blogs.forEach(blog => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  })

  let topAuthor = ''
  let maxCount = 0

  for (const author in counts) {
    if (counts[author] > maxCount) {
      maxCount = counts[author]
      topAuthor = author
    }
  }

  return {
    author: topAuthor,
    blogs: maxCount,
  }
}

const mostLikes = blogs => {
  if (blogs.length === 0) return null

  const likesMap = {}
  blogs.forEach(blog => {
    likesMap[blog.author] = (likesMap[blog.author] || 0) + (blog.likes || 0)
  })

  let topAuthor = ''
  let maxLikes = -1

  for (const author in likesMap) {
    if (likesMap[author] > maxLikes) {
      maxLikes = likesMap[author]
      topAuthor = author
    }
  }

  return {
    author: topAuthor,
    likes: maxLikes,
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
