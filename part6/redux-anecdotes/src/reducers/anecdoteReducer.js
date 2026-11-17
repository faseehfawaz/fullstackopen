import { createSlice } from '@reduxjs/toolkit'
import anecdoteService from '../services/anecdotes'

const anecdoteSlice = createSlice({
  name: 'anecdotes',
  initialState: [],
  reducers: {
    vote(state, action) {
      const id = action.payload
      const anecdoteToChange = state.find(n => n.id === id)
      if (anecdoteToChange) {
        anecdoteToChange.votes += 1
      }
    },
    appendAnecdote(state, action) {
      state.push(action.payload)
    },
    setAnecdotes(state, action) {
      return action.payload
    },
  },
})

export const { vote, appendAnecdote, setAnecdotes } = anecdoteSlice.actions

export const initializeAnecdotes = () => {
  return async dispatch => {
    try {
      const anecdotes = await anecdoteService.getAll()
      dispatch(setAnecdotes(anecdotes))
    } catch (e) {
      console.warn('Backend not running, using empty initial list', e)
    }
  }
}

export const createAnecdote = content => {
  return async dispatch => {
    try {
      const newAnecdote = await anecdoteService.createNew(content)
      dispatch(appendAnecdote(newAnecdote))
    } catch {
      const localAnecdote = {
        content,
        id: String(Math.floor(Math.random() * 100000)),
        votes: 0,
      }
      dispatch(appendAnecdote(localAnecdote))
    }
  }
}

export const voteAnecdote = anecdote => {
  return async dispatch => {
    const updated = { ...anecdote, votes: anecdote.votes + 1 }
    try {
      await anecdoteService.update(anecdote.id, updated)
    } catch {
      // offline fallback
    }
    dispatch(vote(anecdote.id))
  }
}

export default anecdoteSlice.reducer
