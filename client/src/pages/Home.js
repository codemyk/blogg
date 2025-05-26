import React, { useState, useEffect } from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaBookOpen, FaTools } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="home-bg">
      <Container className="text-center px-4">
        {/* 🌟 Logo Image */}
        <motion.img
          src="/logo.png"
          alt="Blogg Logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: "200px", marginBottom: "20px" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="mb-3 display-4 fw-bold">Welcome to BLOGG</h1>
          {currentUser ? (
            <>
              <p className="lead">Enjoy browsing our collection of blogs!</p>
              <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
                <Button variant="primary" as={Link} to="/blogs">
                  <FaBookOpen className="me-1" /> Explore Blogs
                </Button>
                {currentUser.isAdmin && (
                  <Button variant="warning" as={Link} to="/admin">
                    <FaTools className="me-1" /> Admin Dashboard
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="lead">Please log in or register to access our blogs.</p>
              <Button variant="primary" as={Link} to="/login" className="me-2 mb-2">
                <FaSignInAlt className="me-1" /> Login
              </Button>
              <Button variant="secondary" as={Link} to="/register" className="mb-2">
                <FaUserPlus className="me-1" /> Register
              </Button>
            </>
          )}
        </motion.div>
      </Container>
    </div>
  );
}
