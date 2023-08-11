module.exports.singUpErrors = (err) => {
  let errors = { username: '', email: '', password: '' }

  if (err.message.includes('username')) {
    errors.username = "Le nom d'utilisateur est incorrect ou déja pris"
  }
  if (err.message.includes('email')) {
    errors.email = "L'email est incorrect"
  }
  if (err.message.includes('password')) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
  }
  if (err.code === 11000 && Object.keys(err.keyValue)[0].includes('username')) {
    errors.username = "Ce nom d'utilisateur est déjà déja pris"
  }
  if (err.code === 11000 && Object.keys(err.keyValue)[0].includes('email')) {
    errors.email = 'Cet email est  déja enregistré'
  }
  return errors
}

module.exports.signInErrors = (err) => {
  let errors = { email: '', password: '' }

  if (err.message.includes('email')) errors.email = 'Email inconnu'

  if (err.message.includes('password'))
    errors.password = 'Le mot de passe ne correspond pas'

  return errors
}
