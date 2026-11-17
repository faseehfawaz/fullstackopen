import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const LoginForm = ({ show, setToken, setError, setPage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login, result] = useMutation(LOGIN, {
    onError: error => {
      setError(error.graphQLErrors?.[0]?.message || 'login failed')
    },
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
      setPage('authors')
    }
  }, [result.data, setToken, setPage])

  if (!show) return null

  const submit = async event => {
    event.preventDefault()
    login({ variables: { username, password } })
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          name{' '}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            required
          />
        </div>
        <div>
          password{' '}
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            required
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
