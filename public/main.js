window.addEventListener('load', route)
window.addEventListener('hashchange', route)

// Application router.
async function route () {
  if (location.hash === '#add') {
    addNote()
  } else {
    showNotes()
  }

  // TODO: Update and delete.
}

async function showNotes () {
  const res = await fetch('/notes')
  const notes = await res.json()

  const html = `
    <table>
      ${notes.map(note => `
        <tr>
          <th>${note.title}</th>
          <td>${note.text}</th>
        </tr>
      `).join('')}
    </table>
    <p>
      <a href="#add">Add new note</a>
    </p>
  `
  console.log(html)

  document.body.innerHTML = html
  console.log(notes)
}

async function addNote () {
  const html = `
    <form>
      <p>
        Title:
        <input type="text" name="title">
      </p>
      <p>
        Text:
        <textarea></textarea>
      </p>
      <button>Add new note</button>
    </form>
  `

  document.body.innerHTML = html

  document.querySelector('button').addEventListener('click', async event => {
    event.preventDefault()

    const title = document.querySelector('input').value
    const text = document.querySelector('textarea').value
    const newNote = { title, text }

    await fetch('/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newNote)
    })

    location.hash = ''
  })
}
