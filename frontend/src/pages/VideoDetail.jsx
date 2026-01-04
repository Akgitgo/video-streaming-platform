import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

const VideoDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    // const socket = useSocket();

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await api.get(`/videos/${id}`);
                setVideo(res.data);
            } catch (err) {
                console.error('Error fetching video:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    if (loading) return <div className="text-center">Loading...</div>;
    if (!video) return <div className="text-center">Video not found</div>;

    return (
        <div className="video-player-container">
            <button
                onClick={() => navigate(-1)}
                className="btn btn-outline"
                style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}
            >
                <ArrowLeft size={20} />
                Back to Feed
            </button>

            {video.sensitivityStatus === 'flagged' && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(239, 44, 44, 0.1)',
                    border: '1px solid #ef444444',
                    borderRadius: '0.5rem',
                    color: '#ef4444',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <ShieldAlert size={20} />
                    <div>
                        <strong>Content Warning:</strong> This video has been flagged for sensitive content. Please proceed with caution.
                    </div>
                </div>
            )}

            <div className="video-wrapper">
                <video
                    controls
                    autoPlay
                    className="video-element"
                    poster={
                        video.thumbnailPath?.startsWith('http')
                            ? video.thumbnailPath
                            : video.thumbnailPath
                                ? `http://localhost:5000/${video.thumbnailPath.replace(/\\/g, '/')}`
                                : ''
                    }
                >
                    <source
                        src={
                            video.videoUrl?.startsWith('http')
                                ? video.videoUrl
                                : `/api/videos/stream/${id}`
                        }
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <h1 className="text-xl font-bold">{video.title}</h1>
                <div className="video-meta" style={{ marginTop: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                        }}>
                            {video.uploader?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: '600' }}>{video.uploader?.username}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {new Date(video.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div>
                        {video.views} views
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', lineHeight: '1.6' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Description</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {video.description || 'No description provided.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VideoDetail;
