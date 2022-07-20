const puppeteer = require('puppeteer');

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

// Extracts all products from Collections
async function scrape(index){
    try{
        browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
        const page = await browser.newPage();
        for(x=index; x<1; x++){
            if(flag){ // If no error occured page = 1, else page = page where crashed
                pageNum = 1;
            }
            while(true){
                console.log(`${collections[x]} Page: ${pageNum}`);
                page.goto(`${collections[x]}?page=${pageNum}&features=%7B%7D`);
                
                page.setDefaultNavigationTimeout(60000); // Sets navigation limit to 1 minute

                await page.waitForNavigation({waitUntil: 'networkidle2'});

                let prices = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll("#products-list-container .catalogue__list-item"), 
                    el =>  el = {price: parseFloat(el.getAttribute("data-price")), name: el.getAttribute("data-name"), brand: el.getAttribute("data-brand"), SKU: el.getAttribute("data-model-number")});
                });  

                if(prices.length === 0){
                    break;
                }

                let url = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll("#products-list-container > div > div > .catalogue__item-model"), el => el.href);
                });   

                // console.log(prices.length)
                for(var i=0; i< prices.length ; i++){
                    console.log(`Product ${productNum}`);
                    // console.log(prices[i]);
                    // console.log(url[i]);
                    results.push(url[i].toString());
                    // console.log('');
                    productNum++;
                }
                pageNum++;
                await timer(1.4);
            }
        }
        missingProducts();
        // page.close();
        browser.close();
    }catch(e){
        console.log(e); // Timed Out
        flag = false; // Saves page num
        //scrape(x);
        console.log(x);
        missingProducts(); // Find missing products
    }
}
// 11931 Products in Collections 7/20/2021

// Scrape Sitemap Test
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
            }
        }
        browserSiteMap.close();
    }catch(e){
        console.log(e);
    } finally {
        console.log("Scraped Goeman's Sitemap");
        console.log(`Products: ${products.length}`);
        scrape(0);
    }
}
// scrapGoemans();

// Finds the missing products, if result array does not have url's from sitemap
async function missingProducts(){
    browser2 = await puppeteer.launch({headless: true, args: ['--no-sandbox']}); // Launch New Browser for additional products
    for(var i=0; i<products.length;i++){
        if(results.includes(products[i]) == false){ // If results does not have product, push into additionalProducts Array
            additionalProducts.push(products[i]);
        }
    }
    console.log(`Additional Products to Scrape: ${additionalProducts.length}`);
    for(var x=0;x<additionalProducts.length;x++){ // Scrape Additonal Products
        var wait = await scrapeProduct(additionalProducts[x]);
        if(x % 50 == 0){
            await timer(3000);
        }
    }
    await browser2.close();
}

// Scrapes Singular Product Item
async function scrapeProduct(url) {
    try{
        // Retrieves SKU from URL
        const urlSplit = url.split("/");
        const sku = urlSplit[urlSplit.length-1]
        if(sku == ''){ // If URL is not a product exit
            return;
        }
        // Set-up return object
        var obj = {
            name:'',
            sku:`${sku}`,
            url:`${url}`,
            lastmod:``,
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
            // var insertQuery = `INSERT INTO goemans(sku,name,price,url,lpmod) VALUES('${obj.sku}','${obj.name}',${obj.price},'${url}', '')`
            // var updateQuery = `UPDATE goemans SET name='${obj.name}', price=${obj.price}, url='${url}', lpmod='' WHERE sku='${obj.sku}'`
            // var getDbSku = await pool.query(`SELECT exists (SELECT 1 FROM goemans WHERE sku='${obj.sku}' LIMIT 1)`)
            //await pool.query(insertQuery)
            // if(getDbSku.rows[0].exists)
            // {
            //     await pool.query(updateQuery)
            // }
            // else{
            //     await pool.query(insertQuery)
            // }
            productNum++;
            await page.close();
        } catch(e){
            console.log(e);
            page.close();
        } finally {
            console.log(productNum);
            console.log(obj);
        }
    }catch(e){
        console.log(e);
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
    'https://www.goemans.com/home/kitchen/refrigeration/dual-refrigeration-pairs/',
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
    'https://www.goemans.com/home/packages/kitchen-packages/',
    'https://www.goemans.com/home/packages/laundry-packages/',
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
