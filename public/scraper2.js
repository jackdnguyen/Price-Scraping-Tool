const puppeteer = require('puppeteer');
const { Pool } = require('pg')

//create table canAppl(id SERIAL, sku TEXT, name TEXT, price float(10), url TEXT, lpmod TEXT);
//create table goemans(id SERIAL, sku TEXT, name TEXT, price float(10), url TEXT, lpmod TEXT); 
//select exists (select 1 from canAppl where sku='000' LIMIT 1);

var pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:cmpt276@localhost/pricescraper",
    // ssl: {
    //     rejectUnauthorized: false
    //   }
})


function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

async function sitemap1() {
   try {
       const URL = 'https://www.canadianappliance.ca/_sitemap_products.php'
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
           let urls = []
           let items = document.getElementsByTagName('body')[0].innerHTML.split('\n')
            for(let i= 0; i < 100; i++) {
                urls.push(items[i])
            }
            return urls
       })
    //    console.log(data)
    //    data.forEach(async(item)=>{
    //     await scraper(browser, item)
    //    })
       for(let i = 0; i < 100; i++) {
        await scraper(browser, data[i], i)
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


async function scraper(browser, link, index) {  
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
            if(document.querySelector('h1 [itemprop=name]') == null)
                return
            else {
                let results = []
                let tempPrice = 0

                if(document.querySelector('[itemprop=price]') != null){ 
                    tempPrice = document.querySelector('[itemprop=price]').textContent
                    tempPrice = parseFloat(tempPrice.slice(1, tempPrice.length-4).replace(',' , ''))
                }
                    results.push({
                        name: document.querySelector('h1 [itemprop=name]').textContent,
                        sku: document.querySelector('h1 div').textContent,
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
            var insertQuery = `INSERT INTO canAppl(sku,name,price,url,lpmod) VALUES('${data[0].sku}','${data[0].name}',${data[0].price},'${URL}', '2020-06-20')`
            var updateQuery = `UPDATE canAppl SET name='${data[0].name}', price=${data[0].price}, url='${URL}', lpmod='2020-06-20' WHERE sku='${data[0].sku}'`
            var getDbSku = await pool.query(`SELECT exists (SELECT 1 FROM canAppl WHERE sku='${data[0].sku}' LIMIT 1)`)

            if(getDbSku.rows[0].exists)
            {
                await pool.query(updateQuery)
            }
            else{
                await pool.query(insertQuery)
            }
            await page.close
        }
    } 
    catch (error) {
            console.error(error)
    }
}

sitemap1()

// async function runScrap() {
//     sitemap1()
//     await console.log(links)
// }

// runScrap()
// sitemap1()
// await console.log(sitemap1())


