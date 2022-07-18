const puppeteer = require('puppeteer');
var productNum = 1;
const urlArray = [];

let browser;

const timer = ms => new Promise(res => setTimeout(res, ms)) // Creates a timeout using promise

async function scrape(){
    browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage();
    // For each collection in coast appliances
    for(let x=0; x< urlArray.length; x++){
        let url = urlArray[x];
        let pageNum = 1;
        // While: Sifts through pages until no product is found
        while(true){
            try{
                console.log(`${url} Page: ${pageNum}`);
                page.goto(`${url}?page_num=${pageNum}`);
                //page.goto('https://www.coastappliances.ca/collections/single-wall-ovens?narrow=%5B%5B%22Brand%22%2C%22MIELE%22%5D%5D');

                await page.waitForNavigation({waitUntil: 'networkidle2'});
                // Element = Array of textContent with product data
                let element = await page.evaluate(() => {
                    // Selects all products in the container, el=>el.textContent makes each element textContent of product data
                    return Array.from(document.querySelectorAll("#isp_search_results_container li .isp_product_info"), el => el.textContent);
                });
                // If there are no products in the container, break loop
                console.log(element.length);
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
                    console.log(`Product ${productNum} { Brand:` + brand + ", Name:" + name + ", Price:" + price + ", SKU:" + sku + " }");
                    console.log(urlEl[i]);
                    console.log("");
                    productNum++;

                    //console.log(element[i]);
                }

                // Break if only 1 page
                let pageEl = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll("#isp_pagination_anchor > ul li"), el => el.textContent);
                });
                if(pageEl.length === 0){
                    break;
                }

                pageNum++; // Increment page
                await timer(1.4); // Timer for 1.4s
            }catch(e){
                console.log(e);
                await timer(4);
            }
        }
    }
    page.close();
    browser.close();
}
//scrape();
// 43 collections

// Function runs through goemans.com/sitemap.xml to extract all of product URL's
async function sitemap(){
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
            urlArray.push(url);
        }
    } catch(e) {
        console.log(e);
    } finally {
        console.log("Scraped URLs");
        await browser.close();
        scrape(); // Run Scrape URL Function
    }
}

sitemap();