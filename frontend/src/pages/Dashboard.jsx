import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Play, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';

const Dashboard = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const socket = useSocket();

    const fetchVideos = async (searchTerm = '', filters = {}) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filters.sensitivity) params.append('sensitivity', filters.sensitivity);
            if (filters.sort) params.append('sort', filters.sort);

            const res = await api.get(`/videos?${params.toString()}`);
            setVideos(res.data);
        } catch (err) {
            console.error('Error fetching videos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        socket.on('videoProgress', (data) => {
            setVideos((prevVideos) =>
                prevVideos.map((v) =>
                    v._id === data.videoId
                        ? {
                            ...v,
                            processingStatus: data.status,
                            processingProgress: data.progress,
                            sensitivityStatus: data.sensitivity || v.sensitivityStatus
                        }
                        : v
                )
            );
        });

        return () => socket.off('videoProgress');
    }, [socket]);

    if (loading) return <div className="text-center">Loading amazing content...</div>;

    return (
        <div>
            {!user && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    marginBottom: '2rem',
                    background: 'var(--surface-dark)',
                    borderRadius: '1rem',
                    border: '1px solid var(--border-color)'
                }}>
                    <h1 className="text-xl font-bold text-gradient" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                        Welcome to StreamFlow
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                        Join our community to upload, watch, and share amazing videos.
                    </p>
                    <Link to="/register" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-block' }}>
                        Join Now
                    </Link>
                </div>
            )}

            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-xl font-bold text-gradient">Trending Now</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Watch the latest videos from our community</p>
                </div>
                {user && (user.role === 'Editor' || user.role === 'Admin') && (
                    <Link to="/upload" className="btn btn-outline">Upload Video</Link>
                )}
            </div>

            <SearchBar onSearch={fetchVideos} onFilter={fetchVideos} />

            {videos.length === 0 ? (
                <div className="text-center" style={{ padding: '4rem' }}>
                    <h3>No videos found</h3>
                    <p>Be the first to upload something!</p>
                </div>
            ) : (
                <div className="video-grid">
                    {videos.map((video) => (
                        <div key={video._id} className="video-card" style={{ position: 'relative' }}>
                            <Link to={`/video/${video._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="thumbnail-container">
                                    {video.thumbnailPath ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${video.thumbnailPath.replace(/\\/g, '/')}`}
                                            alt={video.title}
                                            className="thumbnail-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="thumbnail-placeholder" style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(45deg, #1e293b, #0f172a)',
                                        display: video.thumbnailPath ? 'none' : 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0
                                    }}>
                                        <Play size={48} color="white" style={{ opacity: 0.5 }} />
                                    </div>

                                    {/* Status Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '2rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        backdropFilter: 'blur(8px)',
                                        background: video.sensitivityStatus === 'safe'
                                            ? 'rgba(34, 197, 94, 0.2)'
                                            : video.sensitivityStatus === 'flagged'
                                                ? 'rgba(239, 44, 44, 0.2)'
                                                : 'rgba(99, 102, 241, 0.2)',
                                        color: video.sensitivityStatus === 'safe'
                                            ? '#22c55e'
                                            : video.sensitivityStatus === 'flagged'
                                                ? '#ef4444'
                                                : '#818cf8',
                                        border: `1px solid ${video.sensitivityStatus === 'safe' ? '#22c55e44' : video.sensitivityStatus === 'flagged' ? '#ef444444' : '#818cf844'}`
                                    }}>
                                        {video.processingStatus === 'processing' ? (
                                            <><Loader2 size={12} className="animate-spin" /> {video.processingProgress}%</>
                                        ) : video.sensitivityStatus === 'safe' ? (
                                            <><ShieldCheck size={12} /> Safe</>
                                        ) : video.sensitivityStatus === 'flagged' ? (
                                            <><ShieldAlert size={12} /> Flagged</>
                                        ) : 'Pending'}
                                    </div>
                                </div>
                                <div className="video-info">
                                    <div className="video-title">{video.title}</div>
                                    <div className="video-meta">
                                        <span>{video.views} views</span>
                                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: '0.5rem' }}>
                                        by {video.uploader?.username || 'Unknown'}
                                    </div>
                                </div>
                            </Link>

                            {/* Processing Overlay Progress Bar */}
                            {video.processingStatus === 'processing' && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    height: '3px',
                                    background: 'var(--primary-color)',
                                    width: `${video.processingProgress}%`,
                                    transition: 'width 0.3s ease'
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
