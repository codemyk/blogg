import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../UserContext';

export default function Logout() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser({ id: null, isAdmin: false });
      navigate('/login');
    }, 1000);

    return () => clearTimeout(timer);
  }, [setUser, navigate]);

  return showLoading ? (
    <div className="logout-overlay">
      <div className="spinner-border text-light logout-spinner" role="status">
        <span className="visually-hidden">Logging out...</span>
      </div>
      <h5>Logging you out, please wait...</h5>
    </div>
  ) : null;
}
