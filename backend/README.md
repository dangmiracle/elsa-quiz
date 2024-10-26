
# Quiz Application Backend

This is the backend for a Quiz Application, built using Node.js, Express, and Prisma ORM. It includes support for PostgreSQL, Redis, RabbitMQ, and JWT-based authentication.

## Table of Contents
- [Requirements](#requirements)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Seeding](#database-seeding)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Common Issues](#common-issues)

## Requirements
- **Node.js** v14 or higher
- **npm** v6 or higher
- **Docker** (for PostgreSQL, Redis, RabbitMQ)
- **PostgreSQL**
- **Redis** and **RabbitMQ** (optional, for caching and message queuing)

## Setup
1. **Clone the Repository**
   ```bash
   git clone https://github.com/dangmiracle/quiz.git
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run PostgreSQL with Docker**
   ```bash
   docker run --name quiz-postgres -e POSTGRES_USER=quizuser -e POSTGRES_PASSWORD=quizpass -e POSTGRES_DB=quizdb -p 5432:5432 -d postgres
   ```

4. **Initialize Prisma and Migrate**
   ```bash
   npm run prisma:init
   ```

## Environment Variables
Create a `.env` file in the project root with the following:
```plaintext
DATABASE_URL="postgresql://quizuser:quizpass@localhost:5432/quizdb"
REDIS_URL="redis://localhost:6379"
RABBITMQ_URL="amqp://localhost:5672"
JWT_SECRET="your_jwt_secret_here"
PORT=3000
```

## Running the Application
- **Start the server**
  ```bash
  npm run start
  ```
- **Development Mode** (with hot reloading)
  ```bash
  npm run dev
  ```

## Database Seeding
Populate the database with initial data:
```bash
npm run seed
```

## Testing
Run tests with Jest:
```bash
npm test
```

## API Documentation
API documentation is available via Swagger at:
```
http://localhost:3000/api-docs
```

## Project Structure
```
├── controllers       # Request handlers
├── config            # Configuration files (database, redis, rabbitmq)
├── routes            # API routes
├── prisma            # Prisma schema and migrations
├── tests             # Test files
├── .env              # Environment variables
└── app.js            # Application entry point
```

## Common Issues
1. **Database Connection**: Ensure `DATABASE_URL` is correct.
2. **Prisma Errors**: Run `npx prisma generate` if the schema changes.
3. **Redis/RabbitMQ Errors**: Check Redis and RabbitMQ services if enabled.
