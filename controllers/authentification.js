const UserModel = require('../models/user')
const jwt = require('jsonwebtoken')
const { singUpErrors, signInErrors } = require('../utils/error')

const maxAge = 24 * 60 * 60
const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  })
}
module.exports.signUp = async (req, res) => {
  console.log(req.body)
  const { username, email, password } = req.body

  try {
    const user = await UserModel.create({ username, email, password })

    res.status(201).json({ user: user._id })
  } catch (err) {
    const errors = singUpErrors(err)
    res.status(400).send({ errors })
  }
}

module.exports.singIn = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await UserModel.login(email, password)
    const token = createToken(user._id)
    res.cookie('jwt', token, { httpOnly: true, maxAge })
    res.status(200).json({ user: user._id })
  } catch (err) {
    const errors = signInErrors(err)
    res.status(200).json({ errors })
  }
}

module.exports.logOut = async (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 })
  res.redirect('/')
}
