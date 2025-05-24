import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaBookOpen, FaTools } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <h1>Welcome to BLOGG</h1>
      </motion.div>
      {currentUser ? (
        <>
          <p className="lead">Enjoy browsing our collection of blogs!</p>
          <Button variant="primary" as={Link} to="/blogs" className="me-2">
            <FaBookOpen /> Explore Blogs
          </Button>
          {currentUser.isAdmin && (
            <div className="mt-3">
              <Button variant="warning" as={Link} to="/admin">
                <FaTools /> Admin Dashboard
              </Button>
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
