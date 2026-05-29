import mongoose from "mongoose";

const audioTranscriptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },

    // link back to either Audio (uploaded) or RecordedAudio (recorded)
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

    transcriptText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AudioTranscript = mongoose.model(
  "AudioTranscript",
  audioTranscriptSchema
);

export default AudioTranscript;

