const express = require("express");
const multer = require("multer");
const Fuse = require("fuse.js");
const fs = require("fs");
const path = require("path");
const pool = require("../db/index");
const auth = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const COLLEGES = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../data/india_colleges.json"), "utf8")
);

const fuse = new Fuse(COLLEGES, {
  keys: [
    { name: "name", weight: 0.7 },
    { name: "abbreviation", weight: 0.2 },
    { name: "state", weight: 0.1 }
  ],
  threshold: 0.4,
  distance: 200,
  includeScore: true,
  ignoreLocation: true
});

function matchCollege(extractedText) {
  const words = extractedText.split("\n").filter(line => line.trim().length > 3);
  let bestMatch = null;
  let highestScore = 0;

  for (const line of words) {
    const results = fuse.search(line);
    if (results.length > 0) {
      const matchScore = 1 - results[0].score;
      if (matchScore > highestScore) {
        highestScore = matchScore;
        bestMatch = results[0].item;
      }
    }
  }

  return { college: bestMatch, confidence: highestScore };
}

const GCP_CONFIGURED = process.env.GCP_PROJECT && process.env.DOCAI_PROCESSOR_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS;

router.post("/submit", auth, upload.single("idPhoto"), async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ error: "ID photo is required" });
  }

  try {
    await pool.query(
      `INSERT INTO id_verifications (user_id, id_image_url, status)
       VALUES ($1, $2, 'pending')`,
      [userId, "uploaded"]
    );

    if (!GCP_CONFIGURED) {
      await pool.query(
        `UPDATE id_verifications SET status = 'manual_review' WHERE user_id = $1`,
        [userId]
      );
      return res.json({
        status: "manual_review",
        message: "Your ID has been submitted for manual review. We will verify it shortly."
      });
    }

    const { DocumentProcessorServiceClient } = require("@google-cloud/documentai").v1;
    const client = new DocumentProcessorServiceClient();
    const processorName = `projects/${process.env.GCP_PROJECT}/locations/us/processors/${process.env.DOCAI_PROCESSOR_ID}`;

    const [result] = await client.processDocument({
      name: processorName,
      rawDocument: {
        content: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype
      }
    });

    const extractedText = result.document.text;
    const { college, confidence } = matchCollege(extractedText);
    const AUTO_APPROVE_THRESHOLD = 0.75;

    if (confidence >= AUTO_APPROVE_THRESHOLD && college) {
      await pool.query(
        `UPDATE id_verifications SET status = 'approved', extracted_college = $1, verified_at = NOW() WHERE user_id = $2`,
        [college.name, userId]
      );
      await pool.query(
        `UPDATE users SET is_verified = true, college_name = $1 WHERE id = $2`,
        [college.name, userId]
      );
      return res.json({
        status: "approved",
        college: college.name,
        message: "Your college ID has been verified successfully!"
      });
    } else {
      await pool.query(
        `UPDATE id_verifications SET status = 'manual_review', extracted_college = $1 WHERE user_id = $2`,
        [college?.name ?? "unknown", userId]
      );
      return res.json({
        status: "manual_review",
        message: "Your ID has been submitted for manual review. We will verify it shortly."
      });
    }

  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/status", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT status, extracted_college, verified_at, created_at
       FROM id_verifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ status: "not_submitted" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Status error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
