import React, { useEffect, useState, useRef, useContext } from 'react';
import { Modal, Button, Form, Row, Col, Badge, Spinner } from 'react-bootstrap';
import UserContext from '../UserContext';
import TiptapEditor from '../components/TiptapEditor';
import DOMPurify from 'dompurify';

const POSTS_PER_PAGE = 6;
const TAG_KEYWORDS = {
  Religion: ['god', 'faith', 'pray', 'church', 'bible'],
  Wellness: ['health', 'wellness', 'exercise', 'diet', 'mental'],
  Productivity: ['productivity', 'work', 'focus', 'task', 'goal'],
  Mindset: ['mindset', 'attitude', 'growth', 'belief'],
  Life: ['life', 'living', 'experience', 'journey'],
  'Christian Life': ['christian', 'jesus', 'gospel', 'christ'],
  Anime: ['anime', 'cartoon', 'pokemon', 'Pokémon'],
  Hobbies: ['anime', 'cartoon', 'swimming', 'climbing', 'reading']
};

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
  const [loadingPosts, setLoadingPosts] = useState(true);
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
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const commentInputRef = useRef(null);

  useEffect(() => {
    fetchPosts();
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedPosts')) || [];
    setBookmarkedPosts(bookmarks);
  }, []);

  const fetchPosts = () => {
    setLoadingPosts(true);
    fetch('https://blogg-1qrd.onrender.com/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
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
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://blogg-1qrd.onrender.com/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment, post: selectedPost._id }),
      });

      if (!res.ok) throw new Error('Failed to add comment');

      const addedComment = await res.json();
      setComments((prev) => [...prev, addedComment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setIsCreatingPost(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://blogg-1qrd.onrender.com/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPost),
      });

      if (res.ok) {
        const created = await res.json();
        setPosts((prev) => [created, ...prev]);
        setNewPost({ title: '', content: '' });
        setShowAddModal(false);
      } else {
        console.error('Failed to create post');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleEditPost = (postId) => {
    const postToEdit = posts.find((post) => post._id === postId);
    if (postToEdit) {
      setEditedPost({ title: postToEdit.title, content: postToEdit.content });
      setSelectedPost(postToEdit);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedPost.title.trim() || !editedPost.content.trim()) return;
    setIsSavingEdit(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://blogg-1qrd.onrender.com/posts/${selectedPost._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedPost),
      });

      if (res.ok) {
        const updated = await res.json();
        setPosts(posts.map((post) => (post._id === updated._id ? updated : post)));
        setShowEditModal(false);
      } else {
        console.error('Failed to update post');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const toggleBookmark = (postId) => {
    const updated = bookmarkedPosts.includes(postId)
      ? bookmarkedPosts.filter((id) => id !== postId)
      : [...bookmarkedPosts, postId];

    setBookmarkedPosts(updated);
    localStorage.setItem('bookmarkedPosts', JSON.stringify(updated));
  };

  const filteredPosts = posts
    .filter(
      (post) =>
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
    <>
    <div className="blogs-bg">
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
              <Button type="submit" className="w-100">
                Search
              </Button>
            </Col>
            <Col xs={6} md={2}>
              <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </Form.Select>
            </Col>
          </Row>
        </Form>

        {loadingPosts ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
            <div>Loading posts...</div>
          </div>
        ) : (
          <>
            <div className="row">
              {paginatedPosts.map((post) => {
                const postTags = extractTagsFromContent(post.content);

                return (
                  <div key={post._id} className="col-md-6 mb-4">
                    <div className="card h-100 shadow-sm blog-card">
                      <img
                        src={`https://picsum.photos/seed/${post._id}/600/300`}
                        className="card-img-top"
                        alt="Blog thumbnail"
                      />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{post.title}</h5>
                        <p className="text-muted mb-1">
                          By {post.author?.username || 'Unknown'} on{' '}
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mb-2">
                          {postTags.length > 0
                            ? postTags.map((tag, i) => (
                                <Badge key={i} bg="secondary" className="me-1">
                                  {tag}
                                </Badge>
                              ))
                            : (
                              <Badge bg="secondary">General</Badge>
                            )}
                        </div>
                        <div
                          className="card-text flex-grow-1 overflow-hidden fixed-content-height"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(post.content.substring(0, 150)) + '...',
                          }}
                        />
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openPostModal(post._id)}
                          >
                            Read More
                          </Button>
                          <div>
                            <Button
                              variant={bookmarkedPosts.includes(post._id) ? 'warning' : 'outline-warning'}
                              size="sm"
                              onClick={() => toggleBookmark(post._id)}
                              title={bookmarkedPosts.includes(post._id) ? 'Remove Bookmark' : 'Bookmark'}
                            >
                              ★
                            </Button>
                            {user.id === post.author?._id && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="ms-2"
                                onClick={() => handleEditPost(post._id)}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {paginatedPosts.length === 0 && (
                <p className="text-center mt-5">No posts found.</p>
              )}
            </div>


            {/* Pagination controls */}
            <div className="d-flex justify-content-center mt-3">
              <Button
                className="me-2 page-button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    className={`me-2 page-button ${page === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                className="me-2 page-button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </>
        )}

        {/* Post Modal */}
        <Modal
          size="lg"
          show={showModal}
          onHide={() => setShowModal(false)}
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>{selectedPost?.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(selectedPost?.content || ''),
              }}
            />
            <hr />
            <h5>Comments ({comments.length})</h5>
            {comments.length === 0 && <p>No comments yet.</p>}
            <ul className="list-unstyled">
              {comments.map((comment) => (
                <li key={comment._id} className="mb-2 border-bottom pb-2">
                  <strong>{comment.author?.username || 'Anonymous'}:</strong> {comment.text}
                </li>
              ))}
            </ul>
            {user.id ? (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddComment();
                }}
              >
                <Form.Group controlId="commentTextarea" className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    ref={commentInputRef}
                    disabled={isSubmittingComment}
                  />
                </Form.Group>
                <Button type="submit" disabled={!newComment.trim() || isSubmittingComment}>
                  {isSubmittingComment ? (
                    <>
                      <Spinner animation="border" size="sm" role="status" aria-hidden="true" /> Posting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </Button>
              </Form>
            ) : (
              <p>You need to be logged in to comment.</p>
            )}
          </Modal.Body>
        </Modal>

        {/* Add Post Modal */}
        <Modal
          size="lg"
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="addPostTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
                  disabled={isCreatingPost}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="addPostContent">
                <Form.Label>Content</Form.Label>
                <TiptapEditor
                  content={newPost.content}
                  onChange={(content) => setNewPost((prev) => ({ ...prev, content }))}
                  disabled={isCreatingPost}
                />
              </Form.Group>
              <Button
                variant="success"
                onClick={handleCreatePost}
                disabled={!newPost.title.trim() || !newPost.content.trim() || isCreatingPost}
              >
                {isCreatingPost ? (
                  <>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" /> Creating...
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Edit Post Modal */}
        <Modal
          size="lg"
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="editPostTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editedPost.title}
                  onChange={(e) => setEditedPost((prev) => ({ ...prev, title: e.target.value }))}
                  disabled={isSavingEdit}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editPostContent">
                <Form.Label>Content</Form.Label>
                <TiptapEditor
                  content={editedPost.content}
                  setContent={(content) => setEditedPost((prev) => ({ ...prev, content }))}
                  disabled={isSavingEdit}
                />
              </Form.Group>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                disabled={!editedPost.title.trim() || !editedPost.content.trim() || isSavingEdit}
              >
                {isSavingEdit ? (
                  <>
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" /> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
      </div>
    </>
  );
};

export default Blogs;
