const express = require("express");
const session = require("cookie-session");
const puppeteer = require('puppeteer');
const { Pool } = require('pg')
var pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:cmpt276@localhost/pricescraper",
  ssl: {
      rejectUnauthorized: false
    }
})

const path = require("path");
const PORT = process.env.PORT || 5000;
//const PORT = process.env.PORT

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
    var allusersquery = `SELECT * FROM canAppl ORDER BY name`;
    const result = await pool.query(allusersquery)
    const data = { results: result.rows }
    res.render('pages/db', data)
  } 
  else 
    res.redirect("/");
});

app.get('/goemans', async (req, res)=> {
  if (req.session.user) {
    var allusersquery = `SELECT * FROM goemans ORDER BY name`;
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
app.get("/scrape:id", async(req,res) => {
  var id = req.params.id;
  console.log(id);
  if(id == 'goemans'){
    sitemap(106);
    await res.render('pages/scraped-data')
  } else if (id == 'canAppl'){
    sitemap1();
    await res.render('pages/scraped-data')
  } else{
    res.render("pages/urlPage");
  }
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));


// Goemans Scrape

const urlArray = [];
const results = [];
let browser;

// Function Parameters: URL, Last Modified Date, Product num
// Scrapes Price, SKU, Product Name from Product URL
async function scrapeProduct(url, lastmod, i) {
    try{
        // Retrieves SKU from URL
        const urlSplit = url.split("/");
        const sku = urlSplit[urlSplit.length-1]
        if(sku == ''){ // If URL is not a product exit
            return;
        }
        // Set-up return object
        var obj = {
            Product:`${i}`,
            name:'',
            sku:`${sku}`,
            url:`${url}`,
            lastmod:`${lastmod}`,
            price:''
        };
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (req) => {
        if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
            req.abort();
        }
        else {
            req.continue();
        }
        });
        page.goto(url, {
            waitUntil: 'domcontentloaded',
            //remove timout
            timeout: 0
        });
        process.setMaxListeners(Infinity); // Sets Max Listeners to Inf
        try{
            // Extract Product Name
            await page.waitForXPath('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
            const [el3] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
            const txt3 = await el3.getProperty('innerText');
            const rawTxt3 = await txt3.jsonValue();
            obj.name = rawTxt3;
            try{
                // Extract Price
                const [el] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/dl[2]/dd');
                const txt = await el.getProperty('innerText');
                const rawTxt = await txt.jsonValue();
                let text = rawTxt.replace(/\$|,/g,''); // Turn price into integer value
                obj.price = parseFloat(text);
            }catch(e){ // Price Doesn't exist
                obj.price = 0;
            }
            results.push(obj); // Push Obj into results array

            // Database Queries
            var insertQuery = `INSERT INTO goemans(sku,name,price,url,lpmod) VALUES('${obj.sku}','${obj.name}',${obj.price},'${url}', '${lastmod}')`
            var updateQuery = `UPDATE goemans SET name='${obj.name}', price=${obj.price}, url='${url}', lpmod='${lastmod}' WHERE sku='${obj.sku}'`
            var getDbSku = await pool.query(`SELECT exists (SELECT 1 FROM goemans WHERE sku='${obj.sku}' LIMIT 1)`)

            if(getDbSku.rows[0].exists)
            {
                await pool.query(updateQuery)
            }
            else{
                await pool.query(insertQuery)
            }

            await page.close();
        } catch(e){
            console.log(e);
            page.close();
        } finally {
            console.log(obj);
        }
    }catch(e){
        console.log(e);
    }
}
//scrapeProduct('https://www.goemans.com/home/kitchen/accessories/cooking/range/OW3001');

// Function runs through goemans.com/sitemap.xml to extract all of product URL's
async function sitemap(index){
    const browser = await puppeteer.launch({headless:true, args: ['--no-sandbox']});
    try{
        const page = await browser.newPage();
        page.goto('https://www.goemans.com/sitemap.xml');
        page.setDefaultNavigationTimeout(0); // Sets navigation limit to inf
        await page.waitForNavigation({ // Wait until network is idle
            waitUntil: 'networkidle0',
        });
        // Loop: Extracts URL & lastmod from sitemap
        var i = index;
        for(var i; i< 206;i++){
            // Extracts url
            await page.waitForSelector(`#folder${i} > div.opened > div:nth-child(2) > span:nth-child(2)`, { // Wait for selector to laod
                visible: true,
            });
            const [el] = await page.$$(`#folder${i} > div.opened > div:nth-child(2) > span:nth-child(2)`);
            const txt = await el.getProperty('innerText');
            const url = await txt.jsonValue();
            // Extracts lastmod
            await page.waitForSelector(`#folder${i} > div.opened > div:nth-child(4) > span:nth-child(2)`, {
                visible: true,
            });
            const [el2] = await page.$$(`#folder${i} > div.opened > div:nth-child(4) > span:nth-child(2)`);
            const txt2 = await el2.getProperty('innerText');
            const lastmod = await txt2.jsonValue();
            // Create Object and push into Url Array
            let obj = {
                url:`${url}`,
                lastmod:`${lastmod}`,
            }
            urlArray.push(obj);
        }
    } catch(e) {
        console.log(e);
    } finally {
        console.log("Scraped URLs");
        await browser.close();
        scrape(); // Run Scrape URL Function
    }
}

const timer = ms => new Promise(res => setTimeout(res, ms)) // Creates a timeout using promise
// Runs Scrape Product for each element in URL Array
async function scrape(){
    browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
    for(var i=0; i<urlArray.length;i++){
        scrapeProduct(urlArray[i].url, urlArray[i].lastmod, i);
        await timer(1400); // 1.4 second delay
    }
    await browser.close();
}

// async function sitemap(index)


// Canadian Appliance scrape

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

async function sitemap1() {
 try {
     const URL = 'https://www.canadianappliance.ca/_sitemap_products.php'
     const browser = await puppeteer.launch(
      {
          // userDataDir: './data',
          headless: true,
          args: ['--no-sandbox']
      }
     )

     const page = await browser.newPage()

     await page.goto(URL,{
      waitUntil: 'load',
      timeout: 0,
     })
     let data = await page.evaluate(() => {
         let urls = []
         let items = document.getElementsByTagName('body')[0].innerHTML.split('\n')
          for(let i= 0; i < 100; i++) {
              urls.push(items[i])
          }
          return urls
     })
  //    console.log(data)
  //    data.forEach(async(item)=>{
  //     await scraper(browser, item)
  //    })
     for(let i = 0; i < 100; i++) {
      await scraper(browser, data[i], i)
      delay(1000)
     }
     await browser.close()
 } 
 catch (error) {
     console.error(error)
 }
}

async function scraper(browser, link, index) {  
  try {
      const URL = link
      const page = await browser.newPage()

      await page.goto(URL, { 
          waitUntil: 'networkidle2',
          timeout: 0})

      await page.setRequestInterception(true)
      page.on('request', (request)=>{
          if (request.resourceType() == 'image' || request.resourceType() == 'stylesheet' || request.resourceType() == 'font')
              request.abort()
          else
              request.continue()
      })

      let data = await page.evaluate(() => {
          if(document.querySelector('h1 [itemprop=name]') == null)
              return
          else {
              let results = []
              let tempPrice = 0

              if(document.querySelector('[itemprop=price]') != null){ 
                  tempPrice = document.querySelector('[itemprop=price]').textContent
                  tempPrice = parseFloat(tempPrice.slice(1, tempPrice.length-4).replace(',' , ''))
              }
                  results.push({
                      name: document.querySelector('h1 [itemprop=name]').textContent,
                      sku: document.querySelector('h1 div').textContent,
                      price: tempPrice,
                  })
                  return results
          }
      })
      if(data == null) {
          console.log(index)
          await page.close
      }
      else {
          //Database Queries
          var insertQuery = `INSERT INTO canAppl(sku,name,price,url,lpmod) VALUES('${data[0].sku}','${data[0].name}',${data[0].price},'${URL}', '2020-06-20')`
          var updateQuery = `UPDATE canAppl SET name='${data[0].name}', price=${data[0].price}, url='${URL}', lpmod='2020-06-20' WHERE sku='${data[0].sku}'`
          var getDbSku = await pool.query(`SELECT exists (SELECT 1 FROM canAppl WHERE sku='${data[0].sku}' LIMIT 1)`)

          if(getDbSku.rows[0].exists)
          {
              await pool.query(updateQuery)
          }
          else{
              await pool.query(insertQuery)
          }
          await page.close
      }
  } 
  catch (error) {
          console.error(error)
  }
}
