require("dotenv").config();
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const location = process.env.SQLITE_DB_LOCATION || "./etc/database/moviedb.db";

let db, dbALL, dbRun;

function init() {
  const dirName = path.dirname(location);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }

  return new Promise((acc, rej) => {
    db = new sqlite3.Database(location, (err) => {
      if (err) return rej(err);

      if (process.env.NODE_ENV !== "test")
        console.log(`Using sqlite database at ${location}`);

      db.run(
        ` CREATE TABLE IF NOT EXISTS movies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                director TEXT,
                year INTEGER,
                genre TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`,
        (err, result) => {
          if (err) return rej(err);
          acc();
        }
      );
    });
  });
}

async function getMovies() {
  return new Promise((acc, rej) => {
    db.all("SELECT * FROM movies ORDER BY created_at DESC", (err, rows) => {
      if (err) return rej(err);
      acc(rows);
    });
  });
}

async function getMovieById(id) {
  return new Promise((acc, rej) => {
    db.all("SELECT * FROM movies WHERE id = ?", [id], (err, rows) => {
      if (err) return rej(err);
      acc(rows || null);
    });
  });
}

async function storeMovie(movie) {
  return new Promise((acc, rej) => {
    db.run(
      "INSERT INTO movies (title, director, year, genre, description) VALUES (?, ?, ?, ?, ?)",
      [movie.title, movie.director, movie.year, movie.genre, movie.description],
      function (err) {
        if (err) return rej(err);
        acc({ id: this.lastID, ...movie });
      }
    );
  });
}

async function updateMovie(id, movie) {
  return new Promise((acc, rej) => {
    db.run(
      "UPDATE movies SET title = ?, director = ?, year = ?, genre = ?, description = ? WHERE id = ?",
      [ movie.title, movie.director, movie.year, movie.genre, movie.description, id],
      function (err) {
        if (err) return rej(err);
        acc();
      }
    );
  });
}

async function removeMovie(id) {
  return new Promise((acc, rej) => {
    db.run("DELETE FROM movies WHERE id = ?", [id], function (err) {
      if (err) return reject(err);
      acc(this.changes > 0 ? { message: "Film supprimé avec succès" } : null);
    });
  });
}

async function teardown() {
  return new Promise((acc, rej) => {
    db.close((err) => {
      if (err) rej(err);
      else acc();
    });
  });
}

module.exports = {
  init,
  getMovies,
  getMovieById,
  storeMovie,
  updateMovie,
  removeMovie,
};
