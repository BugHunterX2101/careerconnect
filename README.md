# CareerConnect - Job Portal Backend

A comprehensive job portal backend built with Node.js, Express, and MongoDB.

## Features

- User Authentication (Job Seekers & Employers)
- Job Posting & Management
- Skill Assessment Quizzes
- Profile Management
- Advanced Job Search
- Application Tracking

## Database Models

### User Model
- Authentication & Profile Management
- Role-based Access (Job Seeker/Employer)
- Skills & Experience Tracking
- Education & Work History

### Job Model
- Job Listings
- Application Management
- Search Indexing
- Status Tracking

### Quiz Model
- Skill Assessments
- Performance Tracking
- Difficulty Levels
- Success Rate Calculation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create .env file:
```env
MONGODB_URI=your_mongodb_uri
PORT=3000
JWT_SECRET=your_jwt_secret
```

3. Run the server:
```bash
# Development
npm run dev

# Production
npm run prod
```

## API Endpoints

### Authentication
- POST /api/register - User registration
- POST /api/login - User login

### Jobs
- POST /jobs/create - Create job listing
- GET /jobs/search - Search jobs
- GET /jobs/recommendations - Get job recommendations

### Quizzes
- GET /quiz/random - Get random quiz
- POST /quiz/submit - Submit quiz answer

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Vercel Deployment 