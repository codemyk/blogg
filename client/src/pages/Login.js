import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container } from 'react-bootstrap';
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
        // Store token
        localStorage.setItem("token", data.access);

        // Decode the token
        const decoded = jwtDecode(data.access);

        // Update user context
        setUser({
          id: decoded.id,
          isAdmin: decoded.isAdmin
        });

        // Store user in localStorage
        localStorage.setItem("user", JSON.stringify({
          id: decoded.id,
          isAdmin: decoded.isAdmin
        }));

        // Redirect to blogs page
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
    <Container className="py-4">
      <h2>Login</h2>
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

        <Button variant="primary" type="submit" className="mt-3">
          Login
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
