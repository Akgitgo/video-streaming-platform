import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Editor'); // Default to Editor for upload capability
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password, role);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="form-container">
            <h2 className="text-xl font-bold mb-4 text-center text-gradient">Create Account</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="6"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Account Type</label>
                    <select
                        className="form-input"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ cursor: 'pointer' }}
                    >
                        <option value="Viewer">Viewer (Read-only)</option>
                        <option value="Editor">Editor (Upload & Manage)</option>
                        <option value="Admin">Admin (Full Control)</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Sign Up
                </button>
            </form>
            <p className="text-center" style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Sign in</Link>
            </p>
        </div>
    );
};

export default Register;
