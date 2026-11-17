const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const http = require('http')
const cors = require('cors')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const { PubSub } = require('graphql-subscriptions')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config()

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const pubsub = new PubSub()
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/library'

mongoose.set('strictQuery', false)
if (process.env.MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('connected to MongoDB'))
    .catch(error => console.log('error connecting to MongoDB:', error.message))
}

const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`

// In-memory fallback if no Mongo URI
let mockAuthors = [
  { name: 'Robert Martin', id: '1', born: 1952 },
  { name: 'Martin Fowler', id: '2', born: 1963 },
  { name: 'Fyodor Dostoevsky', id: '3', born: 1821 },
  { name: 'Joshua Kerievsky', id: '4' },
  { name: 'Sandi Metz', id: '5' },
]

let mockBooks = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: '101',
    genres: ['refactoring'],
  },
  {
    title: 'Agile Software Development',
    published: 2002,
    author: 'Robert Martin',
    id: '102',
    genres: ['agile', 'patterns', 'design'],
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: '103',
    genres: ['refactoring'],
  },
  {
    title: 'Refactoring to Patterns',
    published: 2004,
    author: 'Joshua Kerievsky',
    id: '104',
    genres: ['refactoring', 'patterns'],
  },
  {
    title: 'Practical Object-Oriented Design in Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: '105',
    genres: ['ruby'],
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: '106',
    genres: ['classic', 'patterns'],
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: '107',
    genres: ['classic', 'revolution'],
  },
]

const hasDb = Boolean(process.env.MONGODB_URI)

const resolvers = {
  Query: {
    bookCount: async () => (hasDb ? Book.collection.countDocuments() : mockBooks.length),
    authorCount: async () => (hasDb ? Author.collection.countDocuments() : mockAuthors.length),
    allBooks: async (root, args) => {
      if (hasDb) {
        let filter = {}
        if (args.genre) {
          filter.genres = { $in: [args.genre] }
        }
        if (args.author) {
          const author = await Author.findOne({ name: args.author })
          if (author) filter.author = author._id
          else return []
        }
        return Book.find(filter).populate('author')
      } else {
        return mockBooks
          .filter(b => (!args.genre ? true : b.genres.includes(args.genre)))
          .filter(b => (!args.author ? true : b.author === args.author))
          .map(b => ({
            ...b,
            author: mockAuthors.find(a => a.name === b.author) || { name: b.author, id: 'a_' + b.id },
          }))
      }
    },
    allAuthors: async () => {
      if (hasDb) {
        return Author.find({})
      }
      return mockAuthors
    },
    me: (root, args, context) => context.currentUser,
  },
  Author: {
    bookCount: async author => {
      if (hasDb) {
        return Book.countDocuments({ author: author._id })
      }
      return mockBooks.filter(b => b.author === author.name).length
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser && process.env.NODE_ENV === 'production') {
        throw new Error('not authenticated')
      }

      if (hasDb) {
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = new Author({ name: args.author })
          await author.save()
        }

        const book = new Book({ ...args, author: author._id })
        await book.save()
        const populatedBook = await Book.findById(book._id).populate('author')

        pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook })
        return populatedBook
      } else {
        let author = mockAuthors.find(a => a.name === args.author)
        if (!author) {
          author = { name: args.author, id: String(mockAuthors.length + 1) }
          mockAuthors.push(author)
        }
        const newBook = {
          ...args,
          id: String(mockBooks.length + 101),
          author: author,
        }
        mockBooks.push({ ...args, id: newBook.id, author: author.name })
        pubsub.publish('BOOK_ADDED', { bookAdded: newBook })
        return newBook
      }
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser && process.env.NODE_ENV === 'production') {
        throw new Error('not authenticated')
      }

      if (hasDb) {
        const author = await Author.findOne({ name: args.name })
        if (!author) return null
        author.born = args.setBornTo
        return author.save()
      } else {
        const author = mockAuthors.find(a => a.name === args.name)
        if (!author) return null
        author.born = args.setBornTo
        return author
      }
    },
    createUser: async (root, args) => {
      if (hasDb) {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
        return user.save()
      } else {
        return { username: args.username, favoriteGenre: args.favoriteGenre, id: 'user_1' }
      }
    },
    login: async (root, args) => {
      const user = hasDb
        ? await User.findOne({ username: args.username })
        : { username: args.username, favoriteGenre: 'patterns', id: 'user_1' }

      if (!user || args.password !== 'secret') {
        throw new Error('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id || user.id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
}

const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })

  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
          try {
            const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
            const currentUser = hasDb
              ? await User.findById(decodedToken.id)
              : { username: decodedToken.username, favoriteGenre: 'patterns', id: decodedToken.id }
            return { currentUser }
          } catch {
            return null
          }
        }
      },
    })
  )

  const PORT = 4000
  httpServer.listen(PORT, () => console.log(`Server is now running on http://localhost:${PORT}`))
}

start()
