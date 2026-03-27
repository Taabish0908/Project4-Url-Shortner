import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [selectedAnalytics, setSelectedAnalytics] = useState(null);
  const { token, user } = useContext(AuthContext);

  const fetchUrls = async () => {
    try {
      const res = await fetch('http://localhost:3000/urls/recent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUrls(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [token]);

  const fetchAnalytics = async (urlCode) => {
    try {
      const res = await fetch(`http://localhost:3000/analytics/${urlCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSelectedAnalytics(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Welcome, {user.name}!</h2>
      <div className="app-container" style={{
    display: "grid",
    gridTemplateColumns: selectedAnalytics ? "minmax(0,1fr) minmax(0,1fr)" : "minmax(0,1fr)",
    gap: "1.5rem",
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden"
  }}>
        
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Your Links</h2>
            <button className="btn" style={{ width: 'auto', padding: '0.5rem', marginTop: 0 }} onClick={fetchUrls}>↻</button>
          </div>
          <ul className="recent-list">
            {urls.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem' }}>
                    <p className="subtitle" style={{ marginBottom: '1rem' }}>You haven't generated any short links yet!</p>
                    <a href="/" className="btn" style={{ display: 'inline-block', textDecoration: 'none', width: 'auto' }}>Go Create One</a>
                </div>
            )}
            {urls.map((link) => (
              <li key={link.urlCode} className="recent-item" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div className="item-urls" style={{ flex: '1 1 200px', overflow: 'hidden' }}>
                  <a href={link.shortUrl} target="_blank" rel="noreferrer" className="item-short" style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{link.shortUrl}</a>
                  <span className="item-long" style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{link.longUrl}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {link.expiresAt ? `Expires: ${new Date(link.expiresAt).toLocaleDateString()}` : 'Never Expires'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  <div className="item-clicks">{link.clicks} clicks</div>
                  <button className="btn" style={{ margin: 0, padding: '0.4rem 0.8rem', width: 'auto' }} onClick={() => fetchAnalytics(link.urlCode)}>Stats</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selectedAnalytics && (
          <div className="glass-panel">
            <h2>Detailed Analytics</h2>
            <p className="subtitle" style={{ marginBottom: '1rem' }}>Click records for the selected link</p>
            <ul className="recent-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {selectedAnalytics.length === 0 && <p>No detailed clicks recorded yet.</p>}
              {selectedAnalytics.map((stat, i) => (
                <li key={i} className="recent-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{new Date(stat.createdAt).toLocaleString()}</div>
                  <div style={{ fontSize: '0.9rem' }}><b>OS:</b> {stat.os} | <b>Browser:</b> {stat.browser}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>IP: {stat.ipAddress}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};
export default Dashboard;
