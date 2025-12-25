# Complete Setup Guide for Aivalytics Skill Builder

This guide will walk you through setting up the Aivalytics Skill Builder application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**

## Step 1: Clone and Install

```bash
# Navigate to the project directory
cd test-example

# Install dependencies
npm install
```

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. Install PostgreSQL if you haven't already
2. Create a new database:

```sql
CREATE DATABASE aivalytics;
```

3. Note your database credentials (username, password, host, port)

### Option B: Using Docker

```bash
docker run --name aivalytics-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=aivalytics \
  -p 5432:5432 \
  -d postgres:14
```

### Option C: Cloud Database (Recommended for Production)

You can use services like:
- **Supabase** (Free tier available)
- **Railway** (Free tier available)
- **Neon** (Free tier available)
- **AWS RDS**
- **Google Cloud SQL**

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/aivalytics"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Google Gemini AI (Optional but recommended)
GEMINI_API_KEY="your-gemini-api-key"
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET`.

### Get Gemini API Key (Optional)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

**Note:** The app will work without the Gemini API key, but AI feedback will be basic.

## Step 4: Set Up the Database

Run the following commands to set up your database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

After seeding, you'll have:
- **Admin user**: `admin@example.com` / `admin123`
- **Test user**: `user@example.com` / `user123`
- **3 sample tests** with questions

## Step 5: Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Step 6: Access the Application

### User Dashboard
1. Go to `http://localhost:3000`
2. Click "Sign Up" to create a new account, or
3. Login with: `user@example.com` / `user123`
4. Take tests, view results, and get AI feedback

### Admin Dashboard
1. Login with: `admin@example.com` / `admin123`
2. Access admin panel at `http://localhost:3000/admin`
3. Manage tests, questions, and users

## Database Management

### Prisma Studio (Visual Database Editor)

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View and edit data
- Create new records
- Change user roles
- Delete records

### Create Additional Admin Users

1. Register a new user through the signup page
2. Open Prisma Studio: `npx prisma studio`
3. Navigate to the `User` model
4. Find the user and change `role` from `"user"` to `"admin"`
5. Save changes

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Verify PostgreSQL is running:
```bash
# On Windows
Get-Service postgresql*

# On Mac/Linux
sudo service postgresql status
```

2. Check your `DATABASE_URL` in `.env`
3. Test connection:
```bash
npx prisma db pull
```

### Migration Issues

If migrations fail:

```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Then run migrations again
npx prisma migrate dev
```

### Build Errors

If you encounter TypeScript errors:

```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma Client
npx prisma generate

# Rebuild
npm run build
```

## Production Deployment

### Environment Variables for Production

Make sure to set these in your hosting platform:

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
GEMINI_API_KEY="your-api-key"
```

### Recommended Hosting Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **AWS Amplify**
- **Google Cloud Run**

### Database for Production

- **Supabase** (PostgreSQL with free tier)
- **Neon** (Serverless PostgreSQL)
- **Railway** (PostgreSQL with free tier)
- **AWS RDS**

## API Endpoints

The application provides the following API endpoints:

### Authentication
- `POST /api/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Tests
- `GET /api/tests` - Get all tests
- `GET /api/tests?id={testId}` - Get specific test
- `POST /api/tests` - Create test (Admin only)
- `DELETE /api/tests?id={testId}` - Delete test (Admin only)
- `POST /api/tests/submit` - Submit test answers

### Results
- `GET /api/results` - Get user's results
- `GET /api/results?id={resultId}` - Get specific result

### Users
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users` - Update user role (Admin only)
- `DELETE /api/users?id={userId}` - Delete user (Admin only)

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile

### Questions
- `GET /api/questions` - Get questions (Admin only)
- `POST /api/questions` - Create question (Admin only)

## Features Overview

### For Users
- ✅ Register and login
- ✅ Take aptitude tests
- ✅ View test results with scores
- ✅ Get AI-powered personalized feedback
- ✅ Track performance over time
- ✅ Update profile information

### For Admins
- ✅ Create and manage tests
- ✅ Add/edit/delete questions
- ✅ View all users
- ✅ Manage user roles
- ✅ View platform analytics
- ✅ Monitor user activity

## Next Steps

1. Customize the UI/UX to match your brand
2. Add more test categories
3. Implement advanced analytics
4. Add email notifications
5. Integrate payment system (if needed)
6. Add more question types
7. Implement timed tests
8. Add leaderboards

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments
3. Check Prisma documentation: https://www.prisma.io/docs
4. Check Next.js documentation: https://nextjs.org/docs

## License

This project is for educational purposes.
