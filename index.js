const tempEnv = require("dotenv").config();
const express = require("express");
const session = require("express-session");
const puppeteer = require('puppeteer');
const { Pool } = require('pg')
const fs = require('fs');
var cors = require('cors') //cross-origin resources sharing

var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //     rejectUnauthorized: false
  //   }
})

//imports scraping scripts 
const { scrapGoemans, getCount } = require("./public/scrapGoemans.js");
const { scrapCanAppl, canApplCounter } = require("./public/scrapCanAppl.js");
const { scrapMidAppl, midApplCounter } = require("./public/scrapMidAppl.js");
const { scrapCoastAppl, coastApplCounter } = require("./public/scrapCoastAppl");

var goemansRunning = false;
var canApplRunning = false;
var midApplRunning = false;

var urlPageData = ["default","default","default", 1];
// Counters for CanAppl, Goemans, MidLands respectively
var progBar = [0, 0, 0];

const path = require("path");
const { url } = require("inspector");
const e = require("express");
const PORT = process.env.PORT;


app = express();

app.use(express.json());
app.use('/', cors());
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

//-------------------------------------------------------------LOGGING OUT TAKES TO LOGIN WINDOW--------------------------------
app.post("/logout", async (req, res) => {
  console.log("hello");
  res.redirect("/");
  req.session.destroy();
  // else
  // invalid user
});


//----------------------------------------------------------------RENDERS URL PAGE AFTER LOGIN----------------------------------------
app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("pages/urlPage");
  } 
  else
    res.redirect("/");
});



//-------------------------------------------------------------RENDERS SCRAPED_DATA PAGE----------------------------------------------
app.get("/display", async (req, res) => {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM canAppl ORDER BY id`;
    const result = await pool.query(allusersquery)
    const data = { results: result.rows }
    res.render('pages/scraped-data', data)
  } 
  else 
    res.redirect("/");
});

//------------------------------------------------------RENDERS COMPANY"S DATA FROM DATABASE------------------------------------

app.get("/display-data", async (req, res) => {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM canAppl ORDER BY id`;
    const result = await pool.query(allusersquery)
    const data = { results: result.rows }
    res.render('pages/db', data)
  } 
  else 
    res.redirect("/");
});



//-------------------------------------------------RENDERS URL PAGE WHEN HOME BUTTON IS CLICKED---------------------------------------------------------------------
app.get("/home", (req, res) => {
  if (req.session.user) {
    res.render("pages/urlPage");
  } 
  else
    res.redirect("/");
});

//-----------------------------------------------RENDER INDIVIDUAL COMPANY"S DATA FROM SCRAPED DATA PAGE--------------------------------
var company_name;

const getCanAppl = async ()=>{
  var allusersquery = `SELECT * FROM canAppl ORDER BY id`;
  const result = await pool.query(allusersquery)
  company_name = 'Canadian Appliance'
  const data = { results: result.rows, name: 'Canadian Appliance'}
  return data;
}

const getGoemans = async ()=>{
  var allusersquery = `SELECT * FROM goemans ORDER BY id`;
  const result = await pool.query(allusersquery)
  company_name = 'Goemans'
  const data = { results: result.rows, name: 'Goemans'}
  return data;
}

const getMidAppl = async ()=>{
  var allusersquery = `SELECT * FROM midAppl ORDER BY id`;
  const result = await pool.query(allusersquery)
  company_name = 'Midland Appliance'
  const data = { results: result.rows, name: 'Midland Appliance'}
  return data;
}

const getCoastAppl = async ()=>{
  var allusersquery = `SELECT * FROM coastAppl ORDER BY id`;
  const result = await pool.query(allusersquery)
  company_name = 'Coast Appliances'
  const data = { results: result.rows, name: 'Coast Appliances'}
  return data;
}

app.get('/canAppl', async (req, res)=> {
  if (req.session.user) {
    let data = await getCanAppl();
    res.render('pages/db', data)
  } 
  else 
    res.redirect("/");
});

app.get('/goemans', async (req, res)=> {
  if (req.session.user) {
    let data = await getGoemans();
    res.render('pages/db', data)
  } 
  else 
    res.redirect("/");
});

app.get('/midAppl', async (req, res)=> {
  if (req.session.user) {
    let data = await getMidAppl();
    res.render('pages/db', data)
  } 
  else 
    res.redirect("/");
});

app.get('/coastAppl', async (req, res)=> {
  if (req.session.user) {
    let data = await getCoastAppl();
    res.render('pages/db', data)
  } 
  else 
    res.redirect("/");
});


//------------------------------------------------------SKU FILTER------------------------------------------

const allData = async ()=>{
  var selectQuery1 = await pool.query(`SELECT * FROM midAppl ORDER BY id`);
  var selectQuery2 = await pool.query(`SELECT * FROM goemans ORDER BY id`);
  var selectQuery3 = await pool.query(`SELECT * FROM coastAppl ORDER BY id`);
  var selectQuery4 = await pool.query(`SELECT * FROM canAppl ORDER BY id`);

  var selectQuery = []
  selectQuery.push(selectQuery1);
  selectQuery.push(selectQuery2);
  selectQuery.push(selectQuery3);
  selectQuery.push(selectQuery4);

  const result = selectQuery;
  const mergedData = result[0].rows.concat(result[1].rows).concat(result[2].rows).concat(result[3].rows);

const data = { results: mergedData}
return data;  
}

app.get('/all', async(req, res)=>{
if (req.session.user) {
  const data = await allData()
  res.render('pages/all-data', data)
}
else
  res.redirect('/')
})


app.post("/skuwSearch", async (req, res) => {
if (req.session.user) {
  var skuName = req.body.Sku_name;
  console.log(skuName);

  var searchQuery1 = await pool.query(`SELECT * FROM midAppl WHERE sku='${skuName}'`);
  var searchQuery2 = await pool.query(`SELECT * FROM goemans WHERE sku='${skuName}'`);
  var searchQuery3 = await pool.query(`SELECT * FROM coastAppl WHERE sku='${skuName}'`);
  var searchQuery4 = await pool.query(`SELECT * FROM canAppl WHERE sku='${skuName}'`);

  var searchSku = []
  searchSku.push(searchQuery1);
  searchSku.push(searchQuery2);
  searchSku.push(searchQuery3);
  searchSku.push(searchQuery4);

  const result = searchSku;

  const mergedData = result[0].rows.concat(result[1].rows).concat(result[2].rows).concat(result[3].rows);

  const data = { results: mergedData}
  if(skuName != "")
    res.render("pages/all-data", data);
  else{
    const data2 = await allData();
    res.render("pages/all-data", data2)
  }
} 
else 
  res.redirect("/");
});

app.post("/skuFilter", async (req, res) => {
if (req.session.user) {
  var skuName = req.body.Sku_name;
  console.log(company_name);
  console.log(skuName)

  if (company_name == 'Midland Appliance'){
    var searchQuery = await pool.query(`SELECT * FROM midAppl WHERE sku='${skuName}'`);
  }
  else if (company_name == 'Goemans') {
    var searchQuery = await pool.query(`SELECT * FROM goemans WHERE sku='${skuName}'`);
  }
  else if (company_name == 'Coast Appliances'){
    var searchQuery = await pool.query(`SELECT * FROM coastAppl WHERE sku='${skuName}'`);
  }
  else if (company_name == 'Canadian Appliance') {
    var searchQuery = await pool.query(`SELECT * FROM canAppl WHERE sku='${skuName}'`);
  }

  const data = { results: searchQuery.rows, name: company_name}
  if(skuName != "")
    res.render("pages/db", data);
  else{
    if (company_name == 'Midland Appliance'){
      let data = await getMidAppl();
      res.render('pages/db', data);
    }
    else if (company_name == 'Goemans') {
      let data = await getGoemans();
      res.render('pages/db', data);
    }
    else if (company_name == 'Coast Appliances'){
      let data = await getCoastAppl();
      res.render('pages/db', data);
    }
    else if (company_name == 'Canadian Appliance') {
      let data = await getCanAppl();
      res.render('pages/db', data);
    }
  }
} 
else 
  res.redirect("/");
});


//--------------------------------------------------RUNS SCRAPPING BASED ON SELECTED---------------------------------------

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

module.exports = app;