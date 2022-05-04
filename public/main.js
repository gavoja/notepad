window.addEventListener('load', route)
window.addEventListener('hashchange', route)

const dispatcher = {
  async add () {
    this.edit()
  },

  async delete (id) {
    if (confirm('Are you sure you want to delete the note?')) {
      await fetch(`/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
    }
    // Go back to the list of notes.
    location.hash = ''
  },

  async get (id) {
    if (!id) {
      return {}
    }

    const res = await fetch(`/notes/${id}`)
    return res.json()
  },

  async edit (id) {
    const note = await this.get(id)

    const html = `
      <form>
        <p>
          Title:
          <input type="text" name="title" ${`value="${note?.title ?? ''}"`}>
        </p>
        <p>
          Text:
          <textarea>${note?.text ?? ''}</textarea>
        </p>
        <button>Submit</button>
      </form>
    `

    document.body.innerHTML = html

    document.querySelector('button').addEventListener('click', async event => {
      event.preventDefault()

      const title = document.querySelector('input').value
      const text = document.querySelector('textarea').value
      const newNote = { title, text }

      const route = id ? `/notes/${id}` : '/notes'
      const method = id ? 'PATCH' : 'POST'

      await fetch(route, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      })

      // Go back to the list of notes.
      location.hash = ''
    })
  },

  async list () {
    const res = await fetch('/notes')
    const notes = await res.json()

    const html = `
      <table>
        <tr>
          <th>Title</th>
          <th>Text</th>
          <th>Options</th>
        </tr>
        ${notes.map(note => `
          <tr>
            <th>${note.title}</th>
            <td>${note.text}</th>
            <td><a href="#edit/${note.id}">Edit</a> | <a href="#delete/${note.id}">Delete</a></td>
          </tr>
        `).join('')}
      </table>
      <p>
        <a href="#add">Add new note</a>
      </p>
    `

    document.body.innerHTML = html
  }
}

// Application router.
async function route () {
  const [cmd, id] = location.hash.substring(1).split('/')

  if (cmd && dispatcher[cmd]) {
    dispatcher[cmd](id)
  } else {
    dispatcher.list()
  }
}
