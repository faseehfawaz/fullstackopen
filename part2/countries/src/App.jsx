import { useState, useEffect } from 'react'
import axios from 'axios'
import CountryDetails from './components/CountryDetails'

const App = () => {
  const [countries, setCountries] = useState([])
  const [query, setQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
      .catch(error => {
        console.error('Failed to load countries:', error)
      })
  }, [])

  const handleQueryChange = event => {
    setQuery(event.target.value)
    setSelectedCountry(null)
  }

  const matches = query.trim()
    ? countries.filter(c =>
        c.name.common.toLowerCase().includes(query.trim().toLowerCase())
      )
    : []

  const singleCountry = matches.length === 1 ? matches[0] : null
  const activeCountry = selectedCountry || singleCountry

  return (
    <div>
      <div>
        find countries <input value={query} onChange={handleQueryChange} />
      </div>

      <div>
        {query.trim() === '' ? (
          <p>Please enter a search query.</p>
        ) : activeCountry ? (
          <CountryDetails country={activeCountry} />
        ) : matches.length > 10 ? (
          <p>Too many matches, specify another filter</p>
        ) : matches.length > 1 ? (
          <div>
            {matches.map(c => (
              <div key={c.cca3 || c.name.common}>
                {c.name.common}{' '}
                <button onClick={() => setSelectedCountry(c)}>show</button>
              </div>
            ))}
          </div>
        ) : (
          <p>No matches found</p>
        )}
      </div>
    </div>
  )
}

export default App
