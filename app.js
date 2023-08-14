const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const userRoutes = require('./routes/user')
const postRoutes = require('./routes/post')
const { checkUser, requireAuth } = require('./middleware/auth')
const cors = require('cors')

const app = express()


mongoose
  .connect(
    'mongodb+srv://' +
      process.env.DB_USERNAME +
      ':' +
      process.env.DB_PASSWORD +
      process.env.DB_DATABASE,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'))

  const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
  }
app.use(cors(corsOptions))
app.use(express.json())


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('*', checkUser)
app.get('/jwtid', requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id)
})

app.use('/api/user', userRoutes)
app.use('/api/post', postRoutes)

module.exports = app
