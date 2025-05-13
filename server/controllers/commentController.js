const Post = require('../models/Post'); // Make sure this line exists
const Comment = require('../models/Comment'); 

module.exports.addComment = async (req, res) => {
  try {
    // Create the comment
    const comment = new Comment({
      text: req.body.text,
      post: req.body.post,  // Ensure this is the correct post ID
      author: req.user.id
    });
    await comment.save();

    // Add the comment reference to the post's comments array
    const post = await Post.findById(req.body.post);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push(comment._id); // Push the comment's _id into the post's comments array
    await post.save(); // Save the post after updating the comments array

    res.status(201).json(comment); // Respond with the created comment
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


module.exports.getCommentsByPost = async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId }).populate('author', 'username');
  res.json(comments);
};

module.exports.deleteComment = async (req, res) => {
  console.log('req.user:', req.user); // 👈 Add this

  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  if (comment.author.toString() !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
};

