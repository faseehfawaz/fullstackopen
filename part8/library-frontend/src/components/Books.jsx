import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Books = ({ show }) => {
  const [selectedGenre, setSelectedGenre] = useState('all')
  const result = useQuery(ALL_BOOKS)

  if (!show) return null
  if (result.loading) return <div>loading...</div>

  const books = result.data?.allBooks || []

  // Extract all unique genres
  const genresSet = new Set()
  books.forEach(b => b.genres.forEach(g => genresSet.add(g)))
  const genres = Array.from(genresSet)

  const filteredBooks =
    selectedGenre === 'all'
      ? books
      : books.filter(b => b.genres.includes(selectedGenre))

  return (
    <div>
      <h2>books</h2>
      {selectedGenre !== 'all' && (
        <p>
          in genre <b>{selectedGenre}</b>
        </p>
      )}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map(a => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 15 }}>
        {genres.map(g => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            style={{ marginRight: 5, fontWeight: selectedGenre === g ? 'bold' : 'normal' }}
          >
            {g}
          </button>
        ))}
        <button
          onClick={() => setSelectedGenre('all')}
          style={{ fontWeight: selectedGenre === 'all' ? 'bold' : 'normal' }}
        >
          all genres
        </button>
      </div>
    </div>
  )
}

export default Books
