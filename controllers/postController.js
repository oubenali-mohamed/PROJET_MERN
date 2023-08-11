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

module.exports.createPost = async (req, res) => {}

module.exports.updatePost = (req, res) => {}

module.exports.deletePost = (req, res) => {}
