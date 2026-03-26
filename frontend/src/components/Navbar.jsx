import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '1rem', marginBottom: '2rem', backdropFilter: 'blur(10px)' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>Urlify.</Link>
      <div>
        {user ? (
          <>
            <Link to="/" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>+ Create Link</Link>
            <Link to="/dashboard" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin" style={{ color: 'rgba(255,100,100,0.8)', marginRight: '1rem', textDecoration: 'none' }}>Admin</Link>}
            <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', width: 'auto', marginTop: 0 }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="btn" style={{ padding: '0.5rem 1rem', textDecoration: 'none', display: 'inline-block', width: 'auto', marginTop: 0 }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
