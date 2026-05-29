import imagekit from "../config/imagekit.js";
import User from "../model/user.model.js";
import Audio from "../model/audio.model.js";

const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json(
          {
            success: false,
            message: "No file uploaded, please upload an audio file in mp3, wav, mpeg, or m4a format",
          }
        );
    }

    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json(
          {
            success: false,
            message: "Unauthorized: user id not found in token",
          }
        );
    }

    const user = await User.findById(userId).select("email");

    if (!user) {
      return res
        .status(404)
        .json(
          {
            success: false,
            message: "User not found",
          }
        );
    }

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `${Date.now()}-${req.file.originalname}`,
      folder: "/speech-to-text-audios",
    });

    const savedAudio = await Audio.create({
      email: user.email,
      imagekitUrl: result.url,
    });

    res.status(200).json({
      success: true,
      message: "Audio uploaded",
      url: result.url,
      audioId: savedAudio._id,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(
        {
          success: false,
          message: "Upload failed for audio file - " + error.message
        }
      );
  }
};

export { uploadAudio };

