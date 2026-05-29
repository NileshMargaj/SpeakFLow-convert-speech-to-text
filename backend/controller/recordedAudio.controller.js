import imagekit from "../config/imagekit.js";
import User from "../model/user.model.js";
import RecordedAudio from "../model/recordedAudio.model.js";

const uploadRecordedAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json(
                    {
                        success: false,
                        message: "No recording uploaded, please upload a recording file",
                    }
                );
        }

        const userId = req.user?.id;
        if (!userId) {
            return res
                .status(401).
                json(
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
            folder: "/speech-to-text-recorded-audios",
        });

        const savedRecordedAudio = await RecordedAudio.create({
            email: user.email,
            imagekitUrl: result.url,
        });

        return res
            .status(200)
            .json(
                {
                    success: true,
                    message: "Recording uploaded",
                    url: result.url,
                    recordedAudioId: savedRecordedAudio._id,
                }
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                {
                    success: false,
                    message: "Upload failed for recording - " + error.message,
                }
            );
    }
};

export { uploadRecordedAudio };

