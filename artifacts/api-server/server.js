import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const DATA_FILE = "./premium.json";

// 👉 sécuriser le fichier
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}

// 👉 WEBHOOK
app.post("/webhook", async (req, res) => {
  try {
    console.log("📩 Webhook reçu");

    const event = req.body;

        // 🔥 nouveau bloc SUPABASE
        if (event.data?.object) {
          const session = event.data.object;

          const email =
            session.customer_details?.email?.toLowerCase() ||
            session.customer_email?.toLowerCase() ||
            null;

          console.log("🔥 TEST SUPABASE INSERT:", email);

          if (!email) {
            console.log("❌ Aucun email trouvé");
            return;
          }

          const { data, error } = await supabase
            .from("premium_users")
            .insert([{ email }]);

          console.log("📦 RESULT:", data);
          console.log("❌ ERROR:", error);
        }

        await fetch("https://api.pushover.net/1/messages.json", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            token: "az4rdvgdp1ob63bx58isaqqheoayov",
            user: "ukvbsfyb3ote95u6djv4fqthnoddte",
            message: `💰 Nouveau client premium : ${email}`,
          }),
        });
      } else {
        console.log("ℹ️ Email déjà présent");
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Erreur webhook :", err);
    res.status(500).send("Erreur serveur");
  }
});
app.get("/premium", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    res.json(data);
  } catch (err) {
    console.error("Erreur lecture JSON:", err);
    res.status(500).send("Erreur lecture fichier");
  }
});
app.get("/check-premium", (req, res) => {
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
