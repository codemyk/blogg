const express = require('express');
const router = express.Router();
const { verify } = require('../auth');
const commentController = require('../controllers/commentController');

router.post('/', verify, commentController.addComment);
router.get('/:postId', commentController.getCommentsByPost);
router.delete('/:id', verify, commentController.deleteComment);
 
module.exports = router;
