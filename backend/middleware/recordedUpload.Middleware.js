import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(mp3|wav|mpeg|mpga|m4a|mp4|webm|ogg|oga|aac|flac)$/i;
  const allowedMimeTypes = /^audio\/(mpeg|mp3|wav|wave|x-wav|mp4|m4a|webm|ogg|aac|flac)$/i;

  const extname = allowedExtensions.test(path.extname(file.originalname));
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname || mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only recording audio files allowed (mp3/wav/mpeg/m4a/mp4/webm/ogg/aac/flac)"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

export default upload;

