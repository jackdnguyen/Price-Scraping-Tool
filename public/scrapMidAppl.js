const puppeteer = require('puppeteer');
const { Pool } = require('pg')

//create table canAppl(id SERIAL, sku TEXT, name TEXT, price float(10), url TEXT, lpmod TEXT);
//create table goemans(id SERIAL, sku TEXT, name TEXT, price float(10), url TEXT, lpmod TEXT); 
//create table midAppl(id SERIAL, sku TEXT, name TEXT, price float(10), url TEXT, lpmod TEXT); 
//select exists (select 1 from canAppl where sku='000' LIMIT 1);
var counter = 0;

var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //     rejectUnauthorized: false
    //   }
  })

let browser;


function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

async function launchBrowser(){
    browser = await puppeteer.launch(
        {
            // userDataDir: './data',
            headless: true,
            args: ['--no-sandbox']
        })
}

async function sitemap() {
   try {
       const URL = 'https://cdn.avbportal.com/magento-media/sitemaps/cn0122/sitemap.xml'
        await launchBrowser()

       const page = await browser.newPage()

       await page.goto(URL,{
        waitUntil: 'networkidle0',
        timeout: 0,
       })
       let data = await page.evaluate(() => {
           let linkData = []
           let items = document.querySelectorAll('url') //167 start index
            for(let i= 167; i < items.length; i++) {
                linkData.push( {
                    url: items[i].querySelector('loc').innerHTML,
                    lastMod: items[i].querySelector('lastmod').innerHTML,
                })
            }
            return linkData
       })
       return data
   } 
   catch (error) {
       console.error(error)
       await browser.close()
   }
}


async function scrapMidAppl(){
    let linkItems = await sitemap()
    await browser.close()
    await launchBrowser()

    for(let i = 0; i < 1000;) {
        await scraper(browser, linkItems[i].url, i, linkItems[i].lastMod)
        // await delay(1000)
        i++;

        if(i % 100 === 0)
        {
            await browser.close()
            await delay(10000)
            await launchBrowser()
        }

       }
       await browser.close()
}


async function scraper(browser, link, index, lMod) {  
    try {
        const URL = link
        const page = await browser.newPage()

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
            console.log(index)
            await page.close()
        }
        else {
            //Database Queries
            var insertQuery = `INSERT INTO midAppl(sku,name,price,url,lpmod) VALUES('${data[0].sku}','${data[0].name}',${data[0].price},'${URL}', '${lMod}')`
            var updateQuery = `UPDATE midAppl SET name='${data[0].name}', price=${data[0].price}, url='${URL}', lpmod='${lMod}' WHERE sku='${data[0].sku}'`
            var getDbSku = await pool.query(`SELECT exists (SELECT 1 FROM midAppl WHERE sku='${data[0].sku}' LIMIT 1)`)

            if(getDbSku.rows[0].exists)
            {
                await pool.query(updateQuery)
            }
            else{
                await pool.query(insertQuery)
            }
            counter++;
            console.log(index)
            console.log(data)
            await page.close()
        }
    } 
    catch (error) {
            console.error(error)
            //await page.close()
    }
}

function midApplCounter(){
    return counter;
}
module.exports = { scrapMidAppl, midApplCounter };

// scrapMidAppl();