const express = require("express");
const pool = require("../db/index");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.college_name,
        p.bio,
        p.year_of_study,
        array_agg(DISTINCT t.name) as topics,
        array_agg(DISTINCT ph.s3_url) as photos
       FROM users u
       JOIN profiles p ON u.id = p.user_id
       LEFT JOIN user_topics ut ON u.id = ut.user_id
       LEFT JOIN topics t ON ut.topic_id = t.id
       LEFT JOIN photos ph ON u.id = ph.user_id
       WHERE u.id != $1
         AND u.is_verified = false
         AND u.id NOT IN (
           SELECT swiped_id FROM swipes WHERE swiper_id = $1
         )
         AND u.id NOT IN (
           SELECT blocked_id FROM blocks WHERE blocker_id = $1
           UNION
           SELECT blocker_id FROM blocks WHERE blocked_id = $1
         )
       GROUP BY u.id, u.name, u.college_name, p.bio, p.year_of_study
       LIMIT 20`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "No more matches available", users: [] });
    }

    res.json({ users: result.rows });

  } catch (err) {
    console.error("Feed error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
