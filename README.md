# Strangers — Full-Stack Social Media Platform

A feature-rich social networking web application built with **Node.js, Express, MongoDB**, and **Socket.IO**. Users can sign up, post, comment, like, send friend requests, chat in real time, and reset passwords via email — all backed by a versioned REST API and a background job pipeline.

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io&logoColor=white)
![Passport](https://img.shields.io/badge/Auth-Passport.js-34E27A?logo=passport&logoColor=white)
![EJS](https://img.shields.io/badge/View-EJS-B4CA65)
![Sass](https://img.shields.io/badge/Styling-Sass-CC6699?logo=sass&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-yellow)

---

## Overview

**Strangers** (internal package name: `codeial`) is a complete social media platform built from scratch with a server-rendered MVC architecture. It combines a traditional Express + EJS app with modern features — real-time chat over WebSockets, OAuth login, JWT-secured APIs, image uploads, transactional email, and a Kue-based background worker.

The codebase is intentionally modular and is a great reference for learning end-to-end Node.js backend engineering.

---

## Features

### Authentication & Identity
- **Local sign-up & sign-in** with `passport-local` (sessions stored in MongoDB via `connect-mongo`).
- **Google OAuth 2.0** login (`passport-google-oauth`).
- **JWT-secured REST API** (`passport-jwt`) for stateless mobile/API clients.
- **Password reset via email** — token-based flow with expiring `ResetPasswordToken` documents and Nodemailer delivery.

### Social Features
- **Posts** — create, view in a global feed, delete your own.
- **Comments** — nested under each post with author attribution.
- **Likes** — polymorphic likes on both posts and comments (toggle on/off).
- **Friendships** — send/cancel friend requests with a single toggle endpoint; reciprocal friendship list stored on each user.
- **User profiles** — view any user, upload a profile avatar (multer disk storage), edit your own details.

### Real-Time Chat
- **Socket.IO chat server** running on a separate port (`5000`) alongside the Express app on `8000`.
- **Chatrooms** — clients join a room via the `join_room` event; messages broadcast through `send_message` / `receive_message`.
- Each conversation is persisted as `Message` documents tagged with a `chatroom_id` so history can be queried later.

### Versioned REST API
- **`/api/v1`** and **`/api/v2`** namespaces for backward-compatible API evolution.
- Endpoints for fetching posts and authenticating users with JWT, returning JSON.

### Background Jobs & Email
- **Kue + Redis** job queue (`config/kue.js`) with a dedicated **worker** (`workers/comment_email_worker.js`) that drains the `emails` queue.
- **Nodemailer** templates for comment notifications and password reset links, rendered with EJS.
- **Kue dashboard** available via `kue-dashboard-express` for inspecting jobs.

### Assets & Production Pipeline
- **SCSS** compiled on-the-fly in development via `node-sass-middleware`.
- **Gulp** production pipeline: SCSS → CSS minification (`gulp-cssnano`), JS uglification (`gulp-uglify-es`), image optimization (`gulp-imagemin`), and asset fingerprinting (`gulp-rev`).
- **Rotating production logs** via `morgan` + `rotating-file-stream` writing to `production_logs/access.log` daily.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          BROWSER / CLIENT                          │
│   EJS pages · Socket.IO client (port 5000) · API consumer (JWT)    │
└────────────────────────┬───────────────────────────────────────────┘
                         │
        ┌────────────────┴─────────────────┐
        ▼                                  ▼
┌─────────────────────┐         ┌─────────────────────────┐
│  Express App :8000  │         │  Socket.IO Server :5000 │
│  EJS · Passport     │         │  Chatrooms · Messages   │
└────────┬────────────┘         └─────────────┬───────────┘
         │                                    │
         │           ┌────────────────────────┘
         ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB (Mongoose)                        │
│  User · Post · Comment · Like · Friendship · Message · Token    │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│            Kue (Redis-backed) Job Queue → Workers               │
│   emails queue  ──▶  Nodemailer  ──▶  Gmail SMTP                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

| Model                  | Purpose                                                   |
|------------------------|-----------------------------------------------------------|
| `User`                 | Profile, password, avatar, friendships, posts             |
| `Post`                 | Content, author, comment refs, like refs                  |
| `Comment`              | Body, author, parent post, likes                          |
| `Like`                 | Polymorphic like — `likeable` + `onModel` (Post/Comment)  |
| `Friendship`           | `from_user` ↔ `to_user` connection                        |
| `Message`              | Persisted chat message with `chatroom_id`, from/to users  |
| `ResetPasswordToken`   | Email-reset flow with expiring access token               |

---

## Tech Stack

| Layer        | Library                                                                 |
|--------------|--------------------------------------------------------------------------|
| Runtime      | Node.js (CommonJS)                                                       |
| Framework    | Express 4                                                                |
| Database     | MongoDB via Mongoose 8                                                   |
| Views        | EJS + `express-ejs-layouts`                                              |
| Styling      | Sass (`node-sass-middleware`, `gulp-sass`)                               |
| Sessions     | `express-session` + `connect-mongo`                                      |
| Auth         | Passport (local · JWT · Google OAuth 2.0)                                |
| Real-time    | Socket.IO 4                                                              |
| File Uploads | Multer (disk storage)                                                    |
| Email        | Nodemailer (Gmail SMTP)                                                  |
| Jobs         | Kue (Redis) + `kue-dashboard-express`                                    |
| Build        | Gulp 4 (cssnano, uglify-es, imagemin, rev)                               |
| Logging      | Morgan + `rotating-file-stream`                                          |
| Flash        | `connect-flash`                                                          |

---

## Project Structure

```
Strangers/
├── index.js                       # App entry — wires Express, Passport, sessions, Socket.IO server
├── package.json
├── config/
│   ├── environment.js             # Per-env settings (development / production)
│   ├── mongoose.js                # MongoDB connection
│   ├── passport-local-strategy.js
│   ├── passport-jwt-strategy.js
│   ├── passport-googlr-oauth2-strategy.js
│   ├── chat_sockets.js            # Socket.IO room + message handlers
│   ├── kue.js                     # Redis-backed Kue queue setup
│   ├── nodemailer.js              # SMTP transport + EJS template renderer
│   ├── middleware.js              # Custom flash middleware
│   └── view-helpers.js            # `asset_path` helper for EJS
├── controllers/
│   ├── home_controller.js
│   ├── users_controller.js        # Sign-up, sign-in, OAuth, profile, password reset
│   ├── posts_controller.js
│   ├── comments_controller.js
│   ├── likes_controller.js
│   ├── friendship_controller.js
│   └── api/                       # API controllers per version
├── models/
│   ├── user.js                    # Includes multer avatar storage helper
│   ├── post.js, comment.js, like.js
│   ├── friendship.js, message.js
│   └── reset_password_tokens.js
├── routes/
│   ├── index.js                   # Top-level mount
│   ├── users.js, posts.js, comments.js, likes.js
│   └── api/
│       ├── v1/ (index, users, posts)
│       └── v2/ (index, posts)
├── views/                         # EJS templates incl. _chat_box, _post, _comment partials
├── mailers/                       # Email composers
├── workers/
│   └── comment_email_worker.js    # Drains the Kue `emails` queue
├── assets/                        # SCSS + JS sources
├── public/                        # Compiled, fingerprinted production assets
├── uploads/users/avatars/         # Multer destination for profile pictures
├── production_logs/               # Rotated access.log files
└── gulpfile.mjs                   # Asset build pipeline
```

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **MongoDB** running locally (default: `mongodb://localhost:27017`)
- **Redis** running locally (for the Kue job queue)
- (Optional) A Gmail account with an **app password** for outbound email
- (Optional) Google OAuth 2.0 credentials for social login

### 1. Clone & install

```bash
git clone https://github.com/devthedevil/Strangers.git
cd Strangers
npm install
```

### 2. Configure environment

Open `config/environment.js` and replace the development values with your own:

```js
const development = {
  name: 'development',
  asset_path: './assets',
  session_cookie_key: 'YOUR_RANDOM_SECRET',
  db: 'codeial_development',
  smtp: {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'YOUR_GMAIL_ADDRESS',
      pass: 'YOUR_GMAIL_APP_PASSWORD'
    }
  },
  google_client_id: 'YOUR_GOOGLE_CLIENT_ID',
  google_client_secret: 'YOUR_GOOGLE_CLIENT_SECRET',
  google_call_back_url: 'http://localhost:8000/users/auth/google/callback',
  jwt_secretOrKey: 'YOUR_JWT_SECRET',
  ...
};
```

> **Security note:** never commit real secrets to a public repo. Prefer loading them from environment variables or a `.env` file that is `.gitignore`'d.

### 3. Start dependencies

```bash
# In one terminal — MongoDB
mongod

# In another — Redis (required for the email worker)
redis-server
```

### 4. Run the app

```bash
# Dev mode (auto-reload via nodemon)
npm start
# → Express on :8000, Socket.IO on :5000

# Production mode
npm run prod_start
```

### 5. (Optional) Start the email worker

In a separate terminal:

```bash
node workers/comment_email_worker.js
```

### 6. (Optional) Build production assets

```bash
npx gulp
# Compiles SCSS, minifies CSS/JS, optimizes images, fingerprints filenames
```

Open [http://localhost:8000](http://localhost:8000) and start posting.

---

## Key Routes

| Method | Path                                  | Description                                |
|--------|---------------------------------------|--------------------------------------------|
| GET    | `/`                                   | Home feed                                  |
| GET    | `/users/sign-up`                      | Sign-up page                               |
| POST   | `/users/create`                       | Create new user                            |
| GET    | `/users/sign-in`                      | Sign-in page                               |
| POST   | `/users/create-session`               | Create session (local strategy)            |
| GET    | `/users/sign-out`                     | Destroy session                            |
| GET    | `/users/auth/google`                  | Begin Google OAuth flow                    |
| GET    | `/users/auth/google/callback`         | OAuth callback                             |
| GET    | `/users/profile/:id`                  | View profile                               |
| POST   | `/users/update/:id`                   | Update profile (with avatar upload)        |
| GET    | `/users/profile/:id/toggle_friend`    | Toggle friendship with a user              |
| GET    | `/users/provide_email`                | Begin password-reset flow                  |
| POST   | `/users/reset_password/:accessToken`  | Complete password reset                    |
| POST   | `/posts/create`                       | Create a post                              |
| GET    | `/posts/destroy/:id`                  | Delete a post                              |
| POST   | `/comments/create`                    | Add a comment                              |
| GET    | `/likes/toggle`                       | Toggle like on post or comment             |
| ALL    | `/api/v1/*` · `/api/v2/*`             | Versioned JSON API (JWT-protected)         |

---

## Socket.IO Events

| Event             | Direction        | Payload                              |
|-------------------|------------------|--------------------------------------|
| `join_room`       | Client → Server  | `{ chatroom, user_email }`           |
| `user_joined`     | Server → Room    | Echoed `{ chatroom, user_email }`    |
| `send_message`    | Client → Server  | `{ chatroom, message, user_email }`  |
| `receive_message` | Server → Room    | Same payload broadcast to room       |
| `disconnect`      | —                | Default Socket.IO cleanup            |

---

## Ideas for Extension

- Add **post sharing** and **hashtag indexing**.
- Persist chat history to `Message` documents on every `send_message` event (currently only broadcast).
- Replace polled likes/comments with **live socket updates**.
- Containerize with **Docker Compose** (Node + MongoDB + Redis in one `docker-compose up`).
- Add **rate limiting** (`express-rate-limit`) and CSRF protection.
- Migrate background jobs from Kue to **BullMQ** (Kue is unmaintained).
- Build a **React or React Native** client against the existing `/api/v2` endpoints.

---

## Credits

Built by **Dev Kumar** as a comprehensive backend learning project covering authentication, real-time messaging, background processing, and asset pipelines.

## License

ISC — see `package.json`.
