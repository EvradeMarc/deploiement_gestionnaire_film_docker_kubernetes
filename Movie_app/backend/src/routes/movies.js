const express = require("express");

const {
  init,
  getMovies,
  getMovieById,
  storeMovie,
  updateMovie,
  removeMovie,
} = require("../config");
const router = express.Router();

// GET tous les films
router.get("/", async (req, res) => {
  try {
    const movies = await getMovies();
    res.json(movies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des films" });
  }
});

// GET un film par ID
router.get("/:id", async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Film non trouvé" });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du film" });
  }
});

// POST nouveau film
router.post("/", async (req, res) => {
  try {
    const newMovie = await storeMovie(req.body);
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du film" });
  }
});

// PUT modifier un film
router.put("/:id", async (req, res) => {
  try {
    const updateMovies = await updateMovie(req.params.id, req.body);
    res.json(updateMovies);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification du film " });
  }
});

// DELETE supprimer un film
router.delete("/:id", async (req, res) => {
  try {
    const result = await removeMovie(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Film non trouvé" });
    }
    res.json({ message: "Film supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du film" });
  }
});

module.exports = router;
