import React, { useEffect, useState, useRef, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import UserContext from '../UserContext';

const Blogs = () => {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [showEditModal, setShowEditModal] = useState(false); // For the edit modal
  const [editedPost, setEditedPost] = useState({ title: '', content: '' }); // To store the post being edited
  const commentInputRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    fetch('http://localhost:4000/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => setPosts([]));
  };

  const openPostModal = (postId, focusComment = false) => {
    fetch(`http://localhost:4000/posts/${postId}`)
      .then(res => res.json())
      .then(data => {
        setSelectedPost(data);
        setComments(data.comments || []);
        setShowModal(true);

        if (focusComment) {
          setTimeout(() => {
            commentInputRef.current?.focus();
          }, 300);
        }
      })
      .catch(() => {
        setSelectedPost(null);
        setComments([]);
      });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:4000/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text: newComment,
          post: selectedPost._id
        })
      });

      const addedComment = await res.json();
      setComments(prev => [...prev, addedComment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleCreatePost = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:4000/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newPost)
      });

      if (res.ok) {
        const created = await res.json();
        setPosts(prev => [created, ...prev]);
        setNewPost({ title: '', content: '' });
        setShowAddModal(false);
      } else {
        console.error('Failed to create post');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPost = (postId) => {
    // Find the post to edit
    const postToEdit = posts.find(post => post._id === postId);
    if (postToEdit) {
      setEditedPost({ title: postToEdit.title, content: postToEdit.content });
      setSelectedPost(postToEdit);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:4000/posts/${selectedPost._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editedPost)
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
        setShowEditModal(false);
      } else {
        console.error('Failed to update post');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 fw-bold">Blog Posts</h1>
        {user.id && (
          <Button variant="success" onClick={() => setShowAddModal(true)}>
            + Add Blog
          </Button>
        )}
      </div>

      <div className="row">
        {posts.map(post => (
          <div key={post._id} className="col-12 mb-4">
            <div className="border rounded p-3 shadow-sm">
              <h4>{post.title}</h4>
              <p className="text-muted">
                By {post.author?.username || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p>{post.content.substring(0, 150)}...</p>
              <Button
                variant="primary"
                size="sm"
                className="me-2"
                onClick={() => openPostModal(post._id, false)}
              >
                Read More
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => openPostModal(post._id, true)}
              >
                Comment
              </Button>
              {post.author._id === user.id && (
                <Button
                  variant="warning"
                  size="sm"
                  className="ms-2"
                  onClick={() => handleEditPost(post._id)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Post Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedPost?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPost && (
            <>
              <p><strong>Author:</strong> {selectedPost.author?.username}</p>
              <p><strong>Date:</strong> {new Date(selectedPost.createdAt).toLocaleString()}</p>
              <hr />
              <p>{selectedPost.content}</p>
              <hr />
              <h5>Comments</h5>
              {comments.length > 0 ? (
                <ul className="list-unstyled">
                  {comments.map((comment, i) => (
                    <li key={i} className="mb-2">
                      <strong>{comment.author?.username || 'Anonymous'}:</strong> {comment.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No comments yet.</p>
              )}
              <Form className="mt-3">
                <Form.Group>
                  <Form.Label>Add a Comment</Form.Label>
                  <Form.Control
                    ref={commentInputRef}
                    as="textarea"
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </Form.Group>
                <Button variant="success" className="mt-2" onClick={handleAddComment}>
                  Submit
                </Button>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Add Blog Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Blog Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
            </Form.Group>
            <Button className="mt-3" variant="primary" onClick={handleCreatePost}>
              Publish
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Post Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPost && (
            <Form>
              <Form.Group>
<Form.Label>Title</Form.Label>
<Form.Control
type="text"
value={editedPost.title}
onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
/>
</Form.Group>
<Form.Group className="mt-3">
<Form.Label>Content</Form.Label>
<Form.Control
as="textarea"
rows={5}
value={editedPost.content}
onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
/>
</Form.Group>
<Button className="mt-3" variant="primary" onClick={handleSaveEdit}>
Save Changes
</Button>
</Form>
)}
</Modal.Body>
</Modal>
</div>
);
};

export default Blogs;
