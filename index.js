const express = require("express");
const session = require("express-session");
const puppeteer = require("puppeteer");
const { Pool } = require("pg");
var pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:cmpt276@localhost/pricescraper",
  // ssl: {
  //     rejectUnauthorized: false
  //   }
});

//imports scraping scripts
const { scrapGoemans } = require("./public/scrapGoemans.js");
const { scrapCanAppl } = require("./public/scrapCanAppl.js");
const { scrapMidAppl } = require("./public/scrapMidAppl.js");

const path = require("path");
const PORT = process.env.PORT || 5000;

app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

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

app.get("/", async (req, res) => {
  try {
    res.render("pages/index");
  } catch (error) {
    res.end(error);
  }
});

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
  } else res.redirect("/");
});

//scraped page get
app.get("/display", async (req, res) => {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM canAppl ORDER BY name`;
    const result = await pool.query(allusersquery);
    const data = { results: result.rows };
    res.render("pages/scraped-data", data);
  } else res.redirect("/");
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
    const result = await pool.query(allusersquery);
    const data = { results: result.rows };
    res.render("pages/db", data);
  } else res.redirect("/");
});

//url page get
app.get("/home", (req, res) => {
  if (req.session.user) {
    res.render("pages/urlPage");
  } else res.redirect("/");
});

app.get("/canApp", async (req, res) => {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM canAppl ORDER BY id`;
    const result = await pool.query(allusersquery);
    const data = { results: result.rows };
    res.render("pages/db", data);
  } else res.redirect("/");
});

app.get("/goemans", async (req, res) => {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM goemans ORDER BY id`;
    const result = await pool.query(allusersquery);
    const data = { results: result.rows };
    res.render("pages/db", data);
  } else res.redirect("/");
});

app.get("/midAppl", async (req, res) => {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM midAppl ORDER BY id`;
    const result = await pool.query(allusersquery);
    const data = { results: result.rows };
    res.render("pages/db", data);
  } else res.redirect("/");
});

app.post("/skuwSearch", async (req, res) => {
  if (req.session.user) {
    var skuName = req.body.Sku_name;
    console.log(skuName);
    //var allusersquery = `SELECT (c.name, c.price, c.url, c.lpmod,m.name, m.price, m.url, m.lpmod, g.name, g.price, g.url, g.lpmod)fROM canAPPL c, Midappl m, goemans g where c.sku='MDG6400AW' or m.sku='MDG6400AW' or g.sku='MDG6400AW';`;

    var allusersquery =
      "SELECT * fROM canAppl where sku='" +
      skuName +
      "' union sELECT * fROM midappl where sku='" +
      skuName +
      "' union SELECT * fROM goemans where sku='" +
      skuName +
      "';";
    const result = await pool.query(allusersquery);
    const data = { results: result.rows };
    console.log(data);
    res.render("pages/skuSearch", data);
  } else res.redirect("/");
});

app.get("/scrape", async (req, res) => {
  if (req.session.user) {
    res.render("pages/urlPage");
  } else res.redirect("/");
});

app.get("/scrape:id", async (req, res) => {
  var id = req.params.id;
  console.log(id);
  if (id == "goemans") {
    scrapGoemans(106);
    await res.render("pages/scraped-data");
  } else if (id == "canAppl") {
    scrapCanAppl();
    await res.render("pages/scraped-data");
  } else if (id == "midAppl") {
    scrapMidAppl();
    await res.render("pages/scraped-data");
  } else {
    res.render("pages/urlPage");
  }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
