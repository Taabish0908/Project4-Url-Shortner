import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [longUrl, setLongUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [recentUrls, setRecentUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState(null)

  const API_URL = 'http://localhost:3000'

  useEffect(() => {
    fetchRecentUrls()
    
    // Auto-refresh the links every 10 seconds to show click updates
    const interval = setInterval(() => {
      fetchRecentUrls()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchRecentUrls = async () => {
    try {
      const res = await fetch(`${API_URL}/urls/recent`)
      const result = await res.json()
      if (result.status === 'success') {
        setRecentUrls(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch recent URLs')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessData(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/url/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ longUrl, customAlias })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || 'Failed to shorten URL')
      }

      setSuccessData(result.data)
      setLongUrl('')
      setCustomAlias('')
      fetchRecentUrls()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      {/* Shortener Form section */}
      <div className="glass-panel">
        <div className="header">
          <h1 className="title">Urlify.</h1>
          <p className="subtitle">Shorten your links, expand your reach.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="longUrl">Destination URL</label>
            <input
              type="url"
              id="longUrl"
              className="input-field"
              placeholder="https://very-long-url.com/something"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customAlias">Custom Alias (Optional)</label>
            <input
              type="text"
              id="customAlias"
              className="input-field"
              placeholder="e.g. my-campaign"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              maxLength={15}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Shorten URL'}
          </button>
        </form>

        {successData && (
          <div className="success-message">
            <p>Your short link is ready!</p>
            <div className="short-url">{successData.shortUrl}</div>
            <p className="subtitle" style={{ fontSize: '0.85rem' }}>
              Original: {successData.longUrl.substring(0, 30)}...
            </p>
          </div>
        )}
      </div>

      {/* Analytics / Recent Links section */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Recent Links</h2>
          <button 
            onClick={fetchRecentUrls} 
            className="btn" 
            style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0, fontSize: '0.9rem' }}
          >
            ↻ Refresh
          </button>
        </div>
        <ul className="recent-list">
          {recentUrls.length === 0 ? (
            <p className="subtitle">No links generated yet.</p>
          ) : (
            recentUrls.map((item, index) => (
              <li key={index} className="recent-item">
                <div className="item-urls">
                  <a 
                    href={item.shortUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="item-short"
                  >
                    {item.shortUrl}
                  </a>
                  <span className="item-long">{item.longUrl}</span>
                </div>
                <div className="item-clicks">
                  {item.clicks} clicks
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default App
