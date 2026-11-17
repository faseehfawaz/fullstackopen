import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import BlogForm from './BlogForm'

describe('<BlogForm />', () => {
  test('calls the event handler with the right details when a new blog is created', async () => {
    const createBlog = vi.fn()
    const user = userEvent.setup()

    render(<BlogForm createBlog={createBlog} />)

    const titleInput = screen.getByPlaceholderText('write blog title here')
    const authorInput = screen.getByPlaceholderText('write blog author here')
    const urlInput = screen.getByPlaceholderText('write blog url here')
    const createButton = screen.getByText('create')

    await user.type(titleInput, 'Testing React Apps with Vitest')
    await user.type(authorInput, 'Martin Fowler')
    await user.type(urlInput, 'https://martinfowler.com/testing')
    await user.click(createButton)

    expect(createBlog.mock.calls).toHaveLength(1)
    expect(createBlog.mock.calls[0][0].title).toBe('Testing React Apps with Vitest')
    expect(createBlog.mock.calls[0][0].author).toBe('Martin Fowler')
    expect(createBlog.mock.calls[0][0].url).toBe('https://martinfowler.com/testing')
  })
})
