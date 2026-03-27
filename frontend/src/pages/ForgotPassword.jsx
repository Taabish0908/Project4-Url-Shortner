import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
      setMessage('Password reset link sent to your email. (Check server console for simulation)');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Forgot Password</h2>
      <p style={{ marginBottom: '1.5rem', textAlign: 'center', opacity: 0.8 }}>
        Enter your email address and we will send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            required 
            className="input-field" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        {message && <div className="success-message" style={{ color: '#2ecc71', marginBottom: '1rem' }}>{message}</div>}
        {error && <div className="error-message" style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
