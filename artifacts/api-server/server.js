import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const DATA_FILE = path.join(process.cwd(), "artifacts/api-server/premium.json");

// 👉 sécuriser le fichier
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}

// 👉 WEBHOOK
app.post("/webhook", async (req, res) => {
  try {
    console.log("📩 Webhook reçu");

    const event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const email =
        session.customer_details?.email ||
        session.customer_email ||
        session.customer_details?.email_address ||
        null;

      console.log("📧 Email reçu :", email);

      if (!email) {
        console.log("❌ Aucun email trouvé");
        return;
      }

      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

      if (!data.includes(email)) {
        data.push(email);

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

        console.log("✅ Email ajouté !");

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
        app.get("/premium", (req, res) => {
          try {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
            res.json(data);
          } catch (err) {
            console.error("Erreur lecture JSON:", err);
            res.status(500).send("Erreur lecture fichier");
          }
        });
        app.get("/premium", (req, res) => {
          const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
          res.json(data);
          app.get("/", (req, res) => {
            res.send("API OK");
          });
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

// 👉 PORT obligatoire pour Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
