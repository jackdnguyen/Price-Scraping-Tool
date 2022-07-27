const puppeteer = require('puppeteer');
const knex = require('../knex.js')

//create table canAppl(id SERIAL, sku TEXT, name TEXT, price float(10), url TEXT, lpmod TEXT);
//create table goemans(id SERIAL, sku TEXT, name TEXT, price float(10), url TEXT, lpmod TEXT); 
//select exists (select 1 from canAppl where sku='000' LIMIT 1);
var counter = 0;

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
       const URL = 'https://www.canadianappliance.ca/_sitemap_products.php'
       await launchBrowser()

       const page = await browser.newPage()

       await page.goto(URL,{
        waitUntil: 'domcontentloaded',
        timeout: 0,
       })
       let data = await page.evaluate(() => {
           let urls = []
           let items = document.getElementsByTagName('body')[0].innerHTML.split('\n')
            for(let i= 0; i < items.length; i++) {
                urls.push(items[i])
            }
            return urls
       })

       return data;
   } 
   catch (error) {
       console.error(error)
       await browser.close()
   }
}

async function scrapCanAppl(){
    let urls = await sitemap()
    await browser.close()
    await launchBrowser()

    for(let i = 0; i < 1000;) {
        await scraper(browser, urls[i], i)
        await delay(1000)
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

async function scraper(browser, link, index) {  
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
            console.log(index)
            await page.close()
        }
        else {
            //Database Queries
            const searchQuery = await knex.select('sku').from('canAppl').whereRaw('sku = ?', data[0].sku);
            
            console.log(index)

            var time = new Date().toLocaleString();
            console.log(time);
            if(searchQuery.length != 0){
                await knex.update({name: data[0].name, price: data[0].price, url: URL, lpmod: time}).where({sku: data[0].sku}).from('canAppl');
                console.log(data);
            }
            else{
                await knex.insert({sku: data[0].sku, name: data[0].name, price: data[0].price, url: URL, lpmod: time}).into('canAppl');
                console.log(data);
            }

            counter++;
            await page.close()
        }
    } 
    catch (error) {
            console.error(error)
    }
}

function canApplCounter(){
    return counter;
}

module.exports = {scrapCanAppl, canApplCounter};
// scrapCanAppl();