const tempEnv = require("dotenv").config();
const express = require("express");
const session = require("express-session");
const puppeteer = require('puppeteer');

const fastcsv = require('fast-csv');
const fs = require('fs');

var cors = require('cors') //cross-origin resources sharing
var knex = require('./knex')

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



//-------------------------------------------------------------RENDERS SCRAPED_DATA PAGE WITH LAST CHECK----------------------------------------------
app.get("/display", async (req, res) => {
  if (req.session.user) {
    var lcheck1 = await knex.select('lpmod').from('canAppl').limit(1);
    var lcheck2 = await knex.select('lpmod').from('goemans').limit(1);
    var lcheck3 = await knex.select('lpmod').from('midAppl').limit(1);
    var lcheck4 = await knex.select('lpmod').from('coastAppl').limit(1);
    var na ='N/A';

    if (lcheck1 != '')
      lcheck1 = lcheck1[0].lpmod; //canAppl
    else
      lcheck1 = na;

    if (lcheck2 != '')
      lcheck2 = lcheck2[0].lpmod; //goemans
    else
      lcheck2 = na;

    if (lcheck3 != '')
      lcheck3 = lcheck3[0].lpmod; //midAppl
    else
      lcheck3 = na;

    if (lcheck4  != '')
      lcheck4 = lcheck4[0].lpmod; //coastAppl
    else
      lcheck4 = na;

    var results = {lcheck1: lcheck1, lcheck2: lcheck2, lcheck3: lcheck3, lcheck4: lcheck4};
    res.render('pages/scraped-data', results);
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

//-----------------------------------------------RENDER COMPANY"S DATA FROM SCRAPED DATA PAGE--------------------------------
var company_name;

const allData = async ()=>{
  company_name = "All Company's Data";
  var selectQuery1 = await knex.select('*').from('midAppl').orderBy('id');
  var selectQuery2 = await knex.select('*').from('goemans').orderBy('id');
  var selectQuery3 = await knex.select('*').from('canAppl').orderBy('id');
  var selectQuery4 = await knex.select('*').from('coastAppl').orderBy('id');

  var selectQuery = []
  selectQuery.push(selectQuery1);
  selectQuery.push(selectQuery2);
  selectQuery.push(selectQuery3);
  selectQuery.push(selectQuery4);

  const result = selectQuery;
  const mergedData = result[0].concat(result[1]).concat(result[2]).concat(result[3]);
  await downloadData('all', mergedData);

const data = { results: mergedData, name:company_name}
return data;  
}

const getCanAppl = async ()=>{
  const result = await knex.select('*').from('canAppl').orderBy('id');
  await downloadData('canadian_appliance', result);
  company_name = 'Canadian Appliance'
  const data = { results: result, name: 'Canadian Appliance'}
  return data;
}

const getGoemans = async ()=>{
  const result = await knex.select('*').from('goemans').orderBy('id');
  await downloadData('goemans', result);
  company_name = 'Goemans'
  const data = { results: result, name: 'Goemans'}
  return data;
}

const getMidAppl = async ()=>{
  const result = await knex.select('*').from('midAppl').orderBy('id');
  await downloadData('midland_appliance', result);
  company_name = 'Midland Appliance'
  const data = { results: result, name: 'Midland Appliance'}
  return data;
}

const getCoastAppl = async ()=>{
  const result = await knex.select('*').from('coastAppl').orderBy('id');
  await downloadData('coast_appliances', result);
  company_name = 'Coast Appliances'
  const data = { results: result, name: 'Coast Appliances'}
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

app.get('/all', async(req, res)=>{
  if (req.session.user) {
    const data = await allData()
    res.render('pages/db', data)
  }
  else
    res.redirect('/')
  })


//------------------------------------------------------SKU FILTER------------------------------------------

app.post("/skuFilter", async (req, res) => {
if (req.session.user) {
  var sku = req.body.Sku_name;
  console.log(company_name);
  console.log(sku)

  var searchQuery1 = await knex.select('*').from('midAppl').whereRaw('sku = ?', sku);
  var searchQuery2 = await knex.select('*').from('goemans').whereRaw('sku = ?', sku);
  var searchQuery3 = await knex.select('*').from('canAppl').whereRaw('sku = ?', sku);
  var searchQuery4 = await knex.select('*').from('coastAppl').whereRaw('sku = ?', sku);

  if (company_name == 'Midland Appliance'){
    var searchQuery = searchQuery1;
  }
  else if (company_name == 'Goemans') {
    var searchQuery = searchQuery2;
  }
  else if (company_name == 'Coast Appliances'){
    var searchQuery = searchQuery4;
  }
  else if (company_name == 'Canadian Appliance') {
    var searchQuery = searchQuery3;
  }
  else {
    var searchQuery = searchQuery1.concat(searchQuery2).concat(searchQuery3).concat(searchQuery4);
  }

  const data = { results: searchQuery, name: company_name}
  if(sku != "")
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
    else{
      let data = await allData();
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



//----------------DOWNLOADS CSV--------------------------

var ws;

const downloadData = async (name, cData)=>{

  name = name + "_data.csv";
  ws = fs.createWriteStream(name);
  // selectQuery = await knex.select('*').from(tableName);

  var data = JSON.parse(JSON.stringify(cData));
  
  fastcsv
  // write the data to a CSV file
  .write(data, { headers: true})

  // log message when finished
  .on("finish", () => {
    console.log(` ${company_name} data exported to CSV file successfully.`);
  })
  .pipe(ws);
}

app.post('/csv-download', async(req, res) => {
      let cName = '';

      if (company_name == 'Canadian Appliance')
        cName = 'canadian_appliance'
      else if(company_name == 'Goemans')
        cName = 'goemans';
      else if (company_name == 'Midland Appliance')
        cName = 'midland_appliance';
      else if (company_name == 'Coast Appliances')
        cName = 'coast_appliances' ; 
      else
        cName = 'all';

    try {
      let file = path.join(__dirname, cName + '_data.csv');
      res.download(file);
    }
    catch(e)
    {
      console.log(e);
    }
  })

/*---------------------------------*/

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

module.exports = app;