const express = require("express");
const session = require("express-session");
const puppeteer = require('puppeteer');
const { Pool } = require('pg')
const fs = require('fs');
const popup = require('node-popup');

var pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost/pricescraper",
  // ssl: {
  //     rejectUnauthorized: false
  //   }
})

//imports scraping scripts 
const { scrapGoemans, getCount } = require("./public/scrapGoemans.js");
const { scrapCanAppl } = require("./public/scrapCanAppl.js");
const { scrapMidAppl } = require("./public/scrapMidAppl.js");

var goemansRunning = false;
var canApplRunning = false;
var midApplRunning = false;

const path = require("path");
const PORT = process.env.PORT || 5000;


app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'))

// session info
app.use(
  session({
    name: "session",
    secret: "bigpete",
    resave: false,
    saveUninitialized: false,
    maxAge: 20 * 1000, // 30 minutes
  })
);

// static
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/', async (req, res) => {
  try {
    res.render('pages/index')
  }
  catch (error){
    res.end(error)
  }
})

// login post
app.post("/login", async (req, res) => {
  var un = req.body.f_uname;
  var pwd = req.body.f_pwd;

  // var verifyQuery = `SELECT * FROM validusers WHERE uname='${un}' AND password='${pwd}'`
  // var result = await pool.query(verifyQuery)

  // if result.rows is !empty
  // valid user
  if (un === "admin" && pwd === "scraper") {
    // valid
    req.session.user = req.body;
    res.redirect("/dashboard");
  } else {
    res.redirect("/");
  }
  // else
  // invalid user
});

//logout post
app.post("/logout", async (req, res) => {
  console.log("hello");
  res.redirect("/");
  req.session.destroy();
  // else
  // invalid user
});


//url page get
app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("pages/urlPage");
  } 
  else
    res.redirect("/");
});

//scraped page get
app.get("/display", async (req, res) => {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM canAppl ORDER BY name`;
    const result = await pool.query(allusersquery)
    const data = { results: result.rows }
    res.render('pages/scraped-data', data)
  } 
  else 
    res.redirect("/");
});

// //scraped page post
// app.post("/display", async (req, res) => {
//   //res.render("pages/display");
//   res.render("pages/scraped-data");
//   res.redirect("/scraped-data");
//   // else
//   // invalid user
// });

app.get("/display-data", async (req, res) => {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM canAppl ORDER BY name`;
    const result = await pool.query(allusersquery)
    const data = { results: result.rows }
    res.render('pages/db', data)
  } 
  else 
    res.redirect("/");
});

//url page get
app.get("/home", (req, res) => {
  if (req.session.user) {
    res.render("pages/urlPage");
  } 
  else
    res.redirect("/");
});

app.get('/canApp', async (req, res)=> {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM canAppl ORDER BY id`;
    const result = await pool.query(allusersquery)
    const data = { results: result.rows }
    res.render('pages/db', data)
  } 
  else 
    res.redirect("/");
});

app.get('/goemans', async (req, res)=> {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM goemans ORDER BY id`;
    const result = await pool.query(allusersquery)
    const data = { results: result.rows }
    res.render('pages/db', data)
  } 
  else 
    res.redirect("/");
});

app.get('/midAppl', async (req, res)=> {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM midAppl ORDER BY id`;
    const result = await pool.query(allusersquery)
    const data = { results: result.rows }
    res.render('pages/db', data)
  } 
  else 
    res.redirect("/");
});

app.get("/scrape", async(req,res) => {
  if (req.session.user) {
    res.render("pages/urlPage");
  } 
  else
    res.redirect("/")
})

app.get("/scrape/:id/:id2/:id3", async(req,res) => {
  var id = req.params.id.toString();
  var id2 = req.params.id2.toString();
  var id3 = req.params.id3.toString();

  if(id == 'goemans' || id2 == 'goemans' || id3 == 'goemans'){
    if(goemansRunning){
      console.log("Goeman's is running");
    }else{
      goemansRunning = true;
      scrapGoemans(106);
    }
  }
  if (id == 'canAppl' || id2 == 'canAppl' || id3 == 'canAppl'){
    scrapCanAppl();
    await res.render('pages/scraped-data')
  }
  if (id == 'midAppl' || id2 == 'midAppl' || id3 == 'midAppl'){
    scrapMidAppl();
    await res.render('pages/scraped-data')
  }
})

app.get("/progress", async(req,res) =>{
  // fs.readFile('test', 'utf8', function(err, data){
  //   // Display the file content
  //   res.send(data);
  // });
  res.send(getCount().toString());
})

app.get("/running", async(req,res) =>{
  res.send(`${goemansRunning}`);
})

app.get("/goemanSuccess", async(req,res) =>{
  goemansRunning = false;
  console.log("Goemans Success");
})


app.listen(PORT, () => console.log(`Listening on ${PORT}`));