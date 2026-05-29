import AudioTranscript from "../model/audioTranscript.model.js";

function buildFilename({ email, audioType, audioId }) {
  const safeEmail = (email || "user").replace(/[^a-z0-9@._-]/gi, "_");
  const safeType = audioType || "transcription";
  const safeAudioId = audioId ? String(audioId).replace(/[^a-z0-9]/gi, "") : "";
  return `transcription-${safeType}-${safeAudioId || ""}-${safeEmail}.pdf`;
}

function escapePdfText(value) {
  return String(value)
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(text, maxChars = 88) {
  const paragraphs = String(text || "").split(/\r?\n/);
  const lines = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";

    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length > maxChars) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });

    if (line) lines.push(line);
    lines.push("");
  });

  return lines.length ? lines : ["No transcription text available."];
}

function buildPdfBuffer(title, text) {
  const lines = [
    title,
    "",
    ...wrapText(text),
  ].slice(0, 42);

  const textCommands = [
    "BT",
    "/F1 18 Tf",
    "72 760 Td",
    `(${escapePdfText(lines[0])}) Tj`,
    "/F1 11 Tf",
    "0 -28 Td",
    ...lines.slice(1).flatMap((line) => [
      `(${escapePdfText(line)}) Tj`,
      "0 -16 Td",
    ]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(textCommands)} >>\nstream\n${textCommands}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

async function downloadTranscriptionById(req, res) {
  try {
    const { transcriptId } = req.params;

    if (!transcriptId) {
      return res.status(400).json({
        success: false,
        message: "transcriptId is required",
      });
    }

    const transcriptDoc = await AudioTranscript.findById(transcriptId).lean();

    if (!transcriptDoc) {
      return res.status(404).json({
        success: false,
        message: "Transcription not found",
      });
    }

    // Auth: token may not contain email, so resolve from token
    // Your auth token currently stores only { id }, not email.
    // So we must resolve email from User collection when missing.
    let email = req.user?.email;

    if (!email) {
      const { default: User } = await import("../model/user.model.js");
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: user id not found in token",
        });
      }
      const user = await User.findById(userId).select("email");
      if (!user?.email) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: user email not found",
        });
      }
      email = user.email;
    }

    if (transcriptDoc.email !== email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: transcription does not belong to you",
      });
    }


    const text = transcriptDoc.transcriptText || "";
    const filename = buildFilename({
      email,
      audioType: transcriptDoc.audioType,
      audioId: transcriptDoc.audioId,
    });
    const pdfBuffer = buildPdfBuffer("SpeakFlow Transcription", text);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to download transcription - " + error.message,
    });
  }
}

export { downloadTranscriptionById };

