const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();

const connecting_server_and_db = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever Running");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
connecting_server_and_db();

const response_to_map = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getQuery = `SELECT movie_name FROM movie;`;
  const result = await db.all(getQuery);
  response.send(
    result.map((item) => {
      return {
        movieName: item.movie_name,
      };
    })
  );
});

app.use(express.json());
app.post("/movies/", async (request, response) => {
  const details = request.body;
  const { directorId, movieName, leadActor } = details;
  const addMovieQuery = `INSERT INTO 
    movie (director_id,movie_name,lead_actor) 
    VALUES 
    (${directorId},"${movieName}",
    "${leadActor}");`;
  const resultItem = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getBookQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const result = await db.get(getBookQuery);
  response.send(response_to_map(result));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `UPDATE movie SET 
  director_id=${directorId} ,movie_name="${movieName}"
  ,lead_actor="${leadActor}" 
  WHERE movie_id=${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM  movie WHERE  movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getQuery = `SELECT * FROM director;`;
  const result = await db.all(getQuery);
  response.send(
    result.map((item) => {
      return {
        directorId: item.director_id,
        directorName: item.director_name,
      };
    })
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getQuery = `SELECT movie_name FROM movie
     WHERE director_id=${directorId};`;
  const result = await db.all(getQuery);
  console.log(result);
  response.send(
    result.map((item) => {
      return {
        movieName: item.movie_name,
      };
    })
  );
});

module.exports = app;
