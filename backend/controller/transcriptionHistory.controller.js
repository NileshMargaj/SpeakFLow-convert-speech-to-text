import AudioTranscriptionHistory from "../model/audioTranscriptionHistory.model.js";
import Audio from "../model/audio.model.js";
import RecordedAudio from "../model/recordedAudio.model.js";

function getAudioNameFromImagekitUrl(imagekitUrl) {
  try {
    if (!imagekitUrl || typeof imagekitUrl !== "string") return null;
    // Last path segment before any ?query
    const pathPart = imagekitUrl.split("?")[0];
    const last = pathPart.split("/").filter(Boolean).pop();
    return last || null;
  } catch {
    return null;
  }
}

async function listTranscriptionHistory(req, res) {
  try {
    const emailFromToken = req.user?.email;
    const emailFromTokenOrId = emailFromToken;

    // Your login/register tokens currently store only { id: userId }, not email.
    // So when req.user.email is missing, fetch user by id.
    let email = emailFromTokenOrId;
    if (!email) {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: email not found in token",
        });
      }

      const user = await (await import("../model/user.model.js")).default.findById(userId).select("email");
      if (!user?.email) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: user email not found",
        });
      }
      email = user.email;
    }


    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);

    const skip = (page - 1) * limit;

    const [items, totalCount] = await Promise.all([
      AudioTranscriptionHistory.find({ email })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AudioTranscriptionHistory.countDocuments({ email }),
    ]);

    // Enrich with audio name from ImageKit URL
    const uploadedIds = items
      .filter((x) => x.audioType === "uploaded")
      .map((x) => x.audioId);
    const recordedIds = items
      .filter((x) => x.audioType === "recorded")
      .map((x) => x.audioId);

    const [uploadedDocs, recordedDocs] = await Promise.all([
      uploadedIds.length
        ? Audio.find({ _id: { $in: uploadedIds } })
            .select("imagekitUrl")
            .lean()
        : Promise.resolve([]),
      recordedIds.length
        ? RecordedAudio.find({ _id: { $in: recordedIds } })
            .select("imagekitUrl")
            .lean()
        : Promise.resolve([]),
    ]);

    const uploadedMap = new Map(
      uploadedDocs.map((d) => [d._id.toString(), d.imagekitUrl])
    );
    const recordedMap = new Map(
      recordedDocs.map((d) => [d._id.toString(), d.imagekitUrl])
    );

    const history = items.map((it) => {
      const idStr = it.audioId?.toString();
      const imagekitUrl =
        it.audioType === "uploaded" ? uploadedMap.get(idStr) : recordedMap.get(idStr);

      return {
        audioTranscriptId: it._id,
        audioType: it.audioType,
        audioId: it.audioId,
        audioName: getAudioNameFromImagekitUrl(imagekitUrl) || (it.audioType === "uploaded" ? "uploaded-audio" : "recorded-audio"),
        transcriptText: it.transcriptText,
        createdAt: it.createdAt,
        imagekitUrl,
      };
    });


    return res.status(200).json({
      success: true,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      history,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transcription history - " + error.message,
    });
  }
}

export { listTranscriptionHistory };

