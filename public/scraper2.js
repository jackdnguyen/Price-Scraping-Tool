const puppeteer = require('puppeteer')

let results = []

async function sitemap1() {
   try {
       const URL = 'https://www.canadianappliance.ca/sitemaps/sitemap-1.xml'
       const browser = await puppeteer.launch()
       const page = await browser.newPage()

       await page.goto(URL)
       let data = await page.evaluate(() => {
           let urls = []
           let items = document.getElementsByTagName('loc')
            for(let i= 0; i < 1; i++) {
                urls.push(items[i].innerHTML)
            }
            return urls
       })
       console.log(data)
       await browser.close()
   } 
   catch (error) {
       console.error(error)
   }
}

async function scraper(link) {  
    try {
        const URL = link
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
 
        await page.goto(URL)
        let data = await page.evaluate(() => {
                    results.push({
                    name: document.querySelector('h1 [itemprop=name]').textContent,
                    sku: document.querySelector('h1 div').textContent,
                    price: document.querySelector('[itemprop=price]').textContent,
                })

            })

            console.log(data)
            await browser.close()
        } 
    catch (error) {
            console.error(error)
    }
}

// async function runScrap() {
    // sitemap1()
    // await console.log(sitemap1())
// }

// runScrap()
sitemap1()
// await console.log(sitemap1())


