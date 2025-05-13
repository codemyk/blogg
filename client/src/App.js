// App.js
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Admin from './pages/Admin';
import Logout from './pages/Logout';
import { UserProvider } from './UserContext';

function App() {
  const [user, setUser] = useState({ id: null });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log("Loaded from localStorage:", storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserProvider value={{ user, setUser }}>
      <Router>
        <AppNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
