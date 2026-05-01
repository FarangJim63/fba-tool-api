console.log("🔥 SERVER STARTING...");
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "premium.json");

console.log("📁 Fichier utilisé :", DATA_FILE);

let premiumUsers = new Set();

// Charger les utilisateurs au démarrage
if (fs.existsSync(DATA_FILE)) {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  premiumUsers = new Set(data);
}
import bodyParser from "body-parser";

const app = express();
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// 🔴 WEBHOOK (TOUJOURS AVANT bodyParser)
app.post("/webhook", (req, res) => {
  console.log("🔥 WEBHOOK HIT");

  try {
    console.log("BODY:", req.body);

    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ ERREUR :", err);
    return res.status(500).send("fail");
  }
});

// ✅ JSON (une seule fois)
app.use(bodyParser.json());

// ✅ PAGE PRINCIPALE
app.get("/", (req, res) => {
  res.send("API OK");
});

// ✅ TEST SIMPLE
app.get("/test", (req, res) => {
  res.json({ ok: true });
});

// ✅ CHECK PREMIUM
app.get("/check-premium", (req, res) => {
  const email = req.query.email;

  const isPremium = premiumUsers.has(email);

  res.json({
    premium: isPremium,
    email: email,
  });
});

// ✅ CHECK PREMIUM (VERSION FINALE)
app.get("/check-premium", (req, res) => {
  const email = req.query.email?.trim().toLowerCase();

  if (!email) {
    return res.json({ premium: false, error: "Email manquant" });
  }

  const isPremium = premiumUsers.has(email);

  res.json({
    premium: isPremium,
    email: email,
  });
});

// ✅ CATCH ALL (toujours en dernier)
app.use((req, res) => {
  res.json({
    message: "Route inconnue",
    url: req.url,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
