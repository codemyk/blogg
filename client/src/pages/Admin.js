import React, { useState, useEffect } from 'react';
import { Button, Toast, ToastContainer, Table, Dropdown, ButtonGroup } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchPosts();
  }, []);

  const triggerToast = (message, type = 'success') => {
    setSuccessMessage(message);
    setToastType(type);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 1500);
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        triggerToast('No token found, please log in', 'error');
        return;
      }

      const decodedToken = jwtDecode(token);
      const isAdmin = decodedToken.isAdmin === true;
      const response = await fetch('https://blogg-1qrd.onrender.com/posts/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setPosts([]);
        triggerToast('Failed to fetch posts!', 'error');
      }
    } catch (error) {
      setPosts([]);
      triggerToast('Failed to fetch posts!', 'error');
    }
  };

  const handleDeletePost = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://blogg-1qrd.onrender.com/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchPosts();
        triggerToast('Post deleted successfully!');
      } else {
        triggerToast('Failed to delete post!', 'error');
      }
    } catch (error) {
      triggerToast('Failed to delete post!', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://blogg-1qrd.onrender.com/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchPosts();
        triggerToast('Comment deleted successfully!');
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        triggerToast('Failed to delete comment!', 'error');
      }
    } catch (error) {
      triggerToast('Failed to delete comment!', 'error');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Admin Dashboard</h1>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          show={showSuccess}
          onClose={() => setShowSuccess(false)}
          bg={toastType === 'success' ? 'secondary' : 'danger'}
          delay={1500}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">{toastType === 'success' ? 'Success' : 'Error'}</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{successMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id}>
              <td>{post.title}</td>
              <td>{post.author?.username || 'Unknown'}</td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    Delete Post
                  </Button>

                  <Dropdown as={ButtonGroup}>
                    <Dropdown.Toggle variant="secondary" size="sm">
                      Manage Comments
                    </Dropdown.Toggle>

                    <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto', width: '350px' }}>
                      {post.comments?.length > 0 ? (
                        post.comments.map((comment) => (
                          <div
                            key={comment._id}
                            className="d-flex justify-content-between align-items-start px-3 py-2 border-bottom"
                          >
                            <div style={{ maxWidth: '220px', wordBreak: 'break-word' }}>
                              <strong>{comment.author?.username || 'Unknown'}:</strong> {comment.text}
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteComment(comment._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        ))
                      ) : (
                        <Dropdown.Item disabled>No comments</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminDashboard;
