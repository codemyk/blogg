import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Card } from 'react-bootstrap';
import UserContext from '../UserContext';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

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

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="p-5 shadow-lg w-100" style={{ maxWidth: '500px' }}>
        
        {/* 🌟 Logo Image */}
        <img src="/logo.png" alt="Blogg Logo" style={{ width: "80px", margin: "0 auto", display: "block" }} />

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

          <Button variant="primary" type="submit" className="mt-4 w-100">
            Login
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Login;
