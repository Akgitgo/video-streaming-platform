import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Video, Eye, Shield, TrendingUp, Edit2, Trash2 } from 'lucide-react';

const AdminPanel = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, videosRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/videos')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setVideos(videosRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update user role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure? This will delete the user and all their videos.')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                fetchData(); // Refresh data
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    };

    const handleSensitivityChange = async (videoId, newStatus) => {
        try {
            await api.put(`/admin/videos/${videoId}/sensitivity`, { sensitivityStatus: newStatus });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error updating sensitivity:', error);
            alert('Failed to update video sensitivity');
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            try {
                await api.delete(`/videos/${videoId}`);
                fetchData(); // Refresh data
            } catch (error) {
                console.error('Error deleting video:', error);
                alert('Failed to delete video');
            }
        }
    };

    if (loading) return <div className="text-center">Loading admin panel...</div>;

    return (
        <div>
            <h1 className="text-xl font-bold text-gradient" style={{ marginBottom: '2rem' }}>Admin Panel</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    onClick={() => setActiveTab('stats')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'stats' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'stats' ? '2px solid var(--primary-color)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'stats' ? 'bold' : 'normal'
                    }}
                >
                    Statistics
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'users' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'users' ? '2px solid var(--primary-color)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'users' ? 'bold' : 'normal'
                    }}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('videos')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'videos' ? 'var(--primary-color)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'videos' ? '2px solid var(--primary-color)' : 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'videos' ? 'bold' : 'normal'
                    }}
                >
                    Videos
                </button>
            </div>

            {/* Statistics Tab */}
            {activeTab === 'stats' && stats && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="stat-card">
                            <Users size={32} color="var(--primary-color)" />
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.totalUsers}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Total Users</p>
                        </div>
                        <div className="stat-card">
                            <Video size={32} color="var(--primary-color)" />
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.totalVideos}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Total Videos</p>
                        </div>
                        <div className="stat-card">
                            <Eye size={32} color="var(--primary-color)" />
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.totalViews}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Total Views</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div className="stat-card">
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={20} /> Videos by Status
                            </h3>
                            {stats.videosByStatus.map(item => (
                                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                    <span style={{ textTransform: 'capitalize' }}>{item._id || 'Unknown'}</span>
                                    <span style={{ fontWeight: 'bold' }}>{item.count}</span>
                                </div>
                            ))}
                        </div>
                        <div className="stat-card">
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={20} /> Users by Role
                            </h3>
                            {stats.usersByRole.map(item => (
                                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                    <span>{item._id}</span>
                                    <span style={{ fontWeight: 'bold' }}>{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Username</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Joined</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>{user.username}</td>
                                    <td style={{ padding: '1rem' }}>{user.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className="form-input"
                                            style={{ padding: '0.5rem', cursor: 'pointer' }}
                                        >
                                            <option value="Viewer">Viewer</option>
                                            <option value="Editor">Editor</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="btn btn-outline"
                                            style={{ padding: '0.5rem', borderColor: '#ef4444', color: '#ef4444' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Title</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Uploader</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Views</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Uploaded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {videos.map(video => (
                                <tr key={video._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>{video.title}</td>
                                    <td style={{ padding: '1rem' }}>{video.uploader?.username || 'Unknown'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <select
                                            value={video.sensitivityStatus}
                                            onChange={(e) => handleSensitivityChange(video._id, e.target.value)}
                                            className="form-input"
                                            style={{
                                                padding: '0.5rem',
                                                cursor: 'pointer',
                                                background: video.sensitivityStatus === 'safe' ? 'rgba(34, 197, 94, 0.2)' :
                                                    video.sensitivityStatus === 'flagged' ? 'rgba(239, 68, 68, 0.2)' :
                                                        'rgba(99, 102, 241, 0.2)',
                                                color: video.sensitivityStatus === 'safe' ? '#22c55e' :
                                                    video.sensitivityStatus === 'flagged' ? '#ef4444' :
                                                        '#6366f1',
                                                border: 'none',
                                                borderRadius: '0.5rem'
                                            }}
                                        >
                                            <option value="safe">Safe</option>
                                            <option value="pending">Pending</option>
                                            <option value="flagged">Flagged</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{video.views}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(video.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => handleDeleteVideo(video._id)}
                                            className="btn btn-outline"
                                            style={{ padding: '0.5rem', borderColor: '#ef4444', color: '#ef4444' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style jsx>{`
                .stat-card {
                    background: var(--surface-dark);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    border: 1px solid var(--border-color);
                }
            `}</style>
        </div>
    );
};

export default AdminPanel;
