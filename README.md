# EduShorts - Educational Short-Form Video Platform

EduShorts is a mobile-first educational platform that delivers college-level course content through engaging short-form videos (15-60 seconds), similar to TikTok/Instagram Reels, with integrated quizzes and gamification.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Docker and Docker Compose
- React Native development environment
- Git

### Environment Setup

1. **Clone and setup the project:**
   ```bash
   git clone https://github.com/Ricky-84/Edushorts-app.git
   cd Edushorts-app
   node scripts/setup-env.js
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update `.env` with your actual credentials (AWS, OpenAI, etc.)

4. **Start development services:**
   ```bash
   # Start database and Redis
   docker-compose up -d postgres redis
   
   # Start backend API
   cd backend && npm run dev
   
   # In another terminal, start React Native metro
   npm start
   
   # Initialize database
   cd backend && npm run db:push && npm run db:seed
   ```

5. **Run the mobile app:**
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   ```

## 📱 Features

- **Short-Form Video Learning**: TikTok-style vertical video feed
- **Interactive Quizzes**: Immediate knowledge testing after videos
- **Gamification**: XP, levels, streaks, achievements, leagues
- **Personalized Content**: AI-powered recommendations based on user profile
- **Social Learning**: Friends, leaderboards, study groups
- **Multi-Subject Support**: College-level courses across various disciplines

## 🏗️ Architecture

### Tech Stack
- **Mobile**: React Native with TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **File Storage**: AWS S3 + CloudFront CDN
- **AI Services**: OpenAI GPT-4, Synthesia
- **Authentication**: JWT tokens

### Project Structure
```
edushorts-app/
├── src/                    # React Native source code
│   ├── components/         # Reusable UI components
│   ├── screens/           # App screens
│   ├── navigation/        # Navigation configuration
│   ├── services/          # API and external services
│   └── utils/             # Helper functions
├── backend/               # Node.js backend
│   ├── src/               # TypeScript source code
│   ├── prisma/            # Database schema and migrations
│   └── uploads/           # Temporary file uploads
├── docs/                  # Documentation
└── scripts/               # Setup and utility scripts
```

## 🛠️ Development

### Available Scripts

**Root Project:**
- `npm start` - Start React Native metro bundler
- `npm run android` - Run Android app
- `npm run ios` - Run iOS app
- `npm test` - Run tests
- `npm run lint` - Lint code

**Backend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run backend tests
- `npm run db:push` - Push database schema
- `npm run db:seed` - Seed database with test data

**Docker:**
- `npm run docker:up` - Start all services
- `npm run docker:down` - Stop all services

### Environment Variables

Key environment variables to configure:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/edushorts_dev

# AWS Services
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=edushorts-videos

# OpenAI for content generation
OPENAI_API_KEY=your-openai-key

# Security
JWT_SECRET=your-jwt-secret
```

## 🚢 Deployment

### Development Deployment
```bash
# Start all services
docker-compose up -d

# Run database migrations
cd backend && npm run db:push
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
cd backend && npm test

# Run with coverage
npm run test:coverage

# E2E testing with Detox
npm run e2e:build
npm run e2e:test
```

## 📚 API Documentation

The backend API provides endpoints for:

- **Authentication**: User registration, login, token refresh
- **Content**: Video CRUD, quiz management, content recommendations
- **User Management**: Profile, preferences, progress tracking
- **Gamification**: XP calculation, achievements, leaderboards
- **Social**: Friends, groups, competitions

API documentation available at `/api/docs` when running locally.

## 🔐 Security

- JWT token-based authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload handling
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Metro bundler won't start**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Database connection issues**
   ```bash
   docker-compose restart postgres
   cd backend && npm run db:push
   ```

3. **Build errors**
   ```bash
   npm run clean
   npm install
   cd ios && pod install  # iOS only
   ```

### Getting Help

- Check the [Issues](https://github.com/Ricky-84/Edushorts-app/issues) page
- Review the [Documentation](./docs/)
- Contact the development team

---

**EduShorts** - Transforming education through engaging short-form video learning! 🎓📱
