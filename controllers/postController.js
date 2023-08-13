const PostModel = require('../models/post')
const UserModel = require('../models/user')
const { uploadErrors } = require('../utils/error')
const ObjectID = require('mongoose').Types.ObjectId
const fs = require('fs')
const { promisify } = require('util')
const pipeline = promisify(require('stream').pipeline)

module.exports.readPost = (req, res) => {
  PostModel.find((err, docs) => {
    if (!err) {
      res.send(docs)
    } else {
      console.log('Error to get data : ' + err)
    }
  }).sort({ createdAt: -1 })
}

module.exports.createPost = async (req, res) => {
  let fileName

  if (req.file !== null) {
    try {
      if (
        req.file.detectedMimeType != 'image/jpg' &&
        req.file.detectedMimeType != 'image/png' &&
        req.file.detectedMimeType != 'image/jpeg'
      )
        throw Error('invalid file')

      if (req.file.size > 500000) throw Error('max size')
    } catch (err) {
      const errors = uploadErrors(err)
      return res.status(201).json({ errors })
    }
    fileName = req.body.posterId + Date.now() + '.jpg'

    await pipeline(
      req.file.stream,
      fs.createWriteStream(
        `${__dirname}/../client/public/uploads/posts/${fileName}`
      )
    )
  }

  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    picture: req.file !== null ? './uploads/posts/' + fileName : '',
    video: req.body.video,
    likers: [],
    comments: [],
  })

  try {
    const post = await newPost.save()
    return res.status(201).json(post)
  } catch (err) {
    return res.status(400).send(err)
  }
}

module.exports.updatePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID Inconnu : ' + req.params.id)

  const updatePost = {
    message: req.body.message,
  }
  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $set: updatePost },
      { new: true }
    )
    res.send(updatedPost)
  } catch (err) {
    console.log('Error to update post : ' + err)
    res.status(500).send('Error updating post')
  }
}

module.exports.deletePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID Inconnu : ' + req.params.id)
  try {
    await PostModel.deleteOne({ _id: req.params.id }).exec()
    res
      .status(200)
      .json({ message: 'votre post à bien été supprimé avec success. ' })
  } catch (err) {
    return res.status(500).json({ message: err })
  }
}

module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID inconnu : ' + req.params.id)

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likers: req.body.id },
      },
      { new: true }
    )

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $addToSet: { likes: req.params.id },
      },
      { new: true }
    )

    res.send({ updatedPost, updatedUser })
  } catch (err) {
    return res.status(400).send(err.message || 'An error occurred')
  }
}

module.exports.unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID inconnu : ' + req.params.id)

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likers: req.body.id },
      },
      { new: true }
    )

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { likes: req.params.id },
      },
      { new: true }
    )

    res.send({ updatedPost, updatedUser })
  } catch (err) {
    return res.status(400).send(err.message || 'erreur')
  }
}

module.exports.commentPost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID inconnu : ' + req.params.id)

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterUsername: req.body.commenterUsername,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true }
    )

    res.send(updatedPost)
  } catch (err) {
    res.status(400).send(err)
  }
}

module.exports.editCommentPost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID inconnu : ' + req.params.id)

  try {
    const updatePost = await PostModel.findById(req.params.id)

    if (!updatePost) return res.status(404).send('Post non trouvé')

    const theComment = updatePost.comments.find((comment) =>
      comment._id.equals(req.body.commentId)
    )

    if (!theComment) return res.status(404).send('commentaire non trouvé')

    theComment.text = req.body.text

    await updatePost.save()

    return res.status(200).send(updatePost)
  } catch (err) {
    return res.status(500).send(err)
  }
}

module.exports.deleteCommentPost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id)

  try {
    const post = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true }
    )

    if (!post) return res.status(404).send('Post not found')

    res.send(post)
  } catch (err) {
    res.status(400).send(err)
  }
}
