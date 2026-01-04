import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Edit2, Trash2, ShieldCheck, ShieldAlert, Loader2, Play } from 'lucide-react';

const VideoLibrary = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const socket = useSocket();

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await api.get('/videos');
                // Backend now handles isolation, but we'll take what it gives us
                setVideos(res.data);
            } catch (err) {
                console.error('Error fetching videos:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchVideos();
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this video?')) {
            try {
                await api.delete(`/videos/${id}`);
                setVideos(videos.filter(v => v._id !== id));
            } catch (err) {
                console.error('Error deleting video:', err);
                alert('Failed to delete video');
            }
        }
    };

    if (loading) return <div className="text-center">Loading your library...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="text-xl font-bold text-gradient">My Videos</h1>
                {(user.role === 'Editor' || user.role === 'Admin') && (
                    <Link to="/upload" className="btn btn-primary">Upload New</Link>
                )}
            </div>

            {videos.length === 0 ? (
                <div className="text-center" style={{ padding: '4rem', backgroundColor: 'var(--surface-dark)', borderRadius: '1rem' }}>
                    <h3>You haven't uploaded any videos yet</h3>
                    <p style={{ margin: '1rem 0' }}>Share your creativity with the world!</p>
                    <Link to="/upload" className="btn btn-primary">Upload Your First Video</Link>
                </div>
            ) : (
                <div className="video-grid">
                    {videos.map((video) => (
                        <div key={video._id} className="video-card" style={{ position: 'relative' }}>
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
                                <Link to={`/video/${video._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="video-title">{video.title}</div>
                                </Link>
                                <div className="video-meta">
                                    <span>{video.views} views</span>
                                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}
                                        onClick={() => handleDelete(video._id)}
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>

                            {/* Progress bar overlay */}
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

export default VideoLibrary;

