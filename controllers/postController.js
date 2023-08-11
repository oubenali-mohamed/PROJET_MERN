const PostModel = require('../models/post')
const UserModel = require('../models/user')
const ObjectID = require('mongoose').Types.ObjectId

module.exports.readPost = (req, res) => {
  PostModel.find((err, docs) => {
    if (!err) {
      res.send(docs)
    } else {
      console.log('Error to get data : ' + err)
    }
  })
}

module.exports.createPost = async (req, res) => {
  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    video: req.body.video,
    likers: [],
    comments: [],
  })
  try {
    const post = await newPost.save()
    res.status(201).json(post)
  } catch (err) {
    res.status(400).json(err)
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
    return res.status(400).send('ID unknown : ' + req.params.id)

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likers: req.body.id },
      },
      { new: true }
    )

    /* if (!updatedPost) {
      return res.status(404).send('Post not found')
    } */

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $addToSet: { likes: req.params.id },
      },
      { new: true }
    )

   /*  if (!updatedUser) {
      return res.status(404).send('User not found')
    } */

    res.send({ updatedPost, updatedUser })
  } catch (err) {
    return res.status(400).send(err.message || 'An error occurred')
  }
}

module.exports.unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likers: req.body.id },
      },
      { new: true }
    );

    /* if (!updatedPost) {
      return res.status(404).send("Post not found");
    } */

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { likes: req.params.id },
      },
      { new: true }
    );

    /* if (!updatedUser) {
      return res.status(404).send("User not found");
    } */

    res.send({ updatedPost, updatedUser });
  } catch (err) {
    return res.status(400).send(err.message || "An error occurred");
  }
};

