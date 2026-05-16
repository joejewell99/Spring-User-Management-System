# UserManagementCrudApp

Beginner full-stack user management CRUD application built with React, Spring Boot, Spring Security, JWT, Spring Data JPA, PostgreSQL, and Docker.

This project is designed as a learning and portfolio project to demonstrate how a modern full-stack web app is structured from frontend to backend to database.

## Features

- Register and login users
- JWT-based authentication
- BCrypt password hashing
- Create, read, update, and delete users
- Role field with `USER` and `ADMIN`
- Admin-protected user management endpoints
- React + Vite frontend
- Spring Boot REST API
- PostgreSQL database running through Docker Compose
- Layered backend structure:

```text
Controller -> Service -> Repository -> PostgreSQL
```

## Tech Stack

### Frontend

- React
- Vite
- Fetch API
- CSS

### Backend

- Java 21+
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA
- JWT
- Maven

### Database / Infrastructure

- PostgreSQL
- Docker Compose

## Project Structure

```text
UserManagementCrudApp/
  backend/
    src/main/java/com/example/usermanagement/
      auth/        Register and login endpoints
      security/    JWT and Spring Security configuration
      user/        User entity, DTOs, controller, service, repository
    src/main/resources/application.yml
    pom.xml

  frontend/
    src/
      App.jsx
      api.js
      styles.css
    package.json

  docker-compose.yml
  README.md
```

## How It Works

The frontend sends HTTP requests to the Spring Boot backend.

```text
React frontend
  -> Spring Boot REST API
  -> UserService
  -> UserRepository
  -> PostgreSQL database
```

When a user logs in, the backend checks their email and password. If the credentials are valid, the backend returns a JWT token. The frontend stores that token in `localStorage` and sends it with later requests using the `Authorization` header.

```http
Authorization: Bearer <jwt-token>
```

The backend reads that token, validates it, and decides whether the request is allowed.

## Running Locally

### Requirements

- Java 21+
- Maven
- Node.js 18+
- Docker Desktop

### 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

This starts PostgreSQL with:

```text
database: user_management
username: postgres
password: postgres
port: 5432
```

### 2. Start The Backend

In a new terminal:

```bash
cd backend
mvn spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

### 3. Start The Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Users

These endpoints require a valid JWT token:

```http
GET    /api/users
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

## Demo Security Note

For local learning and demo convenience, newly registered users are currently assigned the `ADMIN` role by default in `AuthController`.

This makes the CRUD dashboard easier to test while learning the stack. Before using this as a production-style app, registration should be changed so public users become `USER` by default and admin accounts are created through a safer process.

## Environment Variables

Backend defaults are configured in:

```text
backend/src/main/resources/application.yml
```

Useful variables:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
JWT_EXPIRATION_MS
CORS_ALLOWED_ORIGINS
```

Frontend API URL:

```text
VITE_API_URL
```

Defaults to:

```text
http://localhost:8080/api
```

## Resetting The Local Database

To delete all local database data and start fresh:

```bash
docker compose down -v
docker compose up -d
```

## What I Learned

This project helped me learn:

- How React talks to a backend API
- How Spring Boot controllers expose REST endpoints
- How a service layer keeps business logic out of controllers
- How Spring Data JPA maps Java objects to database tables
- How JWT authentication works
- How Spring Security protects routes
- How Docker can run a local PostgreSQL database

## Planned Improvements

- Add automated backend tests
- Add frontend form validation improvements
- Add refresh tokens
- Add proper admin invitation or seed-admin flow
- Add better API error responses
- Add pagination and search for users
- Add deployment instructions
- Add screenshots to the README
