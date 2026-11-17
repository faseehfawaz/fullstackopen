import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(error => {
        console.error('Error fetching initial persons:', error)
      })
  }, [])

  const handleNameChange = event => setNewName(event.target.value)
  const handleNumberChange = event => setNewNumber(event.target.value)
  const handleFilterChange = event => setFilter(event.target.value)

  const addPerson = event => {
    event.preventDefault()
    const trimmedName = newName.trim()
    const trimmedNumber = newNumber.trim()

    if (!trimmedName || !trimmedNumber) {
      return
    }

    const existingPerson = persons.find(
      p => p.name.trim().toLowerCase() === trimmedName.toLowerCase()
    )

    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${existingPerson.name} is already added to phonebook, replace the old number with a new one?`
      )

      if (confirmUpdate) {
        const updatedPerson = { ...existingPerson, number: trimmedNumber }

        personService
          .update(existingPerson.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(
              persons.map(p => (p.id !== existingPerson.id ? p : returnedPerson))
            )
            setNewName('')
            setNewNumber('')
            showNotification(`Updated ${returnedPerson.name}'s number`)
          })
          .catch(error => {
            showNotification(
              `Information of ${existingPerson.name} has already been removed from server`,
              'error'
            )
            setPersons(persons.filter(p => p.id !== existingPerson.id))
          })
      }
      return
    }

    const newPersonObject = {
      name: trimmedName,
      number: trimmedNumber
    }

    personService
      .create(newPersonObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        showNotification(`Added ${returnedPerson.name}`)
      })
      .catch(error => {
        showNotification(
          error.response?.data?.error || `Failed to add ${trimmedName}`,
          'error'
        )
      })
  }

  const handleDelete = (id, name) => {
    const confirmDelete = window.confirm(`Delete ${name} ?`)
    if (confirmDelete) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          showNotification(`Deleted ${name}`)
        })
        .catch(error => {
          showNotification(
            `Information of ${name} has already been removed from server`,
            'error'
          )
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  const filteredPersons = filter
    ? persons.filter(person =>
        person.name.toLowerCase().includes(filter.toLowerCase())
      )
    : persons

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification notification={notification} />
      <Filter filter={filter} handleFilterChange={handleFilterChange} />

      <h3>Add a new</h3>
      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>
      <Persons persons={filteredPersons} handleDelete={handleDelete} />
    </div>
  )
}

export default App
