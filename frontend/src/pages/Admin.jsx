import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Admin = () => {
    const [stats, setStats] = useState(null);
    const { token, user } = useContext(AuthContext);

    useEffect(() => {
        const fetchSystemStats = async () => {
            try {
                const res = await fetch('http://localhost:3000/analytics/system/admin', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setStats(data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSystemStats();
    }, [token]);

    if(user?.role !== 'admin') {
        return <div className="glass-panel"><h2 style={{color: 'var(--danger)'}}>Access Denied. Admins Only.</h2></div>
    }

    if(!stats) return <div>Loading Admin Stats...</div>

    return (
        <div>
            <div className="app-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)' }}>Registered Users</h3>
                    <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalUsers}</div>
                </div>
                <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-muted)' }}>URLs Generated</h3>
                    <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{stats.totalUrls}</div>
                </div>
            </div>

            <div className="app-container">
                <div className="glass-panel">
                <h2>Total Operating Systems Used</h2>
                <ul className="recent-list" style={{ marginTop: '1rem' }}>
                    {stats.osStats.map(s => (
                        <li key={s._id} className="recent-item"><span>{s._id}</span> <span className="item-clicks">{s.count}</span></li>
                    ))}
                </ul>
            </div>
            <div className="glass-panel">
                <h2>Total Browsers Used</h2>
                <ul className="recent-list" style={{ marginTop: '1rem' }}>
                    {stats.browserStats.map(s => (
                        <li key={s._id} className="recent-item"><span>{s._id}</span> <span className="item-clicks">{s.count}</span></li>
                    ))}
                </ul>
            </div>
            <div className="glass-panel">
                <h2>Top Countries</h2>
                <ul className="recent-list" style={{ marginTop: '1rem' }}>
                    {stats.countryStats.map(s => (
                        <li key={s._id} className="recent-item"><span>{s._id}</span> <span className="item-clicks">{s.count}</span></li>
                    ))}
                </ul>
            </div>
        </div>
        </div>
    );
};
export default Admin;
