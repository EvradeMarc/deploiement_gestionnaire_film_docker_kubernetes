const express = require("express");
const cors = require("cors");
const { init } = require("./config");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/movies", require("./routes/movies"));

// Initialisation de la base de données
init();

// Démarrage du serveur
app.listen(PORT,() => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
