import Weather from './Weather'

const CountryDetails = ({ country }) => {
  const languages = country.languages ? Object.values(country.languages) : []
  const capital = country.capital?.[0]

  return (
    <div>
      <h1>{country.name.common}</h1>
      <div>capital {country.capital ? country.capital.join(', ') : 'N/A'}</div>
      <div>area {country.area}</div>

      <h3>languages:</h3>
      <ul>
        {languages.map((lang, index) => (
          <li key={index}>{lang}</li>
        ))}
      </ul>

      {country.flags && (
        <img
          src={country.flags.png || country.flags.svg}
          alt={country.flags.alt || `Flag of ${country.name.common}`}
          style={{ width: '160px', border: '1px solid #ccc' }}
        />
      )}

      {capital && <Weather capital={capital} />}
    </div>
  )
}

export default CountryDetails
