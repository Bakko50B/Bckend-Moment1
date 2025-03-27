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
            db.close();
            return res.status(500).send('Database error');
        }
        res.render('index', { courses: rows }); // Skickar alla rader till EJS-templaten
        db.close();
    });

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
        errors: [],
        courseCode: '', // Dessa skickas med för att förhindra "undefined"
        courseName: '',
        courseLink: '',
        courseProgression: ''
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

app.get('/update', (req, res) => {
    const courseId = req.query.Id;
    if (!courseId) {
        return res.status(400).send('Invalid ID');
    }

    const db = new sqlite3.Database('./db/cv.db');

    // Hämta information om kursen baserat på ID
    db.get('SELECT * FROM courses WHERE courseId = ?', [courseId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Failed to fetch course data');
        }

        if (!row) {
            return res.status(404).send('Course not found');
        }


        res.render('update', {
            errors: [],
            courseCode: row.courseCode,
            courseName: row.courseName,
            courseLink: row.courseLink,
            courseProgression: row.courseProgression,
            courseId: courseId
        });
    });

    db.close(); // Stäng databasen
});

app.post('/update', (req, res) => {
    const { courseCode, courseName, courseLink, courseProgression, courseId } = req.body;

    let errors = [];
    // Validera input
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
        errors.push("Du har inte angett en progression för kursen");
    }

    if (errors.length === 0) {
        const db = new sqlite3.Database('./db/cv.db');
        const stmt = db.prepare(`
            UPDATE courses
            SET courseCode = ?, courseName = ?, courseLink = ?, courseProgression = ?
            WHERE courseId = ?
        `);

        // Kör prepared statement
        stmt.run(courseCode, courseName, courseLink, courseProgression, courseId, (err) => {
            if (err) {
                console.error('Error updating data:', err);
                stmt.finalize(); // Stänger statement även om det blev ett fel
                return res.status(500).send('Failed to update course');
            }

            //console.log(`Course with ID ${courseId} updated successfully`);
            stmt.finalize(); // Stänger statement efter lyckad exekvering
            res.redirect('/'); // Gå tillbaka till startsidan
        });

        db.close(); // Stänger databasen efter att allt är klart
    } else {
        // Rendera formuläret igen med felmeddelanden och befintliga värden
        res.render("update", {
            errors,
            courseCode: courseCode,
            courseName: courseName,
            courseLink: courseLink,
            courseProgression: courseProgression,
            courseId: courseId // Se till att courseId skickas tillbaka
        });
    }
});



app.listen(port, () => {
    console.log("Laboration ett startade på port: " + port + "!");
})