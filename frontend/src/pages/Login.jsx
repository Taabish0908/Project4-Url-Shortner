import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn">Sign In</button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link to="/forgotpassword" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Forgot Password?</Link>
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <span>Don't have an account? </span>
        <Link to="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Register</Link>
      </div>
    </div>
  );
};
export default Login;
