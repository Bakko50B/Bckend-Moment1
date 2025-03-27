/**
 * Server
 * 
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./db/cv.db")

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");                          //View eninge ejs
app.use(express.static("public"));                      //Statiska filer i public
app.use(bodyParser.urlencoded({ extended: true }));

// Route för att hämta alla användare och rendera dem i en tabell
app.get('/', (req, res) => {
    const db = new sqlite3.Database('./db/cv.db');

    db.all('SELECT * FROM courses', (err, rows) => {
        //   db.close();

        if (err) {
            return res.status(500).send('Database error');
        }
        res.render('index', { courses: rows }); // Skickar alla rader till EJS-templaten
    });
    db.close();
});

// DELETE route 
app.get('/delete', (req, res) => {
    const courseId = req.query.Id;

    if (!courseId) {
        return res.status(400).send("Invalid ID");
    }

    const stmt = db.prepare('DELETE FROM courses WHERE courseId = ?');
    stmt.run(courseId, (err) => {
        if (err) {
            console.error("Error deleting course:", err);
            return res.status(500).send("Failed to delete course");
        }
        console.log(`Course with ID ${courseId} deleted successfully.`);
        stmt.finalize();
        res.redirect('/'); // Gå tillbaka till startsidan
    });
});

app.get('/insert', (req, res) => {
    res.render('insert', (req, res));
});

app.post('/insert', (req, res) => {
    const { courseCode, courseName, courseLink, courseProgression } = req.body; // Hämta data från formuläret

    const db = new sqlite3.Database('./db/cv.db');

    const stmt = db.prepare('INSERT INTO courses (courseCode, courseName, courseLink, courseProgression) VALUES (?, ?, ?, ?)');

    stmt.run(courseCode, courseName, courseLink, courseProgression, (err) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Failed to insert data');
        }

        console.log('Data successfully inserted!');
        stmt.finalize();
        res.redirect('/');
    });

    db.close();
});


app.listen(port, () => {
    console.log("Laboration ett startade på port: " + port + "!");
})