const express = require("express");
const session = require("express-session");
const path = require("path");
const { Pool } = require("pg");
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const PORT = process.env.PORT;

app = express();

// understand json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// session info
app.use(
  session({
    name: "session",
    secret: "zordon",
    resave: false,
    saveUninitialized: false,
    maxAge: 30 * 60 * 1000, // 30 minutes
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.get("/", (req, res) => res.render("pages/index"));

app.post("/login", async (req, res) => {
  var un = req.body.f_uname;
  var pwd = req.body.f_pwd;

  // var verifyQuery = `SELECT * FROM validusers WHERE uname='${un}' AND password='${pwd}'`
  // var result = await pool.query(verifyQuery)

  // if result.rows is !empty
  // valid user
  if ((un === "bobby" && pwd === "1234") || (un === "jane" && pwd === "2345")) {
    // valid
    req.session.user = req.body;
    res.redirect("/dashboard");
  } else {
    res.redirect("/login.html");
  }
  // else
  // invalid user
});

app.get("/dashboard", (req, res) => {
  if (req.session.user)
    res.send(`hello valid user ${req.session.user.f_uname}!`);
  else res.redirect("/login.html");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
