import mongoose from "mongoose";

// "Separate model" for transcript history.
// It reads from the same underlying collection as AudioTranscript.

const audioTranscriptionHistorySchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    audioType: {
      type: String,
      required: true,
      enum: ["uploaded", "recorded"],
    },
    audioId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    transcriptText: { type: String, required: true },
  },
  { timestamps: true }
);

// Force same collection name as AudioTranscript model.
const AudioTranscriptionHistory = mongoose.model(
  "AudioTranscriptionHistory",
  audioTranscriptionHistorySchema,
  "audiotranscripts"
);

export default AudioTranscriptionHistory;

