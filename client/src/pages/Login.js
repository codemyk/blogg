import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';  // <-- Import Link here
import { Button, Form, Container, Card } from 'react-bootstrap';
import UserContext from '../UserContext';
import { jwtDecode } from 'jwt-decode'; // fixed import - jwtDecode is default export

const Login = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(false);

  const authenticate = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://blogg-1qrd.onrender.com/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();

      if (data.access) {
        localStorage.setItem("token", data.access);

        const decoded = jwtDecode(data.access);

        setUser({
          id: decoded.id,
          isAdmin: decoded.isAdmin
        });

        localStorage.setItem("user", JSON.stringify({
          id: decoded.id,
          isAdmin: decoded.isAdmin
        }));

        navigate("/blogs");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    if (identifier.trim() !== "" && password.length >= 8) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [identifier, password]);

  return (
    <>
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="p-5 shadow-lg w-100" style={{ maxWidth: '500px' }}>
        
        {/* 🌟 Logo Image */}
        <img src="/logo.png" alt="Blogg Logo" style={{ width: "150px", margin: "0 auto", display: "block" }} />

        <Form onSubmit={authenticate}>
          <Form.Group controlId="formIdentifier">
            <Form.Label>Username or Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button 
            variant={isActive ? "primary" : "danger"} 
            type="submit" 
            className="mt-4 w-100"
            disabled={!isActive}
          >
            Login
          </Button>
        </Form>

        {/* Signup Link */}
        <div className="mt-3 text-center">
          Don't have an account?{' '}
          <Link to="/signup" style={{ textDecoration: 'underline' }}>
            Sign up
          </Link>
        </div>
      </Card>
    </Container>
    <footer className="bg-dark text-white text-center py-3 mt-5">
            <small>Copyright © 2025. All Rights Reserved - John Michael Catapia</small>
          </footer>
    </>
  );
};

export default Login;
