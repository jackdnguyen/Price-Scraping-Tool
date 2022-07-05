// Author: Jack Nguyen
// Purpose: Scrapes data from goemans.com
const puppeteer = require('puppeteer');
const urlArray = [];
const results = [];

let browser;

// Function Parameters: URL, Last Modified Date, Product num
// Scrapes Price, SKU, Product Name from Product URL
async function scrapeProduct(url, lastmod, i) {
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
        await page.close();
    } catch(e){
        console.log(e);
        page.close();
    } finally {
        console.log(obj);
    }
}
//scrapeProduct('https://www.goemans.com/home/kitchen/accessories/cooking/range/OW3001');

// Function runs through goemans.com/sitemap.xml to extract all of product URL's
async function sitemap(index){
    const browser = await puppeteer.launch({headless:true});
    try{
        const page = await browser.newPage();
        page.goto('https://www.goemans.com/sitemap.xml');
        page.setDefaultNavigationTimeout(0); // Sets navigation limit to inf
        await page.waitForNavigation({ // Wait until network is idle
            waitUntil: 'networkidle0',
        });
        // Loop: Extracts URL & lastmod from sitemap
        var i = index;
        for(var i;i<206;i++){
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

function printArray(){
    for(var i=0;i<Array.length;i++){
        console.log(Array[i].url);
    }
}

const timer = ms => new Promise(res => setTimeout(res, ms)) // Creates a timeout using promise
// Runs Scrape Product for each element in URL Array
async function scrape(){
    browser = await puppeteer.launch({headless: true});
    for(var i=0; i<urlArray.length;i++){
        scrapeProduct(urlArray[i].url, urlArray[i].lastmod, i);
        await timer(1400); // 1.4 second delay
    }
    await browser.close();
}

sitemap(106);
