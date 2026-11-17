import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import Blog from './Blog'

describe('<Blog />', () => {
  const blog = {
    id: '12345',
    title: 'Component testing with React Testing Library',
    author: 'Full Stack Master',
    url: 'https://fullstackopen.com',
    likes: 42,
    user: {
      username: 'tester',
      name: 'Super Tester',
    },
  }

  test('renders title and author, but not url or likes by default', () => {
    render(<Blog blog={blog} />)

    expect(
      screen.getByText('Component testing with React Testing Library')
    ).toBeInTheDocument()
    expect(screen.getByText('Full Stack Master')).toBeInTheDocument()

    const details = screen.queryByText('https://fullstackopen.com')
    expect(details).toBeNull()

    const likes = screen.queryByText('likes 42')
    expect(likes).toBeNull()
  })

  test('url and number of likes are shown when the view button has been clicked', async () => {
    render(<Blog blog={blog} />)

    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    expect(screen.getByText('https://fullstackopen.com')).toBeInTheDocument()
    expect(screen.getByText(/likes 42/i)).toBeInTheDocument()
  })

  test('if the like button is clicked twice, event handler is called twice', async () => {
    const mockUpdateLikes = vi.fn()
    render(<Blog blog={blog} updateLikes={mockUpdateLikes} />)

    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockUpdateLikes.mock.calls).toHaveLength(2)
  })
})
