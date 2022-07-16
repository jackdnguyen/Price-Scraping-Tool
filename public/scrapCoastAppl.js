const { product } = require('puppeteer');
const puppeteer = require('puppeteer');

var productNum = 1;
const urlArray = [];

let browser;

async function scrape(){
    browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage();

    //let pageNum = 1;
    //let collection = 'front-load-washers';

    for(let x=0; x< urlArray.length; x++){
        let url = urlArray[x];
        let pageNum = 1;
        while(true){
            //console.log(url);
            page.goto(`${url}?page_num=${pageNum}`);

            await page.waitForNavigation({waitUntil: 'networkidle2'});

            let element = await page.evaluate(() => {
                return Array.from(document.querySelectorAll("#isp_search_results_container li .isp_product_info"), el => el.textContent);
            });

            console.log(element.length);
            if(element.length === 0){
                break;
            }
            for(var i=0; i<element.length;i++){
                let nameSplit = element[i].split('-');
                let brand = nameSplit[0];
                let name = nameSplit[1];
                let priceSplit = element[i].split("$");
                let price;
                if(priceSplit.length === 4){
                    price = priceSplit[2];
                } else if(priceSplit.length === 2){
                    price = priceSplit[1];
                } else{
                    price = 0;
                }

                let skuSplit = priceSplit[0].split(':');
                let sku = skuSplit[1];
                console.log(`Product ${productNum} { Brand:` + brand + ", Name:" + name + ", Price:" + price + ", SKU:" + sku + " }");
                console.log("");
                productNum++;
                // console.log(element[i]);
            }
            pageNum++;
        }
    }
    page.close();
    browser.close();
}

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
        //test();
    }
}

// const timer = ms => new Promise(res => setTimeout(res, ms)) // Creates a timeout using promise
// async function runScrape(){
//     browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
//     try {
//         for(var i=0; i<urlArray.length+1;i++){
//             scrape(urlArray[i].url, urlArray[i].lastmod, i);
//             await timer(10); // 1.4 second delay
//         }
//         await browser.close();
//     }
//     catch(e){
//         console.log(e)
//     }
// }
function test(){
    for(var i =0; i<urlArray.length+1; i++){
        console.log(urlArray[i]);
    }
}

sitemap();