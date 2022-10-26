import knex from 'knex'

let db

export async function init () {
  db = knex({
    client: process.env.DATABASE_CLIENT,
    connection: {
      filename: process.env.DATABASE_URL, // SQLite only.
      port: process.env.DATABSE_PORT,
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      database: process.env.DATABASE_NAME,
      ssl: { rejectUnauthorized: false }
    },
    useNullAsDefault: true
  })

  // Initialize notes table.
  try {
    await db.schema.createTable('notes', table => {
      table.increments('id')
      table.string('title').nullable()
      table.string('text').nullable()
    })
  } catch (err) {
    console.log('The notes table is probabbly present.')
    console.log(err.message)
  }
}

export async function getNotes () {
  return db('notes').select('*')
}

export async function getNote (id) {
  return db('notes').select('*').where({ id }).first()
}

export async function addNote (title, text) {
  return db('notes').insert({ title, text })
}

export async function deleteNote (id) {
  return db('notes').del().where({ id })
}

export async function updateNote (id, title, text) {
  return db('notes').update({ title, text }).where({ id })
}
