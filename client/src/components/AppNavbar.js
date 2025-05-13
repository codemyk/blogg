import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import UserContext from '../UserContext';
import { jwtDecode } from 'jwt-decode';

export default function AppNavbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Current time in seconds
        
        // Check if the token is expired
        if (decoded.exp < currentTime) {
          // Token expired, log out the user
          localStorage.removeItem('token');
          setUser({ id: null, isAdmin: false });
        } else {
          // Token is valid, set user context
          setUser({
            id: decoded.id,
            isAdmin: decoded.isAdmin
          });
        }
      } catch (error) {
        console.error("Token decoding failed", error);
        // Handle token errors if necessary (e.g., log out user)
        localStorage.removeItem('token');
        setUser({ id: null, isAdmin: false });
      }
    } else {
      // No token in localStorage, set user as unauthenticated
      setUser({ id: null, isAdmin: false });
    }
  }, [setUser]);  // Only run once when component mounts

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">BLOGG!</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {user.id ? (
              <>
                <Nav.Link as={Link} to="/blogs">Blogs</Nav.Link>
                {user.isAdmin && (
                  <Nav.Link as={Link} to="/admin">Admin Dashboard</Nav.Link>
                )}
                <Nav.Link as={Link} to="/logout">Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
