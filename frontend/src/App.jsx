import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import VideoDetail from './pages/VideoDetail';
import VideoLibrary from './pages/VideoLibrary';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/video/:id" element={<VideoDetail />} />

          <Route path="/upload" element={
            <PrivateRoute>
              <Upload />
            </PrivateRoute>
          } />

          <Route path="/my-videos" element={
            <PrivateRoute>
              <VideoLibrary />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
