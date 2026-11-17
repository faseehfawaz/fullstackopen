require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('body', req => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

// In-memory fallback if MongoDB is not configured
let inMemoryPersons = [
  { id: '1', name: 'Arto Hellas', number: '040-123456' },
  { id: '2', name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: '3', name: 'Dan Abramov', number: '12-43-234345' },
  { id: '4', name: 'Mary Poppendieck', number: '39-23-6423122' }
]

const hasDb = Boolean(process.env.MONGODB_URI)

app.get('/info', (req, res, next) => {
  if (hasDb) {
    Person.find({})
      .then(persons => {
        res.send(
          `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
        )
      })
      .catch(error => next(error))
  } else {
    res.send(
      `<p>Phonebook has info for ${inMemoryPersons.length} people</p><p>${new Date()}</p>`
    )
  }
})

app.get('/api/persons', (req, res, next) => {
  if (hasDb) {
    Person.find({})
      .then(persons => {
        res.json(persons)
      })
      .catch(error => next(error))
  } else {
    res.json(inMemoryPersons)
  }
})

app.get('/api/persons/:id', (req, res, next) => {
  if (hasDb) {
    Person.findById(req.params.id)
      .then(person => {
        if (person) {
          res.json(person)
        } else {
          res.status(404).end()
        }
      })
      .catch(error => next(error))
  } else {
    const person = inMemoryPersons.find(p => p.id === req.params.id)
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  }
})

app.delete('/api/persons/:id', (req, res, next) => {
  if (hasDb) {
    Person.findByIdAndDelete(req.params.id)
      .then(() => {
        res.status(204).end()
      })
      .catch(error => next(error))
  } else {
    inMemoryPersons = inMemoryPersons.filter(p => p.id !== req.params.id)
    res.status(204).end()
  }
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name or number missing' })
  }

  if (hasDb) {
    const person = new Person({
      name: body.name,
      number: body.number
    })

    person
      .save()
      .then(savedPerson => {
        res.status(201).json(savedPerson)
      })
      .catch(error => next(error))
  } else {
    if (
      inMemoryPersons.some(
        p => p.name.toLowerCase() === body.name.trim().toLowerCase()
      )
    ) {
      return res.status(400).json({ error: 'name must be unique' })
    }

    if (body.name.length < 3) {
      return res
        .status(400)
        .json({ error: 'Person validation failed: name is shorter than minimum allowed length (3)' })
    }

    if (!/^\d{2,3}-\d+$/.test(body.number) || body.number.length < 8) {
      return res
        .status(400)
        .json({ error: `${body.number} is not a valid phone number!` })
    }

    const newPerson = {
      id: String(Math.floor(Math.random() * 1000000)),
      name: body.name,
      number: body.number
    }

    inMemoryPersons = inMemoryPersons.concat(newPerson)
    res.status(201).json(newPerson)
  }
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  if (hasDb) {
    Person.findByIdAndUpdate(
      req.params.id,
      { name, number },
      { new: true, runValidators: true, context: 'query' }
    )
      .then(updatedPerson => {
        if (updatedPerson) {
          res.json(updatedPerson)
        } else {
          res.status(404).end()
        }
      })
      .catch(error => next(error))
  } else {
    const index = inMemoryPersons.findIndex(p => p.id === req.params.id)
    if (index === -1) {
      return res.status(404).end()
    }
    const updated = { ...inMemoryPersons[index], name, number }
    inMemoryPersons[index] = updated
    res.json(updated)
  }
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
