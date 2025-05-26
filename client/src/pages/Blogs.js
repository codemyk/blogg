import React, { useEffect, useState, useRef, useContext } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import UserContext from '../UserContext';
import TiptapEditor from '../components/TiptapEditor';
import DOMPurify from 'dompurify';

const POSTS_PER_PAGE = 4;

// Keyword to Tag mapping for automatic tag extraction
const TAG_KEYWORDS = {
  Religion: ['god', 'faith', 'pray', 'church', 'bible'],
  Wellness: ['health', 'wellness', 'exercise', 'diet', 'mental'],
  Productivity: ['productivity', 'work', 'focus', 'task', 'goal'],
  Mindset: ['mindset', 'attitude', 'growth', 'belief'],
  Life: ['life', 'living', 'experience', 'journey'],
  'Christian Life': ['christian', 'jesus', 'gospel', 'christ'],
};

// Function to extract tags from post content
function extractTagsFromContent(content) {
  if (!content) return [];
  const lowerContent = content.toLowerCase();
  const matchedTags = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      matchedTags.push(tag);
    }
  }
  return matchedTags;
}

const Blogs = () => {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedPost, setEditedPost] = useState({ title: '', content: '' });
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const commentInputRef = useRef(null);

  useEffect(() => {
    fetchPosts();
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedPosts')) || [];
    setBookmarkedPosts(bookmarks);
  }, []);

  const fetchPosts = () => {
    fetch('https://blogg-1qrd.onrender.com/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => setPosts([]));
  };

  const openPostModal = (postId, focusComment = false) => {
    fetch(`https://blogg-1qrd.onrender.com/posts/${postId}`)
      .then(res => res.json())
      .then(data => {
        setSelectedPost(data);
        setComments(data.comments || []);
        setShowModal(true);
        if (focusComment) {
          setTimeout(() => commentInputRef.current?.focus(), 300);
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
      const res = await fetch(`https://blogg-1qrd.onrender.com/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment, post: selectedPost._id })
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
      const res = await fetch(`https://blogg-1qrd.onrender.com/posts`, {
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPost = (postId) => {
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
      const res = await fetch(`https://blogg-1qrd.onrender.com/posts/${selectedPost._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editedPost)
      });

      if (res.ok) {
        const updated = await res.json();
        setPosts(posts.map(post => post._id === updated._id ? updated : post));
        setShowEditModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const toggleBookmark = (postId) => {
    const updated = bookmarkedPosts.includes(postId)
      ? bookmarkedPosts.filter(id => id !== postId)
      : [...bookmarkedPosts, postId];

    setBookmarkedPosts(updated);
    localStorage.setItem('bookmarkedPosts', JSON.stringify(updated));
  };

  const filteredPosts = posts
    .filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="container py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h1 className="h3 fw-bold">Blog Posts</h1>
        </Col>
        <Col xs="auto">
          {user.id && (
            <Button variant="success" onClick={() => setShowAddModal(true)}>
              + Add Blog
            </Button>
          )}
        </Col>
      </Row>

      <Form onSubmit={handleSearch} className="mb-3">
        <Row className="g-2">
          <Col xs={12} md={8}>
            <Form.Control
              type="text"
              placeholder="Search blog posts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </Col>
          <Col xs={6} md={2}>
            <Button type="submit" className="w-100">Search</Button>
          </Col>
          <Col xs={6} md={2}>
            <Form.Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </Form.Select>
          </Col>
        </Row>
      </Form>

      <div className="row">
        {paginatedPosts.map((post) => {
          const postTags = extractTagsFromContent(post.content);

          return (
            <div key={post._id} className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={`https://picsum.photos/seed/${post._id}/600/300`}
                  className="card-img-top"
                  alt="Blog thumbnail"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{post.title}</h5>
                  <p className="text-muted mb-1">
                    By {post.author?.username || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mb-2">
                    {postTags.length > 0
                      ? postTags.map((tag, i) => (
                          <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>
                        ))
                      : <Badge bg="secondary">General</Badge>}
                  </div>
                  <div
                    className="card-text flex-grow-1 overflow-hidden"
                    style={{ maxHeight: '6.5em' }} // roughly 4 lines
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(post.content.substring(0, 250)) + '...',
                    }}
                  />
                  <p className="text-muted small mb-2">
                    💬 {post.comments?.length || 0} comment{post.comments?.length === 1 ? '' : 's'}
                  </p>
                  <div>
                    <Button variant="primary" size="sm" className="me-2" onClick={() => openPostModal(post._id, false)}>Read More</Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => openPostModal(post._id, true)}>Comment</Button>
                    {post.author._id === user.id && (
                      <Button variant="warning" size="sm" className="ms-2" onClick={() => handleEditPost(post._id)}>Edit</Button>
                    )}
                    <Button
                      variant={bookmarkedPosts.includes(post._id) ? "danger" : "outline-danger"}
                      size="sm"
                      className="float-end"
                      onClick={() => toggleBookmark(post._id)}
                      title="Bookmark this post"
                    >
                      {bookmarkedPosts.includes(post._id) ? '★' : '☆'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="me-2"
          >
            Previous
          </Button>
          <span className="align-self-center mx-2">Page {currentPage} of {totalPages}</span>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}

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
              <p>
                <div dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
              </p>
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
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Blog Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <TiptapEditor
                content={newPost.content}
                onChange={content => setNewPost(prev => ({ ...prev, content }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreatePost}>Create</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Blog Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Blog Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editedPost.title}
                onChange={(e) => setEditedPost(prev => ({ ...prev, title: e.target.value }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <TiptapEditor
                content={editedPost.content}
                onChange={content => setEditedPost(prev => ({ ...prev, content }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveEdit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Blogs;
