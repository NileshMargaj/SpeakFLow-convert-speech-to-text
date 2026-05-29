import express from "express";
import dotenv from "dotenv";
dotenv.config()
import cors from 'cors'
import userRoute from "./route/user.route.js";
import uploadRoute from "./route/upload.route.js";
import recordedAudioRoute from "./route/recordedAudio.route.js";
import transcriptionRoute from "./route/transcription.route.js";
import transcriptionHistoryRoute from "./route/transcriptionHistory.route.js";
import transcriptionDownloadRoute from "./route/transcriptionDownload.route.js";
import savedFilesRoute from "./route/savedFiles.route.js";
import userProfileRoute from "./route/userProfile.route.js";
import cookieParser from "cookie-parser";



const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ].filter(Boolean),
    credentials: true,
}))

//! constum middlewares
app.use('/api/auth', userRoute)
app.use('/api/upload', uploadRoute)
app.use('/api/upload', recordedAudioRoute)
app.use('/api/transcription', transcriptionRoute)
app.use('/api/transcription', transcriptionHistoryRoute)
app.use('/api/transcription', transcriptionDownloadRoute)
app.use('/api/saved', savedFilesRoute)
app.use('/api/auth', userProfileRoute)

export default app;

