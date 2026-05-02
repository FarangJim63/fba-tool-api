import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// 👉 WEBHOOK
app.post("/webhook", async (req, res) => {
  try {
    console.log("📩 Webhook reçu");

    const event = req.body;

    const session = event.data?.object;

    const email =
      session?.customer_details?.email?.toLowerCase() ||
      session?.customer_email?.toLowerCase() ||
      null;

    console.log("📧 Email reçu :", email);

    if (!email) {
      console.log("❌ Aucun email trouvé");
      return res.status(200).send("No email");
    }

    const { data, error } = await supabase
      .from("premium_users")
      .insert([{ email }]);

    console.log("📦 RESULT:", data);
    console.log("❌ ERROR:", error);

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Erreur webhook :", err);
    res.status(500).send("Erreur serveur");
  }
});

app.get("/check-premium", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: "Email requis" });
  }

  const { data, error } = await supabase
    .from("premium_users")
    .select("*")
    .eq("email", email.toLowerCase());

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur Supabase" });
  }

  const isPremium = data.length > 0;

  res.json({ premium: isPremium });
});

// 👉 PORT obligatoire pour Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
