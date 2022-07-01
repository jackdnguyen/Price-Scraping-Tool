const puppeteer = require('puppeteer');
const Array = [];

var goemansProduct = {
     name:'',
     sku:'',
     url:'',
     lastmod:'',
     price:''
};

async function scrapeProduct(url, lastmod) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.goto(url);

    await page.waitForXPath('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]');

    const [el0] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/dl/dt/a');
    // Try block in-case xPath doesn't exist
    // For cases where no pricing
    try{
        const txt0 = await el0.getProperty('innerText');
        const rawTxt0 = await txt0.jsonValue();
        if(rawTxt0=='Please Contact Store for Pricing'){
            console.log("No Pricing");
            await page.waitForXPath('/html/body/div[3]/div/div[2]/div[1]/a[5]');
            const [el2] = await page.$x('/html/body/div[3]/div/div[2]/div[1]/a[5]');
            const txt2 = await el2.getProperty('innerText');
            const rawTxt2 = await txt2.jsonValue();
    
            await page.waitForXPath('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
            const [el3] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
            const txt3 = await el3.getProperty('innerText');
            const rawTxt3 = await txt3.jsonValue();
            console.log(rawTxt2);
            console.log(rawTxt3);
            await page.waitForTimeout(3000);
            await browser.close();
            return
        }
    } catch (e){} // Pricing exists
        // Extract Price
        const [el] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/dl[2]/dd');
        const txt = await el.getProperty('innerText');
        const rawTxt = await txt.jsonValue();
        let text = rawTxt.replace(/\$|,/g,''); // Turn price into integer value

        // Extract SKU
        await page.waitForXPath('/html/body/div[3]/div/div[2]/div[1]/a[5]');
        const [el2] = await page.$x('/html/body/div[3]/div/div[2]/div[1]/a[5]');
        const txt2 = await el2.getProperty('innerText');
        const rawTxt2 = await txt2.jsonValue();
        
        // Extract Product Name
        await page.waitForXPath('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
        const [el3] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
        const txt3 = await el3.getProperty('innerText');
        const rawTxt3 = await txt3.jsonValue();


        console.log(rawTxt);
        console.log(parseFloat(text));
        console.log(rawTxt2);
        console.log(rawTxt3);
        await page.waitForTimeout(3000);
        await browser.close();
}

async function sitemap(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.goto('https://www.goemans.com/sitemap.xml');
    page.setDefaultNavigationTimeout(0); // Sets navigation limit to inf
    await page.waitForNavigation({ // Wait until network is idle
        waitUntil: 'networkidle0',
      });
    // Loop: Extracts URL & lastmod from sitemap
    for(var i=106;i<150;i++){ // Testing 44 products
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

        scrapeProduct(url,lastmod);
        await page.waitForTimeout(3000);
    }
    await browser.close();
}

sitemap();
