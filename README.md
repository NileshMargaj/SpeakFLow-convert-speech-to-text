# SpeakFlow

SpeakFlow is a full-stack **speech-to-text** web application. Users can:
- Register/Login using JWT + OTP-based password reset
- Upload audio (mp3/wav/mpeg/m4a)
- Record/upload recorded audio
- Transcribe audio using **Deepgram**
- Download and manage transcription history
- Upload audio files are stored in **ImageKit** and metadata in **MongoDB**

---

## System Architecture

### Frontend (React + Vite)
- UI components for authentication, audio upload/recording, and transcription screens
- Calls backend APIs under `/api/*`

### Backend (Node.js + Express)
Main building blocks:
- **Auth**: JWT cookies + OTP flow for password reset
- **Upload**:
  - `multer` accepts audio uploads
  - files are uploaded to **ImageKit**
  - metadata saved in **MongoDB**
- **Transcription**:
  - fetches audio from ImageKit URL
  - transcribes via **Deepgram**
  - saves transcription history in MongoDB
- **Download**:
  - generates transcript text download (via controller)

Routes are grouped under these prefixes:
- `/api/auth` (register/login/logout/OTP reset + profile)
- `/api/upload` (upload audio + recorded audio)
- `/api/transcription` (transcribe, history, download)
- `/api/saved` (list saved files)

---

## Features

1. **Authentication**
   - Register, Login, Logout
   - Password reset via **OTP** (email delivery)
   - JWT-based session (cookie)

2. **Audio Upload & Storage**
   - Supports common audio formats
   - Stores audio in **ImageKit**
   - Stores `email + imagekitUrl` in MongoDB

3. **Recording Transcription**
   - Transcribe uploaded audio by `audioId`
   - Transcribe recorded audio by `recordedAudioId`

4. **History & Download**
   - View transcription history
   - Download transcription text by transcript id

5. **Performance/Safety**
   - Rate limiting for history endpoints
   - Protected routes using authentication middleware

---

## Tech Stack

### Frontend
- React 19
- Vite
- react-router-dom
- TailwindCSS

### Backend
- Express
- MongoDB + Mongoose
- JWT (cookie based)
- Multer (multipart uploads)
- Deepgram SDK (transcription)
- ImageKit (media storage)
- Nodemailer (OTP emails)
- Rate limiting middleware

---

## Prerequisites

- Node.js (LTS recommended)
- MongoDB (local or hosted)
- Deepgram API key
- ImageKit credentials
- Email credentials (for OTP delivery)

---

## Environment Variables

> Create `.env` files in both **backend** and **frontend**.

### Backend `.env`
Expected variables referenced by the code:
- `PORT` (optional, default: `3000`)
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL` (allowed CORS origin)

Deepgram:
- `DEEPGRAM_API_KEY`

ImageKit:
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`

Email (OTP):
- `EMAIL_USER`
- (other nodemailer SMTP settings if used in your `email.service.js`)

### Frontend `.env`
The frontend uses Vite, so environment variables should be prefixed with `VITE_`.

> If your current `frontend/.env` already works, keep it as-is. If you share it, I can document the exact keys.

---

## Local Development Setup

### 1) Backend
```bash
cd backend
npm install
npm run dev
```

Backend will start on `PORT` (default `3000`).

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will typically run at `http://localhost:5173`.

### 3) Configure CORS
Ensure `backend/.env` contains `CLIENT_URL` matching the frontend URL (ex: `http://localhost:5173`).

---

## Build & Run (Production)

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
npm run preview
```

---

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password` (send OTP email)
- `POST /api/auth/verify-otp` (validate OTP)
- `POST /api/auth/reset-password` (set new password)

> Frontend UX for password reset:
> - `ForgotPassword` page collects email
> - `VerifyOtp` page verifies OTP
> - `ResetPassword` page sets new password (includes “show password” toggle)

- `POST /api/auth/profile` (via `userProfile.route.js`)


### Upload
- `POST /api/upload/upload-audio` (multipart form-data, field: `audio`)

### Recorded Upload
- `POST /api/upload/recorded-audio` (see `recordedAudio.route.js`)

### Transcription
- `POST /api/transcription/transcribe/uploaded/:audioId`
- `POST /api/transcription/transcribe/recorded/:recordedAudioId`

### Transcription History
- `GET /api/transcription/history?page=1&limit=10`

### Transcription Download
- `GET /api/transcription/download/:transcriptId`

### Saved Files
- `GET /api/saved/list` (see `savedFiles.route.js`)

---

## Project Structure (High Level)

- `frontend/`
  - `src/components/` (UI components)
  - `src/pages/` (route-level pages)
- `backend/`
  - `controller/` (request handlers)
  - `route/` (API route mapping)
  - `middleware/` (auth, upload parsing, rate limit)
  - `model/` (MongoDB schemas)
  - `config/` (db, Deepgram, ImageKit)

---

## Notes for Deployment (Important)

- Keep API keys and secrets only in environment variables.
- Restrict CORS origins properly.
- Consider using a real rate limiter (instead of in-memory) when deploying multiple backend instances.
- Ensure ImageKit storage permissions and folder structure exist (`/speech-to-text-audios`).

---

## License

Add your license here (MIT/Apache/etc).
