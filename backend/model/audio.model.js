import mongoose from "mongoose";

const audioSchema = new mongoose.Schema(
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

const Audio = mongoose.model("Audio", audioSchema);

export default Audio;

