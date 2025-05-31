import { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import UserContext from '../UserContext';

export default function Register() {
  const { user } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsActive(
      username.length >= 3 &&
      email &&
      password.length >= 8 &&
      confirmPassword &&
      password === confirmPassword
    );
  }, [username, email, password, confirmPassword]);

  const registerUser = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch('https://blogg-1qrd.onrender.com/users/register', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Registration Response:", data);
      setLoading(false);

      if (data.message === "User registered successfully") {
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        Swal.fire({
          title: "Registration Successful",
          icon: "success",
          text: "Thank you for registering!"
        }).then(() => navigate("/login"));
      } else {
        Swal.fire({
          title: "Registration Failed",
          icon: "error",
          text: data.message || "Please try again later or contact support."
        });
      }
    })
    .catch(error => {
      console.error('Error during registration:', error);
      setLoading(false);
      Swal.fire({
        title: "Network Error",
        icon: "error",
        text: "Please check your connection and try again."
      });
    });
  };

  return (
    <div className="home-bg register-bg" style={{ minHeight: '100vh' }}>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Card className="login-card p-5 shadow-lg w-100" style={{ maxWidth: '500px' }}>
          <img src="/logo.png" alt="Blogg Logo" style={{ width: "150px", margin: "0 auto 1.5rem auto", display: "block" }} />

          <h2 className="text-center mb-4">Register</h2>

          <Form onSubmit={registerUser}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                required
                minLength={3}
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password (min 8 chars.)"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button
              variant={isActive ? "primary" : "danger"}
              type="submit"
              disabled={!isActive}
              className="w-100"
            >
              Register
            </Button>
          </Form>
        </Card>
      </Container>

      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#fff"
          }}
        >
          <div className="spinner-border text-light mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Creating your account, please hold on...</h5>
        </div>
      )}
    </div>
  );
}
