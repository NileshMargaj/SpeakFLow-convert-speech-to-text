import multer from "multer";

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err?.message?.includes("audio files allowed")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

export default handleMulterError;
