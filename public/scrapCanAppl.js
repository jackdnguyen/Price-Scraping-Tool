const puppeteer = require('puppeteer');
const { get } = require('http');
const knex = require('../knex.js');
const { cp } = require('fs');

let browser;
let browser2;

const timer = ms => new Promise(res => setTimeout(res, ms)) // Creates a timeout using promise
var collectionSKU = [];
var results = [];
var products = [];
var productsSKU = [];
var additionalProducts = [];

var productNum = 0;
var x = 0;
var pageNum = 1;
var flag = true;
var success = false;

// Extracts all products from Collections
async function scrape(index){
    try{
        const page = await browser.newPage();
        for(x=index; x<collections.length; x++){
            if(flag == true){
                pageNum = 1;
            }
            while(true){
                    console.log(`${collections[x]} Page: ${pageNum}`);
                    page.goto(`${collections[x]}?page=${pageNum}&features=%7B%7D`, { waitUntil: 'domcontentloaded', timeout: 0 }).catch(e =>{
                        console.log(e);
                    });

                    await page.waitForSelector('#products-list-container');

                    let prices = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll("#products-list-container .catalogue__list-item"), 
                        el =>  el = {price: parseFloat(el.getAttribute("data-price")), name: el.getAttribute("data-name"), brand: el.getAttribute("data-brand"), sku: el.getAttribute("data-model-number")});
                    });  

                    if(prices.length === 0){
                        break;
                    }

                    let url = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll("#products-list-container > div > div > .catalogue__item-model"), el => el.href);
                    });   

                    // console.log(prices.length)
                    for(var i=0; i< prices.length ; i++){
                        prices[i].name = prices[i].brand + " - " + prices[i].name;

                        prices[i].name = prices[i].name.replace(/[^a-z0-9,.\-\" ]/gi, '')
                        let skuSplit = url[i].split("/");
                        let sku = skuSplit[skuSplit.length-1];
                        //Database Queries
                        const searchQuery = await knex.select('sku').from('goemans').whereRaw('sku = ?', prices[i].sku);

                        var time = new Date().toLocaleString();

                        if(searchQuery.length != 0){
                            await knex.update({name: prices[i].name, price: prices[i].price, url: url[i], lpmod: time}).where({sku: prices[i].sku}).from('goemans');
                        }
                        else{
                            await knex.insert({company_name: 'Goemans', sku: prices[i].sku, name: prices[i].name, price: prices[i].price, url: url[i], lpmod: time}).into('goemans');
                        }
                        results.push(url[i].toString());
                        collectionSKU.push(sku);
                        productNum++;
                    }
                    console.log(`Goemans Product ${productNum}`);
                    pageNum++;
                    flag = true;
                    await timer(1400);
            }
        }
        browser.close();
        return true;
    }catch(e){
        console.log(e); // Timed Out
        console.log(x);
        flag = false;
        return false;
    }
}
// 11931 Products in Collections 7/20/2021

// Scrapes All Product Url's from Sitemap 
async function scrapGoemans(){
    try{
        const browserSiteMap = await puppeteer.launch({headless:true, args: ['--no-sandbox']});
        const page = await browserSiteMap.newPage();
        page.goto('https://www.goemans.com/sitemap.xml');
        page.setDefaultNavigationTimeout(0); // Sets navigation limit to inf
        await page.waitForNavigation({ // Wait until network is idle
            waitUntil: 'networkidle0',
        });
        let element = await page.evaluate(() => {
            // Selects all products in the container, el=>el.textContent makes each element textContent of product data
            return Array.from(document.querySelectorAll(".pretty-print .folder .folder .opened div:nth-child(2) span:nth-child(2)"), el => el.textContent);
        });
        for(var i=0; i<element.length; i++){
            const urlSplit = element[i].split("/");
            const sku = urlSplit[urlSplit.length-1]
            if(sku != ''){ // If URL is a product push into products
                products.push(element[i]);
                productsSKU.push(sku);
            }
        }
        browserSiteMap.close();
    }catch(e){
        console.log(e);
    } finally {
        console.log("Scraped Goeman's Sitemap");
        console.log(`Products: ${products.length}`);
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'] // '--single-process', '--no-zygote', 
          });
        scrapeLoop(0); // Runs ScrapeLoop
        // checkCount();
    }
}
// scrapGoemans();

async function scrapeLoop(collectionIndex){
    try{
        var scraper = await scrape(collectionIndex);
        if(scraper == true){ // if scraped collections successfully, continue
            success = true;
            browser.close();
            console.log("Collection's Scraped Successfully")
            missingProducts(); // Scrapes Missing Products
        } else{ // else re-scrape last collection index
            if(pageNum == 1){
                x++;
            }
            const pages = await browser.pages();
            for(const page of pages) await page.close();

            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox'] // '--single-process', '--no-zygote', 
            });
            await timer(4000);
            console.log("Goemans: Something went wrong, Resuming");
            scrapeLoop(x);
        }
    } catch(e){
        console.log(e);
    }
}

// Finds the missing products, if result array does not have url's from sitemap
async function missingProducts(){
    try{
        browser2 = await puppeteer.launch({headless: true, args: ['--no-sandbox']}); // Launch New Browser for additional products
        for(var i=0; i<products.length;i++){
            if(results.includes(products[i]) == false){ // If results does not have product, push into additionalProducts Array
                if(collectionSKU.includes(productsSKU[i]) == false){
                    additionalProducts.push(products[i]);
                }
            }
        }
        console.log(`Additional Products to Scrape: ${additionalProducts.length}`);
        for(var x=0;x<additionalProducts.length;x++){ // Scrape Additonal Products
            scrapeProduct(additionalProducts[x]);
            await timer(1600);
        }
        await timer(20000);
        const pages = await browser2.pages();
        for(const page of pages) await page.close();
        await browser2?.close();
        get("http://localhost:5000/goemanSuccess");
    }catch(e){
        console.log(e);
    }
}
// Scrapes Singular Product Item
async function scrapeProduct(url) {
    try{
        browser2 = await puppeteer.launch({headless: true, args: ['--no-sandbox']}); // Launch New Browser for additional products
        let substring = "packages";
        if(url.indexOf(substring) !== -1){
            return;
        }
        const urlSplit = url.split("/");
        const sku = urlSplit[urlSplit.length-1]
        // Set-up return object
        var obj = {
            name:'',
            sku:`${sku}`,
            url:`${url}`,
            lastmod:`${new Date().toISOString().slice(0, 10)}`,
            price:''
        };
        const page = await browser2.newPage();
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
            waitUntil: 'domcontentloaded'
            //remove timout
            // timeout: 0
        }).catch(e =>{
            console.log(e);
            return false;
        });
        process.setMaxListeners(Infinity); // Sets Max Listeners to Inf
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
            obj.name = obj.name.replace(/[^a-z0-9,.\-\" ]/gi, '');

            //Database Queries
            const searchQuery = await knex.select('sku').from('goemans').whereRaw('sku = ?', obj.sku);


            var time = new Date().toLocaleString();

            if(searchQuery.length != 0){
                await knex.update({name: obj.name, price: obj.price, url: url, lpmod: time}).where({sku: obj.sku}).from('goemans');
            }
            else{
                await knex.insert({company_name: 'Goemans', sku: obj.sku, name: obj.name, price: obj.price, url: url, lpmod: time}).into('goemans');
            }

            productNum++;
            console.log(`Goemans Product: ${productNum}`);
            await page.close();
            return true;
    }catch(e){
        productNum--;
        console.log(e);
        return false;
    }
}

function goemansCount(){
    return productNum;
}

module.exports = { scrapGoemans, goemansCount };

const collections = [
    'https://www.goemans.com/home/kitchen/cooking/range/gas/', 
    'https://www.goemans.com/home/kitchen/cooking/range/electric/', 
    'https://www.goemans.com/home/kitchen/cooking/range/induction/',
    'https://www.goemans.com/home/kitchen/cooking/range/dual-fuel/',
    'https://www.goemans.com/home/kitchen/cooking/cooktop/gas/',
    'https://www.goemans.com/home/kitchen/cooking/cooktop/electric/',
    'https://www.goemans.com/home/kitchen/cooking/cooktop/induction/',
    'https://www.goemans.com/home/kitchen/cooking/oven/electric/',
    'https://www.goemans.com/home/kitchen/cooking/oven/steam/',
    'https://www.goemans.com/home/kitchen/cooking/ventilation/wall-mount/',
    'https://www.goemans.com/home/kitchen/cooking/ventilation/island-chimney/',
    'https://www.goemans.com/home/kitchen/cooking/ventilation/downdraft/',
    'https://www.goemans.com/home/kitchen/cooking/ventilation/blower/',
    'https://www.goemans.com/home/kitchen/cooking/ventilation/hood-inserts/',
    'https://www.goemans.com/home/kitchen/cooking/ventilation/under-cabinet-hood/',
    'https://www.goemans.com/home/kitchen/cooking/microwave/counter-top/',
    'https://www.goemans.com/home/kitchen/cooking/microwave/over-the-range/',
    'https://www.goemans.com/home/kitchen/cooking/microwave/drawer/',
    'https://www.goemans.com/home/kitchen/cooking/microwave/built-in/',
    'https://www.goemans.com/home/kitchen/cooking/small-appliances/specialty-products-cookware/',
    'https://www.goemans.com/home/kitchen/cooking/warming-drawer/warming-drawer/',
    'https://www.goemans.com/home/kitchen/cooking/cookware-bakeware/cookware/',
    'https://www.goemans.com/home/kitchen/cooking/cooking-accessories/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/french-door/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/side-by-side/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/bottom-mount/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/top-mount/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/built-in/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/column/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/under-counter/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/wine-cooler/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/wine-reserve/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/free-standing/',
    'https://www.goemans.com/home/kitchen/refrigeration/fridges/counter-depth/',
    'https://www.goemans.com/home/kitchen/refrigeration/freezer/chest/',
    'https://www.goemans.com/home/kitchen/refrigeration/freezer/frost-free-upright/',
    'https://www.goemans.com/home/kitchen/refrigeration/freezer/manual-defrost-upright/',
    'https://www.goemans.com/home/kitchen/refrigeration/freezer/column/',
    'https://www.goemans.com/home/kitchen/refrigeration/freezer/ice-maker/',
    'https://www.goemans.com/home/kitchen/refrigeration/refrigeration-accessories/',
    'https://www.goemans.com/home/kitchen/dishwasher/front-control/',
    'https://www.goemans.com/home/kitchen/dishwasher/top-control/',
    'https://www.goemans.com/home/kitchen/dishwasher/integrated-panel/',
    'https://www.goemans.com/home/kitchen/dishwasher/drawer/',
    'https://www.goemans.com/home/kitchen/dishwasher/portable/',
    'https://www.goemans.com/home/kitchen/dishwasher/dishwasher-accessories/',
    'https://www.goemans.com/home/laundry/washer/top-load/',
    'https://www.goemans.com/home/laundry/washer/front-load/',
    'https://www.goemans.com/home/laundry/dryer/gas/',
    'https://www.goemans.com/home/laundry/dryer/electric/',
    'https://www.goemans.com/home/laundry/dryer/steam-closet/',
    'https://www.goemans.com/home/laundry/washerdryer-combo/',
    'https://www.goemans.com/home/laundry/pedestals/',
    'https://www.goemans.com/home/laundry/laundry-accessories/',
    'https://www.goemans.com/home/kitchen/outdoor/freestanding-grills/natural-gas/',
    'https://www.goemans.com/home/kitchen/outdoor/freestanding-grills/propane/',
    'https://www.goemans.com/home/kitchen/outdoor/freestanding-grills/charcoal-pellet/',
    'https://www.goemans.com/home/kitchen/outdoor/outdoor-kitchens/natural-gas-built-in/',
    'https://www.goemans.com/home/kitchen/outdoor/outdoor-kitchens/propane-built-in/',
    'https://www.goemans.com/home/kitchen/outdoor/outdoor-kitchens/outdoor-kitchen-components/',
    'https://www.goemans.com/home/kitchen/outdoor/outdoor-kitchens/outdoor-refrigeration/',
    'https://www.goemans.com/home/kitchen/outdoor/outdoor-kitchens/patio-heater/',
    'https://www.goemans.com/home/kitchen/outdoor/outdoor-kitchens/pizza-oven/',
    'https://www.goemans.com/home/kitchen/outdoor/outdoor-accessories/',
    'https://www.goemans.com/home/kitchen/home-essentials/specialty-products-cookware/',
    'https://www.goemans.com/home/kitchen/home-essentials/counter-top-appliances/',
    'https://www.goemans.com/home/kitchen/home-essentials/vacuums/',
    'https://www.goemans.com/home/kitchen/home-essentials/coffee/built-in/',
    'https://www.goemans.com/home/kitchen/home-essentials/coffee/free-standing-coffee/',
    'https://www.goemans.com/home/kitchen/accessories/bbq/bbq-accessories/',
    'https://www.goemans.com/home/kitchen/accessories/bbq/bbq-and-fireplace-parts/',
    'https://www.goemans.com/home/kitchen/accessories/bbq/built-in/',
    'https://www.goemans.com/home/kitchen/accessories/cooking/range/',
    'https://www.goemans.com/home/kitchen/accessories/cooking/oven/',
    'https://www.goemans.com/home/kitchen/accessories/cooking/microwave/',
    'https://www.goemans.com/home/kitchen/accessories/cooking/cooktop/',
    'https://www.goemans.com/home/kitchen/accessories/cooking/pizza-oven/',
    'https://www.goemans.com/home/kitchen/accessories/cooking/coffee/',
    'https://www.goemans.com/home/kitchen/accessories/refrigeration/freestanding-fridge/',
    'https://www.goemans.com/home/kitchen/accessories/refrigeration/under-counter/',
    'https://www.goemans.com/home/kitchen/accessories/refrigeration/filters/',
    'https://www.goemans.com/home/kitchen/accessories/refrigeration/refrigeration-built-in/',
    'https://www.goemans.com/home/kitchen/accessories/ventilation/',
    'https://www.goemans.com/home/kitchen/accessories/laundry/washerdryer/',
    'https://www.goemans.com/home/kitchen/accessories/dishwasher/'
];
