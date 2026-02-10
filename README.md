# TypeRacer Pro

A production-ready typing speed test web application with real-time WPM tracking, accuracy measurement, user authentication, and a global leaderboard.

## 🚀 Features

- **Real-time Typing Test**: Live WPM and accuracy tracking
- **Guest Mode**: Take tests without registration
- **User Authentication**: Secure JWT-based auth with refresh tokens
- **Global Leaderboard**: Compete with other typists (registration required)
- **Progress Tracking**: View personal statistics and improvement over time
- **Multiple Difficulty Levels**: Easy, medium, and hard texts
- **Custom Test Durations**: 15, 30, 60, and 120-second tests
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Security Hardened**: CSRF protection, rate limiting, input sanitization
- **Docker Support**: Easy deployment with Docker Compose

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 22+ LTS
- **Framework**: Express.js 4.21.2
- **Database**: MariaDB 11.4 with mysql2 3.11.5
- **Authentication**: JWT (jose 5.9.6) with refresh tokens
- **Password Hashing**: Argon2 (argon2 0.41.1) with bcrypt fallback
- **Security**: Helmet 8.0.0, CORS, CSRF protection, rate limiting
- **Validation**: Express-validator 7.2.0 with Zod schemas
- **Logging**: Winston 3.17.0

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite 6.1.1
- **Routing**: React Router 7.1.4
- **State Management**: Zustand 5.0.2
- **Forms**: React Hook Form 7.54.2 with Zod validation
- **HTTP Client**: Axios 1.7.9
- **Notifications**: React Toastify 11.0.3
- **Icons**: Lucide React 0.469.0
- **Styling**: CSS Modules with modern design

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose V2
- **Database**: MariaDB 11.4
- **Web Server**: Nginx (Alpine)

## 📋 Tech Stack Versions

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Backend** | | |
| Node.js | 22.x.x | Runtime |
| Express | 4.21.2 | Web Framework |
| mysql2 | 3.11.5 | MariaDB Driver |
| argon2 | 0.41.1 | Password Hashing |
| jose | 5.9.6 | JWT |
| helmet | 8.0.0 | Security Headers |
| express-rate-limit | 7.4.1 | Rate Limiting |
| express-validator | 7.2.0 | Input Validation |
| csrf-csrf | 3.0.9 | CSRF Protection |
| winston | 3.17.0 | Logging |
| dotenv | 16.4.7 | Environment Variables |
| **Frontend** | | |
| React | 19.1.0 | UI Library |
| Vite | 6.1.1 | Build Tool |
| React Router | 7.1.4 | Routing |
| Zustand | 5.0.2 | State Management |
| Axios | 1.7.9 | HTTP Client |
| React Hook Form | 7.54.2 | Form Handling |
| Zod | 3.3.0 | Schema Validation |
| react-toastify | 11.0.3 | Notifications |
| **Database** | | |
| MariaDB | 11.4 | Database |
| **DevOps** | | |
| Docker Compose | V2 | Orchestration |

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ LTS
- MariaDB 11.4+ (or Docker)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd typing-speed-test
```

2. **Set up environment variables**
```bash
# Copy environment template
cp server/.env.example server/.env

# Edit the environment file with your configuration
nano server/.env
```

3. **Using Docker Compose (Recommended)**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

4. **Manual Setup**

**Backend Setup:**
```bash
cd server

# Install dependencies
npm install

# Set up database (run migrations)
mysql -u root -p < migrations/001_initial_schema.sql

# Start development server
npm run dev
```

**Frontend Setup:**
```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 📁 Project Structure

```
typing-speed-test/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/          # API layer
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS modules
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── migrations/       # Database migrations
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── app.js            # Express app
│   ├── server.js         # Server entry point
│   └── package.json
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Multi-stage Docker build
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```bash
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=typing_user
DB_PASSWORD=SuperSecure_P@ssw0rd!2024
DB_NAME=typing_test_db
DB_CONNECTION_LIMIT=10
DB_ROOT_PASSWORD=change_me_root_pw

# JWT
JWT_ACCESS_SECRET=your-64-char-random-string-for-access-token-here-change-in-production!!
JWT_REFRESH_SECRET=your-64-char-random-string-for-refresh-token-here-change-in-production!!
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Client
CLIENT_URL=http://localhost:5173

# Test Session Token
TEST_SESSION_TTL_SECONDS=600

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Argon2 (optional)
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=4
```

## 🗄 Database Schema

The application uses MariaDB with the following main tables:

- **users**: User accounts and statistics
- **guest_sessions**: Guest user sessions
- **test_texts**: Typing test text samples
- **test_sessions**: One-time test session tokens
- **test_results**: Test results and performance data
- **refresh_tokens**: JWT refresh token storage

See `server/migrations/001_initial_schema.sql` for the complete schema.

## 🔐 Security Features

- **Authentication**: JWT access tokens (15min) + refresh tokens (7 days)
- **Password Security**: Argon2id hashing with bcrypt fallback
- **CSRF Protection**: Double-submit cookie pattern
- **Rate Limiting**: Multiple tiers for different endpoints
- **Input Validation**: Comprehensive server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization and CSP headers
- **Session Security**: HttpOnly, Secure, SameSite cookies

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Logout current device
- `POST /api/auth/logout-all` - Logout all devices
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Test
- `GET /api/test/texts` - Get test text and session
- `POST /api/test/submit` - Submit test result
- `GET /api/test/history` - Get user test history
- `GET /api/test/guest-history` - Get guest test history
- `POST /api/test/guest-session` - Ensure guest session

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard (auth required)
- `GET /api/leaderboard/my-rank` - Get user rank (auth required)
- `GET /api/leaderboard/stats` - Get global statistics

## 🚀 Deployment

### Docker Deployment

1. **Build and start services:**
```bash
docker-compose up -d --build
```

2. **View logs:**
```bash
docker-compose logs -f
```

3. **Scale services:**
```bash
docker-compose up -d --scale server=3 --scale client=2
```

### Production Considerations

1. **Environment Variables**: Set production values in `.env`
2. **Database**: Use managed MariaDB service in production
3. **SSL/TLS**: Configure HTTPS with proper certificates
4. **Reverse Proxy**: Use Nginx or Cloudflare for additional security
5. **Monitoring**: Set up logging and monitoring
6. **Backups**: Regular database backups

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests (when implemented)
cd client && npm test
```

### Code Quality
```bash
# Linting
cd server && npm run lint
cd client && npm run lint

# Format code
npm run format
```

### Database Migrations
```bash
# Run migrations
mysql -u root -p < server/migrations/001_initial_schema.sql

# Create new migration
# Create SQL file in server/migrations/ directory
```

## 📊 Performance

- **Frontend**: Optimized bundle splitting and lazy loading
- **Backend**: Connection pooling and query optimization
- **Database**: Indexed columns for common queries
- **Caching**: Browser caching for static assets
- **CDN**: Ready for CDN deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- MariaDB for the reliable database
- All contributors and users of TypeRacer Pro

---

**Happy Typing! 🚀**
