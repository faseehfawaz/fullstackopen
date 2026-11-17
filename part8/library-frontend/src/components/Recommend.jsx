import { useQuery } from '@apollo/client'
import { ME, ALL_BOOKS } from '../queries'

const Recommend = ({ show }) => {
  const userResult = useQuery(ME)
  const booksResult = useQuery(ALL_BOOKS)

  if (!show) return null
  if (userResult.loading || booksResult.loading) return <div>loading...</div>

  const favoriteGenre = userResult.data?.me?.favoriteGenre || 'patterns'
  const books = booksResult.data?.allBooks || []

  const recommendedBooks = books.filter(b => b.genres.includes(favoriteGenre))

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <b>{favoriteGenre}</b>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.map(b => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend
