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
var pageFlag = false;
var pageEnd= 0;
var flag = true;
var success = false;

// Extracts all products from Collections
async function scrape(index){
    try{

        const page = await browser.newPage();
        for(x=index; x<collections.length; x++){
            if(flag == true){ // If no error occured page = 1, else page = page where crashed
                pageNum = 1;
            }
            pageFlag = false;
            while(true){
                    console.log(`${collections[x]} Page: ${pageNum}`);
                    page.goto(`${collections[x]}?page=${pageNum}`, { waitUntil: 'domcontentloaded', timeout: 0 }).catch(e =>{
                        console.log(e);
                    });

                    await page.waitForNavigation("networkidle2").catch(e =>{
                        console.log(e);
                    });
                    // div.pi-products > div > div.product-tile-content-block > div.pi-product-desc-name
                    let name = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll("div.pi-products > div > div.product-tile-content-block > div.pi-product-desc-name"), 
                        el =>  el.textContent);
                    });
                    if(name.length == 0){
                        break;
                    }
                    let prices = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll("td.pi-price-final > div > div > a"), 
                        el =>  el.textContent);
                    });
                    if(prices.length == 0){
                        prices = await page.evaluate(() => {
                            return Array.from(document.querySelectorAll("td.pi-price-final > div > a"), 
                            el =>  el.textContent);
                        });
                    }
                    let skuData = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll("div.product-tile-title-block > h2 > a"), 
                        el =>  el = {sku:el.textContent, url:el.href});
                    });
                    let pageData = await page.evaluate(() => {
                        return Array.from(document.querySelectorAll("div.pagination > a"), 
                        el =>  parseInt(el.textContent));
                    });
                    if(pageData.length == 0){
                        pageEnd = 1;
                        pageFlag = true;
                    }else if(!pageFlag){
                        pageEnd =pageData[pageData.length-2];
                        pageFlag = true;
                    }

                    // #sort_results > div.pi-products > div:nth-child(19) > div.product-tile-price-block > table > tbody > tr > td > div
                    if(name.length != prices.length){
                        let nullPrice = await page.evaluate(() => {
                            return Array.from(document.querySelectorAll("div.sres_price"), 
                            el =>  el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute('data-href'));
                        });
                        let urlArray = [];
                        for(var i=0;i<skuData.length;i++){
                            urlArray.push(skuData[i].url);
                        }
                        for(var j=0;j<nullPrice.length;j++){
                            let index = urlArray.indexOf(nullPrice[j]);
                            prices.splice(index,0,'0');
                        }
                        if(name.length != prices.length){
                            let nullPrice2 = await page.evaluate(() => {
                                return Array.from(document.querySelectorAll("div.product-not-for-sale"), 
                                el =>  el.parentNode.parentNode.getAttribute('data-href'));
                            });
                            for(var j=0;j<nullPrice2.length;j++){
                                let index = urlArray.indexOf(nullPrice2[j]);
                                prices.splice(index,0,'0');
                            }
                        }
                        // console.log(nullPrice);  #sort_results > div.pi-products > div:nth-child(27) > div.product-tile-price-block > div.product-not-for-sale
                    }
                    for(var i=0; i<name.length;i++){
                        let skuArray = skuData[i].sku.split(" ");
                        let modifiedName = skuArray[0] + " " + name[i].replace(/[\r\n]/gm, ' ').trim();  
                        modifiedName = modifiedName.replace(/[^a-z0-9,.\-\" ]/gi, '');
                        let url = skuData[i].url;
                        let price = prices[i].replace(/\$|,/g, '');
                        let sku = skuArray[skuArray.length-1];      

                        //Database Queries
                        const searchQuery = await knex.select('sku').from('canAppl').whereRaw('sku = ?', sku);
                        

                        var time = new Date().toLocaleString();

                        if(searchQuery.length != 0){
                            await knex.update({name: modifiedName, price: price, url: url, lpmod: time}).where({sku: sku}).from('canAppl');
                        }
                        else{
                            await knex.insert({company_name: 'Canadian Appliance', sku: sku, name: modifiedName, price: price, url: url, lpmod: time}).into('canAppl');
                        }

                        results.push(url);
                        productNum++;
                    }
                    console.log(`Canadian Appliance Product: ${productNum}`);
                    flag = true;
                    await timer(1400);
                    if(pageNum == pageEnd){
                        break;
                    }
                    pageNum++;
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
// 11931 Products in Collections 7/20/2021
// sitemap();
// Scrapes All Product Url's from Sitemap 
async function scrapCanAppl(){
    try{
        const browserSiteMap = await puppeteer.launch({headless:true, args: ['--no-sandbox']});
        const page = await browserSiteMap.newPage();
        for(var i=1; i<4; i++){
            page.goto(`https://www.canadianappliance.ca/sitemaps/sitemap-${i}.xml`);
            page.setDefaultNavigationTimeout(0); // Sets navigation limit to inf
            await page.waitForNavigation({ // Wait until network is idle
                waitUntil: 'networkidle0',
            });
            let element = await page.evaluate(() => {
                // Selects all products in the container, el=>el.textContent makes each element textContent of product data
                return Array.from(document.querySelectorAll(".pretty-print .folder .folder .opened div:nth-child(2) span:nth-child(2)"), el => el.textContent);
            });
            for(var i=0; i<element.length; i++){
                const urlSplit = element[i].split(".");
                if(urlSplit[urlSplit.length-1] == 'html'){
                    if(!element[i].includes("Reviews") && !element[i].includes("fr-CA")){
                        products.push(element[i]);
                        //fr-CA
                    }
                }
            }
        }
        browserSiteMap.close();
    }catch(e){
        console.log(e);
    } finally {
        console.log("Scraped Canadian Appliance's Sitemap");
        console.log(`Products: ${products.length}`);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'] // '--single-process', '--no-zygote', 
          });
        scrapeLoop(0); // Runs ScrapeLoop
    }
}
// sitemap();

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
            console.log("Something went wrong, Resuming");
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
            let individualScrape = await scrapeProduct(additionalProducts[x]);
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
        get("http://localhost:5000/canApplSuccess");
        console.log("Canadian Appliance Scraped Successfully.");
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
            if(document.querySelector('.pd-brand [itemprop="name"]') == null)
                return
            else {
                let results = []
                let tempPrice = 0

                if(document.querySelector('[itemprop=price]') != null){ 
                    tempPrice = document.querySelector('[itemprop=price]').textContent
                    tempPrice = parseFloat(tempPrice.slice(1, tempPrice.length-4).replace(',' , ''))
                }
                    results.push({
                        name: document.querySelector('.pd-brand [itemprop="name"]').content,
                        sku: document.querySelector('[itemprop="sku"]').content,
                        price: tempPrice,
                    })
                    return results
            }
        })
        if(data == null) {
            // console.log(index)
            await page.close()
        }
        else {
            //Database Queries
            let name = data[0].name;
            name = name.replace(/[^a-z0-9,.\-\" ]/gi, '');

            const searchQuery = await knex.select('sku').from('canAppl').whereRaw('sku = ?', data[0].sku);

            var time = new Date().toLocaleString();
            if(searchQuery.length != 0){
                await knex.update({name: name, price: data[0].price, url: URL, lpmod: time}).where({sku: data[0].sku}).from('canAppl');
            }
            else{
                await knex.insert({company_name: 'Canadian Appliance', sku: data[0].sku, name: name, price: data[0].price, url: URL, lpmod: time}).into('canAppl');
            }
            
            productNum++;
            console.log(`Canadian Appliance Product: ${productNum}`);

            await page.close()
            return true;
        }
    } 
    catch (error) {
            console.error(error)
            return false;
    }
}

function canApplCounter(){
    return productNum;
}

module.exports = {scrapCanAppl, canApplCounter};

const collections = [
    'https://www.canadianappliance.ca/Refrigerators-And-Fridges-3/Full-Size-Refrigerators-38/French-Door-Refrigerators-48/',
    'https://www.canadianappliance.ca/Refrigerators-And-Fridges-3/Full-Size-Refrigerators-38/Side-by-Side-Refrigerators-46/',
    'https://www.canadianappliance.ca/Refrigerators-And-Fridges-3/Full-Size-Refrigerators-38/Bottom-Mount-Refrigerators-45/',
    'https://www.canadianappliance.ca/Refrigerators-And-Fridges-3/Full-Size-Refrigerators-38/Top-Mount-Refrigerators-44/',
    'https://www.canadianappliance.ca/Built-In/Refrigerators-And-Fridges-3/Full-Size-Refrigerators-38/',
    'https://www.canadianappliance.ca/Refrigerators-And-Fridges-3/Full-Size-Refrigerators-38/All-Refrigerator-50/',
    'https://www.canadianappliance.ca/Refrigerators-And-Fridges-3/Compact-Refrigeration-40/',
    'https://www.canadianappliance.ca/Freezers-42/',
    'https://www.canadianappliance.ca/Cooktops-and-Stove-Tops-17/',
    'https://www.canadianappliance.ca/Wall-Ovens-19/',
    'https://www.canadianappliance.ca/Microwave-Ovens-20/',
    'https://www.canadianappliance.ca/Wall-Ovens-19/Microwave-Wall-Ovens-32/',
    'https://www.canadianappliance.ca/Under-Cabinet/Ventilation-Range-Hoods-18/',
    'https://www.canadianappliance.ca/Ventilation-Range-Hoods-18/',
    'https://www.canadianappliance.ca/Dishwashers-4/',
    'https://www.canadianappliance.ca/Washers-And-Washing-Machines-66/',
    'https://www.canadianappliance.ca/Washers-And-Washing-Machines-66/Washer-and-Dryer-Sets-215/',
    'https://www.canadianappliance.ca/Product-Accessories-232/Laundry-Accessories-92/',
    'https://www.canadianappliance.ca/Dryers-67/',
    'https://www.canadianappliance.ca/BBQ-Grills-7/',
    'https://www.canadianappliance.ca/Product-Accessories-232/BBQ-Accessories-252/',
];
