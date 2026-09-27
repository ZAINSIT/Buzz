const express = require("express");
const pool = require("../db/index");
const auth = require("../middleware/auth");

const router = express.Router();

const DAILY_LIMIT = 10;

router.post("/", auth, async (req, res) => {
  const swiperId = req.user.id;
  const { swiped_id, direction } = req.body;

  if (!swiped_id || !direction) {
    return res.status(400).json({ error: "swiped_id and direction are required" });
  }

  if (!["left", "right"].includes(direction)) {
    return res.status(400).json({ error: "direction must be left or right" });
  }

  try {
    const profile = await pool.query(
      "SELECT daily_likes_used, likes_reset_at FROM profiles WHERE user_id = $1",
      [swiperId]
    );

    let { daily_likes_used, likes_reset_at } = profile.rows[0];
    const now = new Date();
    const resetAt = new Date(likes_reset_at);
    const hoursSinceReset = (now - resetAt) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      daily_likes_used = 0;
      await pool.query(
        "UPDATE profiles SET daily_likes_used = 0, likes_reset_at = NOW() WHERE user_id = $1",
        [swiperId]
      );
    }

    if (direction === "right" && daily_likes_used >= DAILY_LIMIT) {
      return res.status(429).json({ error: "Daily like limit reached. Come back tomorrow." });
    }

    await pool.query(
      "INSERT INTO swipes (swiper_id, swiped_id, direction) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      [swiperId, swiped_id, direction]
    );

    if (direction === "right") {
      await pool.query(
        "UPDATE profiles SET daily_likes_used = daily_likes_used + 1 WHERE user_id = $1",
        [swiperId]
      );

      const mutual = await pool.query(
        "SELECT id FROM swipes WHERE swiper_id = $1 AND swiped_id = $2 AND direction = 'right'",
        [swiped_id, swiperId]
      );

      if (mutual.rows.length > 0) {
        await pool.query(
          "INSERT INTO matches (user_a_id, user_b_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [swiperId, swiped_id]
        );
        return res.json({ match: true, message: "Its a match!" });
      }
    }

    res.json({ match: false });

  } catch (err) {
    console.error("Swipe error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
