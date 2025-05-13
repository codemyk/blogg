const Post = require('../models/Post');
const Comment = require('../models/Comment'); 

module.exports.createPost = async (req, res) => {
  try {
    const post = new Post({ ...req.body, author: req.user.id });
    await post.save();

    // Re-fetch with populated author info
    const populatedPost = await Post.findById(post._id).populate('author', 'username email');

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports.getAllPosts = async (req, res) => {
  const posts = await Post.find()
    .populate('author', 'username email')
    .populate({
      path: 'comments', // Assuming your Post model has a 'comments' field referencing the Comment model
      populate: { path: 'author', select: 'username' } // Populate comment's author
    });
  res.json(posts);
};

module.exports.getPostById = async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username email')
    .populate({
      path: 'comments',
      populate: { path: 'author', select: 'username' }
    });

  if (!post) return res.status(404).json({ error: 'Post not found' });

  const postWithComments = {
    _id: post._id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    author: post.author,
    comments: post.comments // This will include populated comments
  };

  res.json(postWithComments);
};

module.exports.updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'username email');
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (post.author._id.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  Object.assign(post, req.body);
  await post.save();

  res.json({
    _id: post._id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    author_info: post.author
  });
};

module.exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isAuthor = post.author.equals(req.user.id);
    const isAdmin = req.user.isAdmin === true;

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};