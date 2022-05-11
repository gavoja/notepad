import 'dotenv/config'
import express from 'express'
import { randomUUID } from 'crypto'
import { Low, JSONFile } from 'lowdb'

const adapter = new JSONFile(process.env.SAVEFILE)
const db = new Low(adapter)

// Initialise notes if they don't exist.
async function init () {
  // Read the data from the file.
  await db.read()

  // Set the data if not set initially.
  db.data ||= { notes: [] }

  // Write the file.
  await db.write()
}

const app = express()

// Always serialize body to object (assume JSON).
app.use((req, res, next) => {
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
app.use(express.json())
app.use('/', express.static('public'))

// List all the notes.
app.get('/notes', (req, res) => {
  res.send(db.data.notes)
})

// List all the notes.
app.get('/notes/:noteId', (req, res) => {
  const id = req.params?.noteId
  const index = db.data.notes.findIndex(note => note.id === id)

  if (index === -1) {
    res.statusCode = 400
    res.send(`Note with id ${id} does not exist.`)
    return
  }

  res.send(db.data.notes[index])
})

// Add note.
app.post('/notes', (req, res) => {
  const note = {
    id: randomUUID(),
    title: req.body?.title,
    text: req.body?.text
  }

  if (!note.title) {
    res.statusCode = 400
    res.send('Title is missing.')
    return
  }

  db.data.notes.push(note)
  db.write()

  res.send('Note was added.')
})

// Update note.
app.patch('/notes/:noteId', (req, res) => {
  const id = req.params?.noteId
  const index = db.data.notes.findIndex(note => note.id === id)

  if (index === -1) {
    res.statusCode = 400
    res.send(`Note with id ${id} does not exist.`)
    return
  }

  const oldTitle = db.data.notes[index].title
  const newTitle = req.body?.title || oldTitle

  db.data.notes[index].title = newTitle
  db.data.notes[index].text = req.body?.text
  db.write()

  res.send(`Note with id ${id} was updated.`)
})

// Delete note.
app.delete('/notes/:noteId', (req, res) => {
  const id = req.params?.noteId
  const index = db.data.notes.findIndex(note => note.id === id)

  if (index === -1) {
    res.statusCode = 400
    res.send(`Note with id ${id} does not exist.`)
    return
  }

  db.data.notes.splice(index, 1)
  db.write()

  res.send(`Note with id ${id} was deleted.`)
})

// Initialization.
app.listen(3000, async () => {
  await init()
  console.log('The server is running.')
})
