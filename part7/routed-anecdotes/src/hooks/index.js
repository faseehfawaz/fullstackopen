import { useState, useEffect } from 'react'
import axios from 'axios'

export const useField = type => {
  const [value, setValue] = useState('')

  const onChange = event => {
    setValue(event.target.value)
  }

  const reset = () => {
    setValue('')
  }

  return {
    type,
    value,
    onChange,
    reset,
  }
}

export const useCountry = name => {
  const [country, setCountry] = useState(null)

  useEffect(() => {
    if (!name) {
      setCountry(null)
      return
    }

    axios
      .get(`https://studies.cs.helsinki.fi/restcountries/api/name/${name}`)
      .then(response => {
        setCountry({ data: response.data, found: true })
      })
      .catch(() => {
        setCountry({ found: false })
      })
  }, [name])

  return country
}

export const useResource = baseUrl => {
  const [resources, setResources] = useState([])

  useEffect(() => {
    axios
      .get(baseUrl)
      .then(response => setResources(response.data))
      .catch(error => console.warn('useResource get error:', error.message))
  }, [baseUrl])

  const create = async resource => {
    const response = await axios.post(baseUrl, resource)
    setResources(resources.concat(response.data))
    return response.data
  }

  const service = {
    create,
  }

  return [resources, service]
}
