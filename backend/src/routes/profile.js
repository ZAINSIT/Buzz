const express = require("express");
const pool = require("../db/index");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { college_name, bio, year_of_study, topics } = req.body;
  const userId = req.user.id;

  if (!college_name) {
    return res.status(400).json({ error: "College name is required" });
  }

  if (!topics || topics.length === 0) {
    return res.status(400).json({ error: "At least one topic is required" });
  }

  try {
    await pool.query(
      "UPDATE users SET college_name = $1 WHERE id = $2",
      [college_name, userId]
    );

    await pool.query(
      "UPDATE profiles SET bio = $1, year_of_study = $2 WHERE user_id = $3",
      [bio || null, year_of_study || null, userId]
    );

    for (const topicName of topics) {
      const topicResult = await pool.query(
        "INSERT INTO topics (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
        [topicName]
      );
      const topicId = topicResult.rows[0].id;
      await pool.query(
        "INSERT INTO user_topics (user_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [userId, topicId]
      );
    }

    res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error("Profile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await pool.query(
      "SELECT u.id, u.email, u.name, u.college_name, u.is_verified, p.bio, p.year_of_study FROM users u JOIN profiles p ON u.id = p.user_id WHERE u.id = $1",
      [userId]
    );

    const topics = await pool.query(
      "SELECT t.name FROM topics t JOIN user_topics ut ON t.id = ut.topic_id WHERE ut.user_id = $1",
      [userId]
    );

    res.json({
      ...user.rows[0],
      topics: topics.rows.map(r => r.name)
    });

  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
