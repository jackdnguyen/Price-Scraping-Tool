const puppeteer = require('puppeteer');
const { Pool } = require('pg')

//create table canAppl(id SERIAL, sku TEXT, name TEXT, price float(10), url TEXT, lpmod TEXT);
//create table goemans(id SERIAL, sku TEXT, name TEXT, price float(10), url TEXT, lpmod TEXT); 
//create table midAppl(id SERIAL, sku TEXT, name TEXT, price float(10), url TEXT, lpmod TEXT); 
//select exists (select 1 from canAppl where sku='000' LIMIT 1);

var pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:cmpt276@localhost/pricescraper",
//     // ssl: {
//     //     rejectUnauthorized: false
//     //   }
})


function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

async function scrapMidAppl() {
   try {
       const URL = 'https://cdn.avbportal.com/magento-media/sitemaps/cn0122/sitemap.xml'
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
           let linkData = []
           let items = document.querySelectorAll('url')
            for(let i= 167; i < 267; i++) {
                linkData.push( {
                    url: items[i].querySelector('loc').innerHTML,
                    lastMod: items[i].querySelector('lastmod').innerHTML,
                })
            }
            return linkData
       })
    //    console.log(data)
    //    data.forEach(async(item)=>{
    //     await scraper(browser, item)
    //    })
       for(let i = 0; i < data.length; i++) {
        await scraper(browser, data[i].url, i, data[i].lastMod)
        delay(1000)
       }
       await browser.close()
   } 
   catch (error) {
       console.error(error)
   }
}

//data2 = data.slice(1, data.length-4)
//data3 = data2.replace(',' , '')
//parseFloat(data3)


async function scraper(browser, link, index, lMod) {  
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
            await page.close
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
            console.log(data)
            await page.close
        }
    } 
    catch (error) {
            console.error(error)
    }
}

module.exports = { scrapMidAppl };
