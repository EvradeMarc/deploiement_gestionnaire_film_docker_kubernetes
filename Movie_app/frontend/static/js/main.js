const API_URL = "/api/movies/";
const movieForm = document.getElementById("movieForm");
const moviesList = document.getElementById("moviesList");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

// État de l'application
let isEditing = false;

// Charger les films au démarrage
document.addEventListener("DOMContentLoaded", loadMovies);

// Gestionnaire de soumission du formulaire
movieForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const movieData = {
    title: document.getElementById("title").value,
    director: document.getElementById("director").value,
    year: document.getElementById("year").value,
    genre: document.getElementById("genre").value,
    description: document.getElementById("description").value,
  };

  if (isEditing) {
    const movieId = document.getElementById("movieId").value;
    await updateMovie(movieId, movieData);
  } else {
    await createMovie(movieData);
  }

  resetForm();
  loadMovies();
});

// Annuler la modification
cancelBtn.addEventListener("click", resetForm);

// Charger tous les films
async function loadMovies() {
  try {
    const response = await fetch(API_URL);
    const movies = await response.json();
    displayMovies(movies);
  } catch (error) {
    console.error("Erreur lors du chargement des films:", error);
  }
}

// Afficher les films
function displayMovies(movies) {
  moviesList.innerHTML = movies
    .map(
      (movie) => `
        <div class="movie-card">
            <h3>${movie.title} (${movie.year || "Année inconnue"})</h3>
            <p><strong>Réalisateur:</strong> ${
              movie.director || "Non spécifié"
            }</p>
            <p><strong>Genre:</strong> ${movie.genre || "Non spécifié"}</p>
            <p><strong>Description:</strong> ${
              movie.description || "Aucune description"
            }</p>
            <div class="movie-actions">
                <button onclick="editMovie(${
                  movie.id
                })" class="edit-btn">Modifier</button>
                <button onclick="deleteMovie(${
                  movie.id
                })" class="delete-btn">Supprimer</button>
            </div>
        </div>
    `
    )
    .join("");
}

// Créer un nouveau film
async function createMovie(movieData) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movieData),
    });
  } catch (error) {
    console.error("Erreur lors de la création du film:", error);
  }
}

// Charger un film pour modification
async function editMovie(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const movies = await response.json();

    console.log(" Film recupere ",movies);

    const movie = movies[0];

    document.getElementById("movieId").value = movie.id;
    document.getElementById("title").value = movie.title;
    document.getElementById("director").value = movie.director || "";
    document.getElementById("year").value = movie.year || "";
    document.getElementById("genre").value = movie.genre || "";
    document.getElementById("description").value = movie.description || "";

    submitBtn.textContent = "Modifier";
    cancelBtn.style.display = "inline";
    isEditing = true;
  } catch (error) {
    console.error("Erreur lors du chargement du film:", error);
  }
}

// Mettre à jour un film
async function updateMovie(id, movieData) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movieData),
    });
  } catch (error) {
    console.error("Erreur lors de la modification du film :", error);
  }
}

// Supprimer un film
async function deleteMovie(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce film ?")) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      loadMovies();
    } catch (error) {
      console.error("Erreur lors de la suppression du film:", error);
    }
  }
}

// Réinitialiser le formulaire
function resetForm() {
  movieForm.reset();
  document.getElementById("movieId").value = "";
  submitBtn.textContent = "Ajouter";
  cancelBtn.style.display = "none";
  isEditing = false;
}
