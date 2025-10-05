**Live Links**

- Frontend: https://movie-booking-system-frontend-service.onrender.com/home
- Backend service 1 (user-service): https://movie-booking-system-backend-user-service.onrender.com/
- Backend service 2 (mail-service) & RabbitMQ: https://movie-booking-system-1023910036097.asia-south1.run.app/

  - Note:a)Frontend and Services might take 1-2 min to load since they are deployed in free tier 
         b)mail-service instance will be closed in 1 week


## Movie Booking System 

Microservices-based movie-booking platform with two backend services:
- user service: auth (OTP via email), user/admin profiles, movies, shows, bookings
- mail service: consumes RabbitMQ queue and sends emails for OTP, booking confirmation



### Tech stack
- Node.js, Express, TypeScript
- MongoDB (Mongoose), Redis, RabbitMQ
- Nodemailer, Cloudinary (image upload for movies)
- Next.js frontend (in `frontend/`)

---

## Getting started (local)

Prereqs
- Node.js 20+
- MongoDB
- Redis
- RabbitMQ

1) Clone and install
```bash
cd backend/user && npm install
cd backend/mail && npm install
```

2) Create .env files
- Backend user service: create `backend/user/.env` (see examples below)
- Mail service: create `backend/mail/.env`

3) Run dev
Terminal A (user service):
```bash
cd backend/user
npm run build && npm run start
# or for watch mode
npm run dev
```

Terminal B (mail service):
```bash
cd backend/mail
npm run build && npm run start
# or
npm run dev
```

Ensure MongoDB, Redis, and RabbitMQ are already running and the connection variables in `.env` match your setup.

---

## Getting started (Docker)

There are per-service Dockerfiles and docker-compose files. External infra

1) User service
```bash
cd backend/user
docker build -t movie-user-service:latest .

# Provide env via compose (recommended) or `--env-file`
docker compose up -d
```
Notes:
- Code expects `MONGODB_URL` (not `MONGO_URI`). If using the included compose file, set `MONGODB_URL` in your environment or adjust the compose file to map `MONGODB_URL` instead of `MONGO_URI`.

2) Mail service
```bash
cd ../mail
docker build -t movie-mail-service:latest .
docker compose up -d
```

Example infra containers (optional):
```bash
# MongoDB
docker run -d --name mongo -p 27017:27017 mongo:7

# Redis
docker run -d --name redis -p 6379:6379 redis:7

# RabbitMQ (with management UI)
docker run -d --name rabbit -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=user -e RABBITMQ_DEFAULT_PASS=pass rabbitmq:3-management
```

---

## .env examples

Create the following files with your values.

backend/user/.env
```env
# Service
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Datastores
MONGODB_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBIT_MQ_HOST=localhost
RABBIT_MQ_USER=user
RABBIT_MQ_PASSWORD=pass
RABBIT_MQ_VHOST=/

# Auth
JWT_SECRET=change_me

# Cloudinary (either use individual keys below OR CLOUDINARY_URL)
CLOUD_NAME=your_cloud
API_KEY=your_key
API_SECRET=your_secret
# CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

backend/mail/.env
```env
PORT=5001

# RabbitMQ
RABBIT_MQ_HOST=localhost
RABBIT_MQ_USER=user
RABBIT_MQ_PASSWORD=pass
RABBIT_MQ_VHOST=/

# Email (Gmail example)
NODEMAILER_USER=youraddress@gmail.com
NODEMAILER_PASS=your_app_password
```

---

## API reference (user service)

Base URL: `http://localhost:5000/api/v1`

Auth
- POST `/auth/login` – request OTP to email. body: `{ email }`
- POST `/auth/user/verify` – verify OTP for user login/signup. body: `{ email, otp }` → sets `jwt` cookie
- POST `/auth/admin/verify` – verify OTP for admin login/signup. body: `{ email, otp }` → sets `jwt` cookie
- POST `/auth/logout` – clears `jwt` cookie

User
- GET `/user/self` – get profile (cookie auth)
- POST `/user/self` – update username. body: `{ username }` (cookie auth)

Admin
- GET `/admin/self` – get admin profile (cookie auth)
- POST `/admin/self` – update admin username. body: `{ username }` (cookie auth)
- GET `/admin/theater` – list theaters for admin (cookie auth)
- POST `/admin/theater` – create theater. body: `{ theaterName, location }` (cookie auth)
- POST `/admin/theater/:theaterId/screen` – add screen to theater (cookie auth)
- GET `/admin/theater/:theaterId/screen` – list screens for theater (cookie auth)
- POST `/admin/screen/:screenId/show` – add show. body: `{ movieId, time, duration }` (cookie auth)
- GET `/admin/screen/:screenId/show` – list shows for a screen (cookie auth)
- POST `/admin/movie` – add movie with image upload (multipart/form-data field `image`) and fields `{ title, duration, genre, language, releaseDate }` (cookie auth)

Booking
- GET `/booking/movie` – list all movies
- GET `/booking/:movieId/shows?date=YYYY-MM-DD` – list shows for a movie on a date
- GET `/booking/show/:showId/seats` – get available seats
- PATCH `/booking/show/:showId/book` – book seats. body: `{ seats: [{row, col}, ...] }` (cookie auth)
- GET `/booking/self` – list bookings for current user (cookie auth)

Cookie auth
- Successful verify routes set a `jwt` httpOnly cookie for subsequent requests


## Notes
- Ensure RabbitMQ credentials match both services.
- Mail service reads queue `send-mail` and sends via Gmail SMTP; enable App Passwords.
- If running behind a different frontend origin, update `FRONTEND_URL` in `backend/user/.env`.


