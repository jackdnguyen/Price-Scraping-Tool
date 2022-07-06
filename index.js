const express = require("express");
const session = require("express-session");
const path = require("path");
const PORT = process.env.PORT || 5000;
//const PORT = process.env.PORT

app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.post("/login", async (req, res) => {
  var un = req.body.f_uname;
  var pwd = req.body.f_pwd;

  // var verifyQuery = `SELECT * FROM validusers WHERE uname='${un}' AND password='${pwd}'`
  // var result = await pool.query(verifyQuery)

  // if result.rows is !empty
  // valid user
  if (un === "admin" && pwd === "scrapper") {
    // valid
    req.session.user = req.body;
    res.redirect("/dashboard");
  } else {
    res.redirect("/login.html");
  }
  // else
  // invalid user
});

app.post("/logout", async (req, res) => {
  console.log("hello");
  res.redirect("/login.html");
  req.session.destroy();
  // else
  // invalid user
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("pages/urlPage");
  } else res.redirect("/login.html");
});
app.post("/display", async (req, res) => {
  console.log("hello");
  //res.render("pages/display");
  res.render("pages/companyData");
  res.redirect("/companyData");
  // else
  // invalid user
});
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
