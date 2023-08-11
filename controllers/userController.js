const UserModel = require('../models/user')
const ObjectID = require('mongoose').Types.ObjectId

module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select('-password')
  res.status(200).json(users)
}

module.exports.userInfo = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID Inconnu : ' + req.params.id)

  UserModel.findById(req.params.id)
    .select('-password')
    .then((docs) => {
      res.send(docs)
      console.log(docs)
    })
    .catch((err) => {
      console.error('ID invalide ' + err)
    })
}

module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID Inconnu : ' + req.params.id)
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    return res.send(updatedUser)
  } catch (err) {
    return res.status(500).json({ message: err })
  }
}

module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID Inconnu : ' + req.params.id)

  try {
    await UserModel.deleteOne({ _id: req.params.id }).exec()
    res.status(200).json({ message: 'Utilisateur supprimé avec success. ' })
  } catch (err) {
    return res.status(500).json({ message: err })
  }
}

module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  ) {
    return res.status(400).send('ID invalide : ' + req.params.id)
  }

  try {
    // add to the follower list
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true }
    )

    // add to following list
    await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true }
    )

    res.status(201).json(user)
  } catch (err) {
    return res.status(500).json({ message: err })
  }
}

module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnFollow)
  ) {
    return res.status(400).send('ID invalide : ' + req.params.id)
  }

  try {
    // add to the follower list
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnFollow } },
      { new: true, upsert: true }
    )

    // add to following list
    await UserModel.findByIdAndUpdate(
      req.body.idToUnFollow,
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true }
    )

    res.status(201).json(user)
  } catch (err) {
    return res.status(500).json({ message: err })
  }
}
