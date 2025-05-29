import React, { useState, useEffect } from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaBookOpen, FaTools, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setCurrentUser(JSON.parse(storedUser));
    }

    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      const res = await fetch('https://blogg-1qrd.onrender.com/posts');
      const data = await res.json();
      const shuffled = data.sort(() => 0.5 - Math.random());
      setTrendingPosts(shuffled.slice(0, 3));
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const dummyReviews = [
    {
      name: "Catwoman92",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      comment: "Amazing content and user-friendly interface!",
      rating: 5
    },
    {
      name: "Jarrett Gold",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      comment: "Really enjoying reading the blogs here.",
      rating: 4
    },
    {
      name: "Alice Cooper",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      comment: "A wonderful place for inspiration and reflection.",
      rating: 5
    }
  ];

  return (
    <div className="home-bg">
      <Container className="text-center px-4 py-5">
        {/* 🌟 Logo */}
        <motion.img
          src="/logo.png"
          alt="Blogg Logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: "200px", marginBottom: "20px" }}
        />

        {/* 👋 Welcome & Navigation */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <h1 className="mb-3 display-4 fw-bold">Welcome to BLOGG!</h1>
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

        {/*  Trending Posts */}
        <div className="mt-5">
          <h2 className="mb-4"> Trending Posts</h2>
          <Row>
            {trendingPosts.map((post) => (
              <Col md={4} key={post._id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Img variant="top" src={`https://picsum.photos/seed/${post._id}/400/200`} />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text className="flex-grow-1">
                      {stripHtml(post.content).substring(0, 100)}...
                    </Card.Text>
                    <div className="mt-auto">
                      <Button variant="outline-primary" as={Link} to="/blogs">
                        Read More
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Reviews Section */}
        <div className="mt-5">
          <h2 className="mb-4"> What People Are Saying</h2>
          <Row className="justify-content-center">
            {dummyReviews.map((review, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="h-100 text-center shadow-sm p-3">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="rounded-circle mx-auto mb-3"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title>{review.name}</Card.Title>
                    <div className="text-warning mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <FaStar key={i} />
                      ))}
                    </div>
                    <Card.Text>"{review.comment}"</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* 🧾 Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-5">
        <Container>
          <small>Copyright © 2025. All Rights Reserved - John Michael Catapia</small>
        </Container>
      </footer>
    </div>
  );
}
