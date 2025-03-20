require("dotenv").config();
const mysql = require("mysql2");
const waitPort = require("wait-port");

let pool;

async function init() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER ;
  const password = process.env.DB_PASSWORD ;
  const database = process.env.DB_NAME;

  await waitPort({
    host,
    port: 3306,
    timeout: 10000,
    waitForDns: true,
  });

  pool = mysql.createPool({
    connectionLimit: 5,
    host,
    user,
    password,
    database,
    charset: "utf8mb4",
  });

  return new Promise((acc, rej) => {
    pool.query(
      `CREATE TABLE IF NOT EXISTS movies (
              id INT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              director VARCHAR(255),
              year INT,
              genre VARCHAR(100),
              description TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) DEFAULT CHARSET utf8mb4`,
      (err) => {
        if (err) return rej(err);
        console.log(`Connected to MySQL database at host ${host}`);
        acc();
      }
    );
  });
}

async function getMovies() {
  return new Promise((acc, rej) => {
    pool.query("SELECT * FROM movies ORDER BY created_at DESC", (err, rows) => {
      if (err) return rej(err);
      acc(rows);
    });
  });
}

async function getMovieById(id) {
  return new Promise((acc, rej) => {
    pool.query("SELECT * FROM movies WHERE id = ?", [id], (err, rows) => {
      if (err) return rej(err);
      acc(rows || null);
    });
  });
}

async function storeMovie(movie) {
  return new Promise((acc, rej) => {
    pool.query(
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
    pool.query(
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
    pool.query("DELETE FROM movies WHERE id = ?", [id], (err, result) => {
      if (err) return rej(err);
      acc(this.changes > 0 ? { message: "Film supprimé avec succès" } : null);
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
