import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Upload, Home, User, Film } from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="app-container">
            <nav className="navbar">
                <Link to="/" className="brand">
                    StreamFlow
                </Link>

                <div className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>
                        <Home size={20} />
                        <span>Home</span>
                    </Link>

                    {user ? (
                        <>
                            {(user?.role === 'Editor' || user?.role === 'Admin') && (
                                <>
                                    <Link to="/upload" className={`nav-link ${isActive('/upload')}`}>
                                        <Upload size={20} />
                                        <span>Upload</span>
                                    </Link>
                                    <Link to="/my-videos" className={`nav-link ${isActive('/my-videos')}`}>
                                        <Film size={20} />
                                        <span>My Videos</span>
                                    </Link>
                                </>
                            )}
                            {user?.role === 'Admin' && (
                                <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
                                    <User size={20} />
                                    <span>Admin</span>
                                </Link>
                            )}
                            <div className="nav-link" style={{ cursor: 'default' }}>
                                <User size={20} />
                                <span>{user.username || user.email}</span>
                                <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', opacity: 0.7 }}>({user.role})</span>
                            </div>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <LogOut size={16} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/register" className="btn btn-primary">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;
