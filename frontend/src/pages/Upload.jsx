import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload as UploadIcon, FileVideo } from 'lucide-react';

const Upload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        formData.append('description', description);

        setUploading(true);

        try {
            await api.post('/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                },
            });
            navigate('/');
        } catch (err) {
            console.error('Failed to upload video:', err);
            alert('Failed to upload video');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="form-container" style={{ maxWidth: '600px' }}>
            <h2 className="text-xl font-bold mb-4 text-center text-gradient">Upload New Video</h2>

            <form onSubmit={handleSubmit}>
                <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    backgroundColor: file ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                }}
                    onClick={() => document.getElementById('video-upload').click()}
                >
                    <input
                        type="file"
                        id="video-upload"
                        accept="video/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    {file ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                            <FileVideo size={32} color="var(--primary-color)" />
                            <span style={{ fontWeight: '500' }}>{file.name}</span>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-secondary)' }}>
                            <UploadIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Click to select or drag and drop video file</p>
                            <p style={{ fontSize: '0.8rem' }}>MP4, WebM, MKV supported</p>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Give your video a catchy title"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        placeholder="What's this video about?"
                        style={{ resize: 'vertical' }}
                    />
                </div>

                {uploading && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={uploading || !file}
                >
                    {uploading ? 'Uploading...' : 'Publish Video'}
                </button>
            </form>
        </div>
    );
};

export default Upload;
