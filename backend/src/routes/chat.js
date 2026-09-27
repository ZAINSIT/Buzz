const express = require("express");
const pool = require("../db/index");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/:matchId/messages", auth, async (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.id;

  try {
    const match = await pool.query(
      "SELECT * FROM matches WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2) AND is_active = true",
      [matchId, userId]
    );

    if (match.rows.length === 0) {
      return res.status(403).json({ error: "Match not found" });
    }

    const messages = await pool.query(
      "SELECT * FROM messages WHERE match_id = $1 ORDER BY sent_at ASC",
      [matchId]
    );

    res.json({ messages: messages.rows });

  } catch (err) {
    console.error("Get messages error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/matches", auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const matches = await pool.query(
      `SELECT m.id, m.matched_at,
        CASE WHEN m.user_a_id = $1 THEN u2.name ELSE u1.name END as matched_name,
        CASE WHEN m.user_a_id = $1 THEN u2.id ELSE u1.id END as matched_user_id
       FROM matches m
       JOIN users u1 ON m.user_a_id = u1.id
       JOIN users u2 ON m.user_b_id = u2.id
       WHERE (m.user_a_id = $1 OR m.user_b_id = $1) AND m.is_active = true
       ORDER BY m.matched_at DESC`,
      [userId]
    );

    res.json({ matches: matches.rows });

  } catch (err) {
    console.error("Get matches error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/matches/:matchId", auth, async (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.id;

  try {
    await pool.query(
      "UPDATE matches SET is_active = false WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2)",
      [matchId, userId]
    );

    await pool.query(
      "DELETE FROM messages WHERE match_id = $1",
      [matchId]
    );

    res.json({ message: "Match removed" });

  } catch (err) {
    console.error("Delete match error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
