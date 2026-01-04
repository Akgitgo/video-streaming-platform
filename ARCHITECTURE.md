# Architecture & Design Overview

## Architecture Overview
StreamFlow follows a modular **MERN** (MongoDB, Express, React, Node) architecture with distinct separation of concerns.

### Backend (Node.js/Express)
- **Controllers**: Handle HTTP request/response logic.
- **Models**: Mongoose schemas for Users and Videos.
- **Middleware**: Authentication (JWT) and RBAC (Role-Based Access Control).
- **Services**: Heavy lifting for video processing (FFmpeg thumbnailing and mock sensitivity analysis).
- **Socket.io**: Real-time bidirectional communication for processing updates.

### Frontend (React/Vite)
- **Context API**: Global state management for Authentication and Sockets.
- **Component-based UI**: Reusable components for layout, video cards, and players.
- **Lucide Icons**: Modern, lightweight iconography.

## Design Decisions
1. **Multi-Tenancy**: Implemented data isolation at the controller level. Users only see their own videos via the regular `GET /api/videos` route unless they have the `Admin` role.
2. **RBAC**: Three distinct roles implemented:
   - **Viewer**: Read-only access.
   - **Editor**: Can upload and manage their own content.
   - **Admin**: Full system control.
3. **Sensitivity Analysis Simulation**: To demonstrate the processing pipeline, a mock service handles validation and content screening, emitting real-time progress to the frontend via WebSockets.
4. **Streaming**: Uses native HTTP Range requests for efficient playback, allowing seeking and partial loading of large files.
5. **Security**: Helmet is used for header security, with cross-origin resource sharing configured to allow internal media serving.

## Assumptions
- FFmpeg is installed at the path specified in `src/services/videoProcessor.js`.
- Local storage is used for simplicity; production would likely use AWS S3 or similar.
- Sensitivity analysis is a deterministic background process triggered immediately after upload.
