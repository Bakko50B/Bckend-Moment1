/**
 * Server
 * 
 */

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database("./db/cv.db")

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");                          //View eninge ejs
app.use(express.static("public"));                      //Statiska filer i public
app.use(bodyParser.urlencoded({ extended: true }));

// Route på index för att hämta alla användare och rendera dem i en tabell
app.get('/', (req, res) => {
    const db = new sqlite3.Database('./db/cv.db');

    db.all('SELECT * FROM courses', (err, rows) => {
        
        if (err) {
            db.close();
            return res.status(500).send('Database error');
        }
        res.render('index', { courses: rows }); 
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

// Insert get-route
app.get('/insert', (req, res) => {
    res.render('insert', {
        errors: [],
        courseCode: '', // Dessa skickas med för att förhindra "undefined"
        courseName: '',
        courseLink: '',
        courseProgression: ''
    });
});

// Insert post-route
app.post('/insert', (req, res) => {
    const { courseCode, courseName, courseLink, courseProgression } = req.body; // Hämta data från formuläret

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
        const stmt = db.prepare('INSERT INTO courses (courseCode, courseName, courseLink, courseProgression) VALUES (?, ?, ?, ?)');

        stmt.run(courseCode, courseName, courseLink, courseProgression, (err) => {
            if (err) {
                console.error('Fel vid inmatning av data:', err);

                // Kontrollera om felet orsakas av UNIQUE eller CHECK constraint
                if (err.code === 'SQLITE_CONSTRAINT') {
                    
                    if (err.message.includes('courseCode')) {
                        errors.push("Kurskoden finns redan!");
                    }
                    if (err.message.includes('courseName')) {
                        errors.push("Kursnamnet finns redan!");
                    }
                    if (err.message.includes('courseLink')) {
                        errors.push("Kurslänken finns redan!");
                    }
                    if (err.message.includes('courseProgression')) {
                        errors.push("Ogiltig kursprogression! Endast 'A', 'B' eller 'C' är tillåtna.");
                    }
                
                    if (errors.length === 0) {
                        errors.push("Ett unikt fält har en konflikt!");
                    }
                } else {
                    errors.push("Ett oväntat fel inträffade. Försök igen.");
                }         
               
                return res.render("insert", {
                    errors,
                    courseCode,
                    courseName,
                    courseLink,
                    courseProgression
                });
            }

            console.log('Ny information införd i databasen!');
            stmt.finalize();
            db.close();
            res.redirect('/');
        });

    } else {
        // Rendera formuläret igen med valideringsfel
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
        return res.status(400).send('Fel med ID');
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

        stmt.run(courseCode, courseName, courseLink, courseProgression, courseId, (err) => {
            if (err) {
                console.error('Fel vid uppdatering av data:', err);

                // Kontrollera om felet orsakas av UNIQUE eller CHECK constraint
                if (err.code === 'SQLITE_CONSTRAINT') {
                    if (err.message.includes('courseCode')) {
                        errors.push("Kurskoden finns redan!");
                    }
                    if (err.message.includes('courseName')) {
                        errors.push("Kursnamnet finns redan!");
                    }
                    if (err.message.includes('courseLink')) {
                        errors.push("Kurslänken finns redan!");
                    }
                    if (err.message.includes('courseProgression')) {
                        errors.push("Ogiltig kursprogression! Endast 'A', 'B' eller 'C' är tillåtna.");
                    }
                    if (errors.length === 0) {
                        errors.push("Ett unikt fält har en konflikt!");
                    }
                } else {
                    errors.push("Ett oväntat fel inträffade. Försök igen.");
                }

                // Rendera formuläret igen med felmeddelanden
                return res.render("update", {
                    errors,
                    courseCode,
                    courseName,
                    courseLink,
                    courseProgression,
                    courseId
                });
            }

            console.log(`Coursetabellen med ID ${courseId} uppdaterades`);
            stmt.finalize(); 
            db.close();
            res.redirect('/'); // Gå tillbaka till startsidan
        });

    } else {
        
        res.render("update", {
            errors,
            courseCode: courseCode,
            courseName: courseName,
            courseLink: courseLink,
            courseProgression: courseProgression,
            courseId: courseId 
        });
    }
});


app.get('/about', (req, res) => {
    res.render("about");
});

app.listen(port, () => {
    console.log("Laboration ett startade på port: " + port + "!");
})