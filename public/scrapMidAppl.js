const puppeteer = require('puppeteer');
const { get } = require('http');
const knex = require('../knex.js');

let browser;
let browser2;

const timer = ms => new Promise(res => setTimeout(res, ms)) // Creates a timeout using promise

var results = [];
var products = [];
var additionalProducts = [];

var productNum = 0;
var x = 0;
var pageNum = 1;
var flag = true;
var success = false;

// Extracts all products from Collections
async function scrape(index){
    try{
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'] // '--single-process', '--no-zygote', 
          });
        const page = await browser.newPage();
        for(x=0; x<collections.length; x++){
            if(flag == true){ // If no error occured page = 1, else page = page where crashed
                pageNum = 1;
            }
            while(true){
                    console.log(`${collections[x]} Page: ${pageNum}`);
                    page.goto(`${collections[x]}?page=${pageNum}`, { waitUntil: 'domcontentloaded', timeout: 0 }).catch(e =>{
                        console.log(e);
                        return false;
                    });
                    // await page.waitForSelector("div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-9");
                    await page.waitForNavigation("networkidle2").catch(e =>{
                        console.log(e);
                    });
                    let prices = await page.evaluate(() => {      
                        return Array.from(document.querySelectorAll("#__next > div.jss1.jss2 > div > div:nth-child(5) > div > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-9 > div.MuiGrid-root.avb-typography.jss161.MuiGrid-container > div > div > article > div.jss171 > div.MuiBox-root > div:nth-child(3) > strong"),
                        el => el.textContent);
                    });
                    if(prices.length == 0){
                        break;
                    }  
                    let skuArray = await page.evaluate(() => {       
                        return Array.from(document.querySelectorAll("#__next > div.jss1.jss2 > div > div:nth-child(5) > div > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-9 > div.MuiGrid-root.avb-typography.jss161.MuiGrid-container > div > div > article > div.jss171 > span"),
                        el => el.textContent);
                    });  
                    let names = await page.evaluate(() => {       
                        return Array.from(document.querySelectorAll("#__next > div.jss1.jss2 > div > div:nth-child(5) > div > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-9 > div.MuiGrid-root.avb-typography.jss161.MuiGrid-container > div > div > article > div.jss171 > h3 > a"),
                        el => el = {name: el.textContent, url: el.href});
                    });  

                    for(var i=0; i< prices.length ; i++){
                        let skuSplit = skuArray[i].split(":");
                        let sku = skuSplit[skuSplit.length-1].trim();
                        let name = names[i].name.replace(/[^a-z0-9,.\-\" ]/gi, '');
                        let price;
                        if(prices[i] == ''){
                            price = 0;
                        } else{
                            price = parseFloat(prices[i].replace(/\$|,/g, ''));
                        }
                        results.push(names[i].url);

                        //Database Queries
                        const searchQuery = await knex.select('sku').from('midAppl').whereRaw('sku = ?', sku);


                        var time = new Date().toLocaleString();

                        if(searchQuery.length != 0){
                            await knex.update({name: name, price: price, url: names[i].url, lpmod: time}).where({sku: sku}).from('midAppl');
                        }
                        else{
                            await knex.insert({company_name: 'Midland Appliance', sku: sku, name: name, price: price, url: names[i].url, lpmod: time}).into('midAppl');
                        }                        
                        
                        productNum++;
                    }
                    console.log(`Midland Product: ${productNum}`);
                    pageNum++;
                    flag = true;
                    await timer(1400);
            }
        }
        browser.close();
        return true;
    }catch(e){
        console.log(e); // Timed Out
        flag = false; // Saves page num
        console.log(x);
        return false;
    }
}
// scrapMidAppl();
// Scrapes All Product Url's from Sitemap 
async function scrapMidAppl(){
    try{
        const browserSiteMap = await puppeteer.launch({headless:true, args: ['--no-sandbox']});
        const page = await browserSiteMap.newPage();
        page.goto('https://cdn.avbportal.com/magento-media/sitemaps/cn0122/sitemap.xml');
        page.setDefaultNavigationTimeout(0); // Sets navigation limit to inf
        await page.waitForNavigation({ // Wait until network is idle
            waitUntil: 'networkidle0',
        });
        let element = await page.evaluate(() => {
            // Selects all products in the container, el=>el.textContent makes each element textContent of product data
            return Array.from(document.querySelectorAll(".pretty-print .folder .folder .opened div:nth-child(2) span:nth-child(2)"), el => el.textContent);
        });
        for(var i=0; i<element.length; i++){
            if(element[i].includes("https://www.midlandappliance.com/product/")){ // If URL is a product push into products
                products.push(element[i]);
            }
        }
        browserSiteMap.close();
    }catch(e){
        console.log(e);
    } finally {
        console.log("Scraped Midland Appliance's Sitemap");
        console.log(`Products: ${products.length}`);
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
            console.log("Midland Appliance: Something went wrong, Resuming");
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
                additionalProducts.push(products[i]);
            }
        }
        console.log(`Additional Products to Scrape: ${additionalProducts.length}`);
        for(var x=0;x<additionalProducts.length;x++){ // Scrape Additonal Products
            var individualScrape = await scrapeProduct(products[x]);
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
        get("http://localhost:5000/midApplSuccess");
        console.log("Midland's Scraped Successfully")
    }catch(e){
        console.log(e);
    }
}

async function scrapeProduct(link) {  
    try {
        const URL = link
        const page = await browser2.newPage()

        await page.goto(URL, { 
            waitUntil: 'domcontentloaded',
            timeout: 0})

        await page.setRequestInterception(true)
        page.on('request', (request)=>{
            if (request.resourceType() == 'image' || request.resourceType() == 'stylesheet' || request.resourceType() == 'font' || request.resourceType() == 'script')
                request.abort()
            else
                request.continue()
        })

        let data = await page.evaluate(() => {
            if(document.querySelector("[data-analytics='product_details_name']") == null)
                return
            else {
                let results = []
                let tempPrice = document.querySelector("[data-analytics='product_details_price'] strong").innerHTML

                if(tempPrice != null && tempPrice != ""){ 
                    tempPrice = document.querySelector("[data-analytics='product_details_price'] strong").innerHTML
                    tempPrice = parseFloat(tempPrice.slice(1, tempPrice.length).replace(',', ''))
                }
                else
                {
                    tempPrice = 0;
                }

                results.push({
                    name: document.querySelector("[data-analytics='product_details_name']").innerHTML,
                    sku: document.querySelector('[data-analytics="product_details_model"]').innerHTML .slice(9),
                    price: tempPrice,
                })
                return results
            }
        })
        if(data == null) {
            await page.close()
        }
        else {
            // Database Queries
            let name = data[0].name;
            name = name.replace(/[^a-z0-9,.\-\" ]/gi, '');

            const searchQuery = await knex.select('sku').from('midAppl').whereRaw('sku = ?', data[0].sku);


            var time = new Date().toLocaleString();

            if(searchQuery.length != 0){
                await knex.update({name: name, price: data[0].price, url: URL, lpmod: time}).where({sku: data[0].sku}).from('midAppl');
            }
            else{
                await knex.insert({company_name: 'Midland Appliance', sku: data[0].sku, name: name, price: data[0].price, url: URL, lpmod: time}).into('midAppl');
            }            

            productNum++;
            console.log(`Midland Appliance Product: ${productNum}`);
            // console.log(data)
            await page.close()
            return true;
        }
    } 
    catch (error) {
        console.log(error);
        return false;
    }
}


function midApplCounter(){
    return productNum;
}
module.exports = { scrapMidAppl, midApplCounter };

const collections = [
    'https://www.midlandappliance.com/catalog/refrigerators',
    'https://www.midlandappliance.com/catalog/ranges',
    'https://www.midlandappliance.com/catalog/cooktops',
    'https://www.midlandappliance.com/catalog/rangetops',
    'https://www.midlandappliance.com/catalog/microwaves',
    'https://www.midlandappliance.com/catalog/wall-ovens',
    'https://www.midlandappliance.com/catalog/ventilation',
    'https://www.midlandappliance.com/catalog/laundry-accessories',
    'https://www.midlandappliance.com/catalog/washers',
    'https://www.midlandappliance.com/catalog/dryers',
    'https://www.midlandappliance.com/catalog/laundry-pairs',
    'https://www.midlandappliance.com/catalog/washer-dryer-combos',
    'https://www.midlandappliance.com/catalog/stackable-washers-and-dryers',
    'https://www.midlandappliance.com/catalog/drying-cabinets',
    'https://www.midlandappliance.com/catalog/appliances-commercial-laundry',
    'https://www.midlandappliance.com/catalog/dishwashers',
    'https://www.midlandappliance.com/catalog/freezers-and-ice-makers',
    'https://www.midlandappliance.com/catalog/free-standing-grill',
    'https://www.midlandappliance.com/catalog/built-in-grill',
    'https://www.midlandappliance.com/catalog/outdoor-smokers',
    'https://www.midlandappliance.com/catalog/outdoor-range-hoods',
    'https://www.midlandappliance.com/catalog/side-burner',
    'https://www.midlandappliance.com/catalog/outdoor-warming-drawer',
    'https://www.midlandappliance.com/catalog/outdoor-refrigeration',
    'https://www.midlandappliance.com/catalog/outdoor-modular-cabinets-storage',
    'https://www.midlandappliance.com/catalog/outdoor-kitchen-plumbing',
    'https://www.midlandappliance.com/catalog/outdoor-kitchen-kits',
    'https://www.midlandappliance.com/catalog/outdoor-kitchen-installation-components',
    'https://www.midlandappliance.com/catalog/coolers',
    'https://www.midlandappliance.com/catalog/outdoor-patio-heaters',
    'https://www.midlandappliance.com/catalog/coffee-espresso-makers',
    'https://www.midlandappliance.com/catalog/fryers',
    'https://www.midlandappliance.com/catalog/countertop-oven',
    'https://www.midlandappliance.com/catalog/toaster',
    'https://www.midlandappliance.com/catalog/blenders',
    'https://www.midlandappliance.com/catalog/kitchen-appliance-packages',
    'https://www.midlandappliance.com/catalog/air-conditioners'
];
