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
    res.render('insert', {
        errors: []
    });
});

app.post('/insert', (req, res) => {
    const { courseCode, courseName, courseLink, courseProgression } = req.body; // Hämta data från formuläret

    let errors = [];
    // validera input
    if (courseCode === "") {
        errors.push("Du måste ange en kurskod för kursen!");
    }
    if (courseName === "") {
        errors.push("Du måste ange ett namn för kursen!");
    }
    if (courseLink === "") {
        errors.push("Du har inte angett en länk för kursen!");
    }
    if (courseProgression === "") {
        errors.push("Du har inte angett en progression för kursen")
    }

    // Är allt korrekt ifyllt
    if (errors.length === 0) {

        const db = new sqlite3.Database('./db/cv.db');
        const stmt = db.prepare('INSERT INTO courses (courseCode, courseName, courseLink, courseProgression) VALUES (?, ?, ?, ?)');

        stmt.run(courseCode, courseName, courseLink, courseProgression, (err) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).send('Failed to insert data');
            }
            console.log('Data successfully inserted!');
            stmt.finalize();
            db.close();
            res.redirect('/');
        });
        
    } else {
        res.render("insert", {
            errors,
            courseCode: courseCode,
            courseName: courseName,
            courseLink: courseLink,
            courseProgression: courseProgression 
        });
    }
  


    
});


app.listen(port, () => {
    console.log("Laboration ett startade på port: " + port + "!");
})