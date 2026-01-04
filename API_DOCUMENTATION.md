# API Documentation - StreamFlow

## Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |

## Videos
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/videos` | Get isolated video list (own content or all if Admin) | Private (protect) |
| GET | `/api/videos/:id` | Get video details by ID | Public |
| POST | `/api/videos` | Upload video (file + metadata) | Private (Editor, Admin) |
| GET | `/api/videos/stream/:id` | Stream video content (HTTP Range) | Public |
| DELETE | `/api/videos/:id` | Remove video | Private (Editor-Owner, Admin) |

## Real-Time Events (Socket.io)
The server emits events on processing:
- `videoProgress`: Emitted during sensitivity analysis stages.
  - `videoId`: ID of the video
  - `status`: 'processing', 'completed'
  - `progress`: 0-100 percentage
  - `sensitivity`: 'safe' or 'flagged' (on complete)
  - `message`: Stage message (e.g., 'Analyzing content...')
