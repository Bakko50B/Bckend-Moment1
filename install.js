/**
 * Installation för sqlite
 * 
 */

//const express = require('express');
const sqlite3 = require('sqlite3').verbose();
//const { open } = require('sqlite');

const db = new sqlite3.Database("./db/cv.db")
db.serialize(() => {

    db.run("DROP TABLE IF EXISTS courses;");
    db.run(`
        CREATE TABLE "courses" (
        "courseId"	INTEGER NOT NULL,
        "courseCode"	TEXT(20) UNIQUE,
        "courseName"	TEXT(50) UNIQUE,
        "courseLink"	TEXT(150) UNIQUE,
        "courseProgression"	TEXT(4) CHECK(courseProgression IN ('A', 'B', 'C')) ,
        "createdTime"	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY("courseId" AUTOINCREMENT));    
    `);
    db.run("INSERT INTO courses (courseCode, courseName, courseLink, courseProgression) VALUES ('DT057G', 'Webbutveckling I', 'https://www.miun.se/utbildning/kursplaner-och-utbildningsplaner/DT057G/', 'A');");
    db.run("INSERT INTO courses (courseCode, courseName, courseLink, courseProgression) VALUES ('DT084G', 'Introduktion till programmering i JavaScript', 'https://www.miun.se/utbildning/kursplaner-och-utbildningsplaner/DT084G/', 'A');");
});


db.close();