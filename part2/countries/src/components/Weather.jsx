import { useState, useEffect } from 'react'
import axios from 'axios'

const Weather = ({ capital }) => {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(null)

  const apiKey = import.meta.env.VITE_SOME_KEY || import.meta.env.VITE_OPENWEATHER_KEY

  useEffect(() => {
    if (!capital) return
    if (!apiKey) {
      setError('No OpenWeather API key found. Set VITE_SOME_KEY in .env.')
      return
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      capital
    )}&units=metric&appid=${apiKey}`

    axios
      .get(weatherUrl)
      .then(response => {
        setWeather(response.data)
        setError(null)
      })
      .catch(err => {
        console.error('Weather fetch error:', err)
        setError('Failed to fetch weather data')
      })
  }, [capital, apiKey])

  if (error) {
    return (
      <div>
        <h3>Weather in {capital}</h3>
        <p><em>{error}</em></p>
      </div>
    )
  }

  if (!weather) {
    return (
      <div>
        <h3>Weather in {capital}</h3>
        <p>Loading weather data...</p>
      </div>
    )
  }

  const iconCode = weather.weather?.[0]?.icon
  const iconUrl = iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : null
  const description = weather.weather?.[0]?.description

  return (
    <div>
      <h3>Weather in {capital}</h3>
      <p>temperature {weather.main?.temp} Celsius</p>
      {iconUrl && <img src={iconUrl} alt={description || 'weather icon'} />}
      <p>wind {weather.wind?.speed} m/s</p>
    </div>
  )
}

export default Weather
