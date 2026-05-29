import { DeepgramClient } from "@deepgram/sdk";
import dotenv from "dotenv";
dotenv.config();

const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY);

export default deepgram;
