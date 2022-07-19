const express = require("express");
const session = require("express-session");
const puppeteer = require('puppeteer');
const { Pool } = require('pg')
const fs = require('fs');

var pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost/pricescraper",
  // ssl: {
  //     rejectUnauthorized: false
  //   }
})

//imports scraping scripts 
const { scrapGoemans, getCount } = require("./public/scrapGoemans.js");
const { scrapCanAppl, canApplCounter } = require("./public/scrapCanAppl.js");
const { scrapMidAppl, midApplCounter } = require("./public/scrapMidAppl.js");

var goemansRunning = false;
var canApplRunning = false;
var midApplRunning = false;

var urlPageData = ["default","default","default", 1];
// Counters for CanAppl, Goemans, MidLands respectively
var progBar = [0, 0, 0];

const path = require("path");
const { url } = require("inspector");
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

app.get("/scrape/default/default/default", async(req,res) => {
  if (req.session.user) {
    res.render("pages/urlPage");
  } 
  else
    res.redirect("/")
})

app.get("/scrape/:id/:id2/:id3/:id4", async(req,res) => {
  var id = req.params.id.toString();
  var id2 = req.params.id2.toString();
  var id3 = req.params.id3.toString();
  numRows = req.params.id4.toString();

  urlPageData[0] = id;
  urlPageData[1] = id2;
  urlPageData[2] = id3;
  urlPageData[3] = numRows;

  if(id == 'goemans' || id2 == 'goemans' || id3 == 'goemans'){
    if(goemansRunning){
      console.log("Goeman's is running");
    }else{
      goemansRunning = true;
      scrapGoemans(106);
      //numRows++;
    }
  }
  if (id == 'canAppl' || id2 == 'canAppl' || id3 == 'canAppl'){
    scrapCanAppl();
    //numRows++;
  }
  if (id == 'midAppl' || id2 == 'midAppl' || id3 == 'midAppl'){
    scrapMidAppl();
    //numRows++;
  }
})

app.get("/progress", async(req,res) =>{
  progBar[0] = canApplCounter();
  progBar[1] = getCount();
  progBar[2] = midApplCounter();
  res.send(`${progBar}`);
})

app.get("/running", async(req,res) =>{
  res.send(`${goemansRunning}`);
})

app.get("/goemanSuccess", async(req,res) =>{
  goemansRunning = false;
  console.log("Goemans Success");
})
app.get("/urlPageData", async(req,res) =>{
  console.log(urlPageData);
  res.send(`${urlPageData}`);
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));