import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('TODO: Serve HTML.')
})

app.get('/notes', (req, res) => {
  res.send('TODO: List all the notes!')
})

app.post('/notes', (req, res) => {
  res.send('TODO: Add note!')
})

app.patch('/notes/:noteId', (req, res) => {
  res.send('TODO: Update note!')
})

app.delete('/notes/:noteId', (req, res) => {
  res.send('TODO: Delete note!')
})

app.listen(3000)
