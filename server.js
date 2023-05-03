const express = require("express");
const path = require ("path")
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/notes.html"));
});

app.get("/api/notes", (req, res) => {
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
  });
});

app.post("/api/notes", (req, res) => {
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) throw err;
    let raw = JSON.parse(data);
    const newNote = {
      id: uuidv4(),
      title: req.body.title,
      text: req.body.text,
    };
    raw.push(newNote);
    fs.writeFile("./db/db.json", JSON.stringify(raw), (err) => {
      if (err) throw err;
      res.sendStatus(200);
    });
  });
  res.end();
});

app.delete("/api/notes/:id", (req, res) => {
  const { id } = req.params;
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) throw err;
    let raw = JSON.parse(data);
    const noteIndex = raw.findIndex((note) => note.id === id);
    if (noteIndex !== -1) {
      raw.splice(noteIndex, 1);
      fs.writeFile("./db/db.json", JSON.stringify(raw), (err) => {
        if (err) throw err;
        res.sendStatus(204);
      });
    } else {
      res.sendStatus(404);
    }
  });
});

// Middleware to handle errors.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(PORT, () => {
  console.log(`App listening on https//localhost:${PORT}`);
});
