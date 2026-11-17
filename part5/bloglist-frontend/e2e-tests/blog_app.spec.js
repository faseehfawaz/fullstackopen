const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Super User',
        username: 'root',
        password: 'password123',
      },
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('username').fill('root')
      await page.getByTestId('password').fill('password123')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Super User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill('root')
      await page.getByTestId('password').fill('wrongpassword')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByTestId('username').fill('root')
      await page.getByTestId('password').fill('password123')
      await page.getByRole('button', { name: 'login' }).click()
      await expect(page.getByText('Super User logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByTestId('title').fill('Playwright end-to-end testing')
      await page.getByTestId('author').fill('Playwright Team')
      await page.getByTestId('url').fill('https://playwright.dev')
      await page.getByRole('button', { name: 'create' }).click()

      await expect(
        page.getByText('a new blog Playwright end-to-end testing by Playwright Team added')
      ).toBeVisible()
      await expect(page.getByText('Playwright end-to-end testing')).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByTestId('title').fill('Blog to be liked')
      await page.getByTestId('author').fill('Likable Author')
      await page.getByTestId('url').fill('https://like.dev')
      await page.getByRole('button', { name: 'create' }).click()

      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.getByText('likes 0')).toBeVisible()

      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('user who created a blog can delete it', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click()
      await page.getByTestId('title').fill('Blog to be deleted')
      await page.getByTestId('author').fill('Deletable Author')
      await page.getByTestId('url').fill('https://delete.dev')
      await page.getByRole('button', { name: 'create' }).click()

      await page.getByRole('button', { name: 'view' }).click()
      page.on('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'remove' }).click()

      await expect(page.getByText('Blog to be deleted')).not.toBeVisible()
    })
  })
})
