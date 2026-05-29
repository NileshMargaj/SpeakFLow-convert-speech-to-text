import mongoose from "mongoose";

const recordedAudioSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    imagekitUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const RecordedAudio = mongoose.model("RecordedAudio", recordedAudioSchema);

export default RecordedAudio;

