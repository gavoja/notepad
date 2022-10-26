import 'dotenv/config'
import express from 'express'
import { init, getNotes, getNote, addNote, deleteNote, updateNote } from './database.js'

const app = express()

// Authentication handler.
app.use((req, res, next) => {
  // Skip if user/pass are not defined.
  if (!process.env.USER || !process.env.PASS) {
    return next()
  }

  const auth = (req.headers.authorization ?? '') // Basic <base64-encoded-credentials>
    .split(' ') // ['Basic' '<base64-encoded-credentials>']
    .pop() // '<base64 encoded credentials>'

  const decoded = Buffer.from(auth, 'base64').toString() // 'user:pass'
  const [user, pass] = decoded.split(':') // ['user', 'pass']

  if (user === process.env.USER && pass === process.env.PASS) {
    return next()
  }

  res.set('WWW-Authenticate', 'Basic realm="401"')
  res.status(401).send('Invalid user or password.')
})

app.use(express.json()) // Always serialize body to object (assume JSON).
app.use('/', express.static('public'))

// List all the notes.
app.get('/notes', async (req, res) => {
  const notes = await getNotes()
  res.send(notes)
})

// List specific note.
app.get('/notes/:noteId', async (req, res) => {
  const note = await getNote(req.params?.noteId)
  res.send(note)
})

// Add note.
app.post('/notes', async (req, res) => {
  if (!req.body?.title) {
    res.statusCode = 400
    res.send('Title is missing.')
    return
  }

  await addNote(req.body?.title, req.body?.text)
  res.send('Note was added.')
})

// Update note.
app.patch('/notes/:noteId', async (req, res) => {
  if (!req.body?.title) {
    res.statusCode = 400
    res.send('Title is missing.')
    return
  }

  await updateNote(req.params?.noteId, req.body?.title, req.body?.text)

  res.send(`Note with id ${req.params?.noteId} was updated.`)
})

// Delete note.
app.delete('/notes/:noteId', async (req, res) => {
  await deleteNote(req.params?.noteId)
  res.send(`Note with id ${req.params?.noteId} was deleted.`)
})

// Initialization.
app.listen(process.env.PORT, async () => {
  await init()
  console.log('The server is running.')
})
