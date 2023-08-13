const router = require('express').Router()
const authControllers = require('../controllers/authentification')
const userControllers = require('../controllers/userController')
const uploadControllers = require('../controllers/uploadController')
const multer = require('multer')
const upload = multer()

router.post('/register', authControllers.signUp)
router.post('/login', authControllers.singIn)
router.get('/logout', authControllers.logOut)

router.get('/', userControllers.getAllUsers)
router.get('/:id', userControllers.userInfo)
router.put('/:id', userControllers.updateUser)
router.delete('/:id', userControllers.deleteUser)
router.patch('/follow/:id', userControllers.follow)
router.patch('/unfollow/:id', userControllers.unfollow)


router.post('/upload',upload.single('file'), uploadControllers.uploadProfil)
module.exports = router
