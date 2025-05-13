import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Try to get user data from localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Container className="py-5 text-center">
      <h1>Welcome to BLOGG</h1>
      {currentUser ? (
        <>
          <p className="lead">Enjoy browsing our collection of blogs!</p>
          <Button variant="primary" as={Link} to="/blogs">Go to Blogs</Button>
          {currentUser.isAdmin && (
            <div className="mt-3">
              <Button variant="warning" as={Link} to="/admin">Admin Dashboard</Button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="lead">Please log in or register to access our blogs.</p>
          <Button variant="primary" as={Link} to="/login" className="me-2">Login</Button>
          <Button variant="secondary" as={Link} to="/register">Register</Button>
        </>
      )}
    </Container>
  );
}
