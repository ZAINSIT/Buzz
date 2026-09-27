const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("./db/index");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const feedRoutes = require("./routes/feed");
const swipeRoutes = require("./routes/swipe");
const chatRoutes = require("./routes/chat");
const verificationRoutes = require("./routes/verification");

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/feed", feedRoutes);
app.use("/swipe", swipeRoutes);
app.use("/chat", chatRoutes);
app.use("/verification", verificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Buzz API is running" });
});

const ENCRYPTION_KEY = crypto.scryptSync(process.env.JWT_SECRET, "buzz_salt", 32);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return { iv: iv.toString("hex"), content: encrypted.toString("hex") };
}

function decrypt(content, iv) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, Buffer.from(iv, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(content, "hex")), decipher.final()]);
  return decrypted.toString();
}

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.user.id);

  socket.on("join_match", (matchId) => {
    socket.join(matchId);
  });

  socket.on("send_message", async ({ matchId, message }) => {
    try {
      const match = await pool.query(
        "SELECT * FROM matches WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2) AND is_active = true",
        [matchId, socket.user.id]
      );

      if (match.rows.length === 0) return;

      const { iv, content } = encrypt(message);

      const result = await pool.query(
        "INSERT INTO messages (match_id, sender_id, encrypted_content, iv) VALUES ($1, $2, $3, $4) RETURNING *",
        [matchId, socket.user.id, content, iv]
      );

      const decrypted = decrypt(result.rows[0].encrypted_content, result.rows[0].iv);

      io.to(matchId).emit("new_message", {
        id: result.rows[0].id,
        sender_id: socket.user.id,
        message: decrypted,
        sent_at: result.rows[0].sent_at
      });

    } catch (err) {
      console.error("Message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Buzz server running on port ${PORT}`);
});

module.exports = app;
