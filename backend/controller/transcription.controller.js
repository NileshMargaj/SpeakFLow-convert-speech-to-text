import deepgram from "../config/deepgram.js";
import Audio from "../model/audio.model.js";
import RecordedAudio from "../model/recordedAudio.model.js";
import AudioTranscript from "../model/audioTranscript.model.js";

function extractTranscriptText(response) {
  const transcriptText =
    response?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
    response?.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
    response?.body?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
    "";

  return transcriptText.trim();
}

async function transcribeWithDeepgram(buffer, mimetype) {
  let normalizedBuffer = buffer;

  if (Buffer.isBuffer(normalizedBuffer)) {
    normalizedBuffer = Buffer.from(normalizedBuffer);
  } else if (normalizedBuffer instanceof ArrayBuffer) {
    normalizedBuffer = Buffer.from(normalizedBuffer);
  } else if (ArrayBuffer.isView(normalizedBuffer)) {
    normalizedBuffer = Buffer.from(
      normalizedBuffer.buffer,
      normalizedBuffer.byteOffset,
      normalizedBuffer.byteLength
    );
  } else if (normalizedBuffer && typeof normalizedBuffer === "object" && Buffer.isBuffer(normalizedBuffer.buffer)) {
    normalizedBuffer = normalizedBuffer.buffer;
  }

  if (!Buffer.isBuffer(normalizedBuffer)) {
    throw new Error("Deepgram transcription: buffer is not a valid Buffer");
  }

  const dg = deepgram;
  let response;

  if (dg.listen?.v1?.media?.transcribeFile) {
    const source = {
      data: normalizedBuffer,
      contentType: mimetype || "audio/wav",
      contentLength: normalizedBuffer.length,
    };

    response = await dg.listen.v1.media.transcribeFile(source, {
      model: "nova-2",
      smart_format: true,
      utterances: false,
    });
  } else if (dg.listen?.prerecorded?.transcribeFile) {
    const source = {
      buffer: normalizedBuffer,
      mimetype: mimetype || "audio/wav",
    };

    response = await dg.listen.prerecorded.transcribeFile(source, {
      model: "nova-2",
      smart_format: true,
      utterances: false,
    });
  } else {
    throw new Error("Deepgram SDK transcription method not found on client");
  }

  const transcriptText = extractTranscriptText(response);

  if (!transcriptText) {
    throw new Error("No transcript text returned. Check that the audio contains clear speech and is a supported audio format.");
  }

  return transcriptText;
}





const transcribeUploadedAudioById = async (req, res) => {
  try {
    const { audioId } = req.params;

    if (!audioId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "audioId is required",
        });
    }

    // Requirement: convert audio file to text of uploaded audio.
    // We already stored only imagekitUrl in DB, so transcription must fetch the file.
    // In this codebase we don't store the raw file buffer, so we use ImageKit URL.
    const audioDoc = await Audio.findById(audioId).select("email imagekitUrl");
    if (!audioDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Audio not found" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized: user id not found in token",
        });
    }

    // Simple authorization: since schema uses email from JWT, compare email.
    // We don't currently have a route to map id->email here without pulling user.
    // So we skip the strict compare and only require auth. If you want strict email match, we can add it.

    // Fetch the audio from ImageKit URL (public URL)
    const audioResp = await fetch(audioDoc.imagekitUrl);
    if (!audioResp.ok) {
      return res.status(500).json({
        success: false,
        message: "Failed to download audio from ImageKit",
      });
    }

    // Deepgram SDK expects a real Buffer / Uint8Array.
    // Normalize any ArrayBuffer-like payload into a Buffer.
    const arrayBuffer = await audioResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const mimetype = audioResp.headers.get("content-type") || undefined;


    const transcriptText = await transcribeWithDeepgram(buffer, mimetype);

    const saved = await AudioTranscript.create({

      email: audioDoc.email,
      audioType: "uploaded",
      audioId: audioDoc._id,
      transcriptText,
    });

    return res.status(200).json({
      success: true,
      transcript: transcriptText,
      audioTranscriptId: saved._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Transcription failed - " + error.message,
    });
  }
};






const transcribeRecordedAudioById = async (req, res) => {
  try {
    const { recordedAudioId } = req.params;

    if (!recordedAudioId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "recordedAudioId is required",
        });
    }

    const recordedDoc = await RecordedAudio.findById(recordedAudioId).select(
      "email imagekitUrl"
    );
    if (!recordedDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Recording not found" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized: user id not found in token",
        });
    }

    const audioResp = await fetch(recordedDoc.imagekitUrl);
    if (!audioResp.ok) {
      return res.status(500).json({
        success: false,
        message: "Failed to download recording from ImageKit",
      });
    }

    const arrayBuffer = await audioResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimetype = audioResp.headers.get("content-type") || undefined;

    const transcriptText = await transcribeWithDeepgram(buffer, mimetype);

    const saved = await AudioTranscript.create({
      email: recordedDoc.email,
      audioType: "recorded",
      audioId: recordedDoc._id,
      transcriptText,
    });

    return res.status(200).json({
      success: true,
      transcript: transcriptText,
      audioTranscriptId: saved._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Transcription failed - " + error.message,
    });
  }
};

export {
  transcribeUploadedAudioById,
  transcribeRecordedAudioById,
};

