const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verify, verifyAdmin } = require('../auth');

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post('/', verify, postController.createPost);
router.patch('/:id', verify, postController.updatePost);
router.delete('/:id', verify, postController.deletePost);

module.exports = router;