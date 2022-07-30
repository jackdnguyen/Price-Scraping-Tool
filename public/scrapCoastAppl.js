require("dotenv").config();
const puppeteer = require('puppeteer');
const { Pool } = require('pg')
const { get } = require('http');

var productNum = 0;
var x = 0;
var pageNum = 1;
var success = false;
var flag = true;

const urlArray = [];
const allProducts = [];
const results = [];
var additionalProducts = [];

let browser;
let browser2;


var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //     rejectUnauthorized: false
    //   }
})

const lastmod = new Date().toLocaleString('en-CA', {
    timeZone: 'America/Los_Angeles',
  });

const timer = ms => new Promise(res => setTimeout(res, ms)) // Creates a timeout using promise

async function scrape(index){
    try{
        const page = await browser.newPage();
        // For each collection in coast appliances
        for(x=index; x< urlArray.length; x++){
            let url = urlArray[x];
            if(flag == true){ // If no error occured page = 1, else page = page where crashed
                pageNum = 1;
            }
        // While: Sifts through pages until no product is found
            while(true){
                console.log(`${url} Page: ${pageNum}`);
                page.goto(`${url}?page_num=${pageNum}`, { waitUntil: 'domcontentloaded', timeout: 0 }).catch(e =>{
                    console.log(e);
                    return false;
                });
                //page.goto('https://www.coastappliances.ca/collections/single-wall-ovens?narrow=%5B%5B%22Brand%22%2C%22MIELE%22%5D%5D');

                // await page.waitForSelector('#isp_search_results_container li .isp_product_info');
                await page.waitForNavigation({ // Wait until network is idle
                    waitUntil: 'networkidle2',
                }).catch(e =>{
                    console.log(e);
                    return false;
                });
                
                // Element = Array of textContent with product data
                let element = await page.evaluate(() => {
                    // Selects all products in the container, el=>el.textContent makes each element textContent of product data
                    return Array.from(document.querySelectorAll("#isp_search_results_container li .isp_product_info"), el => el.textContent);
                });
                // If there are no products in the container, break loop
                // console.log(element.length);
                if(element.length === 0){
                    break;
                }

                // urlEl = array of url's extracted
                let urlEl = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll("#isp_search_results_container li .isp_product_image_wrapper a"), el => el.href);
                });
                // Extract data from textContent String for each element in Array
                for(var i=0; i<element.length;i++){
                    let nameSplit = element[i].split('-');
                    let brand = nameSplit[0].trim();
                    let name = nameSplit[1].trim();
                    name = brand + " - " + name;
                    name = name.replace(/[^a-z0-9,.\-\" ]/gi, '');
                    let priceSplit = element[i].split("$");
                    let price;
                    if(priceSplit.length === 4){
                        price = parseFloat(priceSplit[2]);
                    } else if(priceSplit.length === 2){
                        price = parseFloat(priceSplit[1]);
                    } else{
                        price = 0;
                    }
                    let skuSplit = priceSplit[0].split(':');
                    let sku = skuSplit[1].trim();
                    if(brand === 'Miele'){
                        skuSplit = element[i].split("MIELE");
                        sku = skuSplit[0].split("-");
                        sku = sku[2].trim();
                    }
                    let urlSplit = urlEl[i].split('products');
                    let urlData = "https://www.coastappliances.ca/products" + urlSplit[1];
                    results.push(urlData);
                    // console.log(`Product ${productNum} { Name:` + name + ", Price:" + price + ", SKU:" + sku + " }");
                    // console.log(urlEl[i]);
                    // console.log("");
                    productNum++;
                    //console.log(element[i]);

                    
                    // Database Queries
                    var insertQuery = `INSERT INTO coastAppl(sku,name,price,url,lpmod) VALUES('${sku}','${name}',${price},'${urlEl[i]}','${lastmod}')`
                    var updateQuery = `UPDATE coastAppl SET name='${name}', price=${price}, url='${urlData}', lpmod='${lastmod}' WHERE sku='${sku}'`
                    var getDbSku = await pool.query(`SELECT exists (SELECT 1 FROM coastAppl WHERE sku='${sku}' LIMIT 1)`)
                    //await pool.query(insertQuery)
                    if(getDbSku.rows[0].exists)
                    {
                        await pool.query(updateQuery)
                    }
                    else{
                        await pool.query(insertQuery)
                    }
                }
                console.log(`Coast Appliance: ${productNum} Products`);
                // Break if only 1 page
                let pageEl = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll("#isp_pagination_anchor > ul li"), el => el.textContent);
                });
                if(pageEl.length === 0){
                    break;
                }

                pageNum++; // Increment page
                flag = true;
                await timer(1400); // Timer for 1.4s
            }
        }
        page.close();
        return true;
    }catch(e){
        console.log(e); // Timed Out
        flag = false; // Saves page num
        console.log(x);
        return false;
    }

}
//scrape();
// 43 collections
// scrapCoastAppl();
// Function runs through sitemap_collections to extract all of product URL's
async function scrapCoastAppl(){
    const browser = await puppeteer.launch({headless:true, args: ['--no-sandbox']});
    try{
        const page = await browser.newPage();
        page.goto('https://www.coastappliances.ca/sitemap_collections_1.xml');
        page.setDefaultNavigationTimeout(0); // Sets navigation limit to inf
        await page.waitForNavigation({ // Wait until network is idle
            waitUntil: 'networkidle0',
        });
        // Loop: Extracts URL & lastmod from sitemap
        for(var i = 3; i< 52;i++){
            // Extracts url 
            await page.waitForSelector(`#folder${i} > div.opened > div:nth-child(2) > span:nth-child(2)`, { // Wait for selector to laod
                visible: true,
            });
            const [el] = await page.$$(`#folder${i} > div.opened > div:nth-child(2) > span:nth-child(2)`);
            const txt = await el.getProperty('innerText');
            const url = await txt.jsonValue();
            // Create Object and push into Url Array
            let obj = {
                url:`${url}`,
                lastmod:`${lastmod}`,
            }
            urlArray.push(url);
        }
    } catch(e) {
        console.log(e);
    } finally {
        console.log("CoastAppliance: Scraped URLs");
        await browser.close();
        scrapCoastProducts();
    }
}

// Scrapes All Product Url's from Sitemap 
async function scrapCoastProducts(){
    try{
        const browserSiteMap = await puppeteer.launch({headless:true, args: ['--no-sandbox']});
        const page = await browserSiteMap.newPage();
        page.goto('https://www.coastappliances.ca/sitemap_products_1.xml?from=6102831464611&to=7788642140323');
        page.setDefaultNavigationTimeout(0); // Sets navigation limit to inf
        await page.waitForNavigation({ // Wait until network is idle
            waitUntil: 'networkidle0',
        });
        let element = await page.evaluate(() => {
            // Selects all products in the container, el=>el.textContent makes each element textContent of product data
            return Array.from(document.querySelectorAll(".pretty-print .folder .opened .folder div.opened div:nth-child(2) span:nth-child(2)"), el => el.textContent);
        });
        // #folder3 > div.opened > div:nth-child(2) > span:nth-child(2)
        for(var i=0; i<element.length; i++){
            let condition = element[i].split('https://www.coastappliances.ca/');
            if(condition.length == 2){
                allProducts.push(element[i]);
            }
        }
        browserSiteMap.close();
    }catch(e){
        console.log(e);
    } finally {
        console.log("Scraped Coast's Product Sitemap");
        console.log(`Products on Sitemap: ${allProducts.length}`);
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'] // '--single-process', '--no-zygote', 
          });
        scrapeLoop(0); // Runs ScrapeLoop
    }
}

async function scrapeLoop(collectionIndex){
    try{
        var scraper = await scrape(collectionIndex);
        if(scraper == true){ // if scraped collections successfully, continue
            success = true;
            browser.close();
            console.log("Collection's Scraped Successfully")
            missingProducts(); // Scrapes Missing Products
        } else{ // else re-scrape last collection index
            const pages = await browser.pages();
            for(const page of pages) await page.close();

            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox'] // '--single-process', '--no-zygote', 
            });
            await timer(4000);
            console.log("Coast Appliance: Something went wrong, Resuming");
            scrapeLoop(x);
        }
    } catch(e){
        console.log(e);
    }
}
async function missingProducts(){
    try{
        browser2 = await puppeteer.launch({headless: true, args: ['--no-sandbox']}); // Launch New Browser for additional products
        for(var i=0; i<allProducts.length;i++){
            if(results.includes(allProducts[i]) == false){ // If results does not have product, push into additionalProducts Array
                additionalProducts.push(allProducts[i]);
            }
        }
        console.log(`Additional Products to Scrape: ${additionalProducts.length}`);
        for(var x=1;x<additionalProducts.length;x++){ // Scrape Additonal Products
            var individualScrape = await scrapeIndividual(additionalProducts[x]);
            if(individualScrape == false){
                const pages = await browser2.pages();
                for(const page of pages) await page.close();
                browser2 = await puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox'] // '--single-process', '--no-zygote', 
                });
            }
            await timer(1000);
        }
        await browser2?.close();
        get("http://localhost:5000/coastApplSuccess");
        console.log("Scraped Coastman's");
    }catch(e){
        console.log(e);
    }
}
// scrapeIndividual("hi");
async function scrapeIndividual(url){
    const page = await browser2.newPage();
    try{
        page.goto(`${url}`, { waitUntil: 'domcontentloaded', timeout: 0 }).catch(e =>{
            console.log(e);
        });
        // Product Name / Sku #shopify-section-product-template-unavailable > section > div.container.container--flush > div.product-block-list.product-block-list--small > div > div.product-block-list__item.product-block-list__item--info > div > div.card__section > div.product-meta > h1
        await page.waitForSelector("div.product-meta > h1").catch(e =>{
            console.log(e);
            return true;
        });
        let element = await page.$("div.product-meta > h1");
        let value = await page.evaluate(el => el.textContent, element)
        let splitText = value.split('-');
        let sku = splitText[splitText.length-1].trim();
        let name = value;
        name = name.replace(/[^a-z0-9,.\-\" ]/gi, '');
        let price;

        try{ // product-meta__title heading h1 product-h1
            // Extract Price            /html/body/main/div[2]/section/div[1]/div[2]/div/div[2]/div/div[2]/div[1]/h1
            const [el] = await page.$x('/html/body/main/div[2]/section/div[1]/div[2]/div/div[2]/div/div[2]/div[2]/div/div[1]/span[1]');
            const txt = await el.getProperty('innerText');
            const rawTxt = await txt.jsonValue();
            price = parseFloat(rawTxt.replace(/[^0-9.]/g, '')); // Turn price into integer value
        }catch(e){ // Price Doesn't exist
            price = 0;
        }
        // console.log(price);
        // console.log(sku);
        // console.log(name);
        // console.log(lastmod);
        // console.log(url);
        productNum++;
        console.log(`Coast Appliance: Product ${productNum}`);
        // Database Queries
        var insertQuery = `INSERT INTO coastAppl(sku,name,price,url,lpmod) VALUES('${sku}','${name}',${price},'${url}','${lastmod}')`
        var updateQuery = `UPDATE coastAppl SET name='${name}', price=${price}, url='${url}', lpmod='${lastmod}' WHERE sku='${sku}'`
        var getDbSku = await pool.query(`SELECT exists (SELECT 1 FROM coastAppl WHERE sku='${sku}' LIMIT 1)`)
        if(getDbSku.rows[0].exists)
        {
            await pool.query(updateQuery)
        }
        else{
            await pool.query(insertQuery)
        }
        await page.close();
        return true;
    } catch(e){
        console.log(e);
        console.log(url);
        return false;
    }
}
function coastApplCounter(){
    return productNum;
}

module.exports = { scrapCoastAppl, coastApplCounter };
