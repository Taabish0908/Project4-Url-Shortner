import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  
  const { token, user } = useContext(AuthContext);
  const API_URL = 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessData(null); setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const bodyPayload = { longUrl };
      if (customAlias && customAlias.trim().length > 0) bodyPayload.customAlias = customAlias.trim();
      if (expiresInDays && Number(expiresInDays) > 0) bodyPayload.expiresInDays = Number(expiresInDays);

      const res = await fetch(`${API_URL}/url/shorten`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to shorten URL');

      setSuccessData(result.data);
      setLongUrl(''); setCustomAlias(''); setExpiresInDays('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="header" style={{ textAlign: 'center' }}>
        <h1 className="title">Urlify.</h1>
        <p className="subtitle">Shorten your links, expand your reach.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
          {token ? `Logged in as ${user?.name}: this link will be saved to your dashboard.` : "Log in to enable link expiration and analytics!"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="longUrl">Destination URL</label>
          <input type="url" id="longUrl" className="input-field" placeholder="https://very-long-url.com/" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="customAlias">Custom Alias (Optional)</label>
          <input type="text" id="customAlias" className="input-field" placeholder="e.g. my-campaign" value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} maxLength={15} />
        </div>

        {token && (
          <div className="form-group">
            <label htmlFor="expiresInDays">Expire In (Days) - Optional</label>
            <input type="number" id="expiresInDays" className="input-field" placeholder="e.g. 7" min="1" max="365" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} />
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Shorten URL'}
        </button>
      </form>

      {successData && (
        <div className="success-message">
          <p>Your short link is ready!</p>
          <div className="short-url">{successData.shortUrl}</div>
        </div>
      )}
    </div>
  );
};

export default Home;
