import Audio from "../model/audio.model.js";
import RecordedAudio from "../model/recordedAudio.model.js";

function getAudioNameFromImagekitUrl(imagekitUrl) {
  try {
    if (!imagekitUrl || typeof imagekitUrl !== "string") return null;
    const pathPart = imagekitUrl.split("?")[0];
    const last = pathPart.split("/").filter(Boolean).pop();
    return last || null;
  } catch {
    return null;
  }
}

function resolveEmailFromToken(req) {
  // Your auth token currently stores only { id }, not email.
  // Most controllers in this repo resolve email when needed.
  return (async () => {
    let email = req.user?.email;
    if (email) return email;

    const userId = req.user?.id;
    if (!userId) return null;

    const { default: User } = await import("../model/user.model.js");
    const user = await User.findById(userId).select("email");
    return user?.email || null;
  })();
}

async function listSavedFiles(req, res) {
  try {
    const email = await resolveEmailFromToken(req);
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user email not found in token",
      });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      50
    );
    const skip = (page - 1) * limit;

    // Combine both uploaded and recorded audios, then sort by createdAt desc.
    // We fetch a bit more than needed to safely merge without DB-level union.
    const fetchCount = skip + limit;

    const [uploadedDocs, recordedDocs] = await Promise.all([
      Audio.find({ email })
        .sort({ createdAt: -1 })
        .skip(0)
        .limit(fetchCount)
        .lean(),
      RecordedAudio.find({ email })
        .sort({ createdAt: -1 })
        .skip(0)
        .limit(fetchCount)
        .lean(),
    ]);

    const uploadedItems = uploadedDocs.map((d) => ({
      audioId: d._id,
      audioType: "uploaded",
      audioName: getAudioNameFromImagekitUrl(d.imagekitUrl) || "uploaded-audio",
      imagekitUrl: d.imagekitUrl,
      createdAt: d.createdAt,
    }));

    const recordedItems = recordedDocs.map((d) => ({
      audioId: d._id,
      audioType: "recorded",
      audioName: getAudioNameFromImagekitUrl(d.imagekitUrl) || "recorded-audio",
      imagekitUrl: d.imagekitUrl,
      createdAt: d.createdAt,
    }));

    const combined = [...uploadedItems, ...recordedItems]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const paged = combined.slice(skip, skip + limit);

    const totalCount =
      (await Audio.countDocuments({ email })) +
      (await RecordedAudio.countDocuments({ email }));

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      files: paged,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved audio files - " + error.message,
    });
  }
}

export { listSavedFiles };

