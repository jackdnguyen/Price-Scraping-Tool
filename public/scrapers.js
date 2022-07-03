const puppeteer = require('puppeteer');
const Array = [];

var goemansProduct = {
     name:'',
     sku:'',
     url:'',
     lastmod:'',
     price:''
};

async function scrapeProduct(url, lastmod, i) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.goto(url);

    await page.waitForXPath('/html/body/div[3]/div/div[2]/div[1]');
    console.log(`Product ${i}`)
    // Try block in-case xPath doesn't exist
    // For cases where no specific product
    try{
        const [el] = await page.$x('/html/body/div[3]/div/div[2]/div[1]/span');
        const txt = await el.getProperty('innerText');
        const rawTxt = await txt.jsonValue();
        if(rawTxt == 'Filters'){
            console.log("No product");
            await page.waitForTimeout(1500);
            await browser.close();
            return
        }
    } catch(e){}
    // Retrieves SKU from URL
    urlSplit = url.split("/");
    sku = urlSplit[urlSplit.length-1]

    // For cases where no pricing
    try{
        const [el] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/dl/dt/a');
        const txt = await el.getProperty('innerText');
        const price = await txt.jsonValue();

        if(price=='Please Contact Store for Pricing'){
            console.log("No Pricing");

            await page.waitForXPath('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
            const [el2] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
            const txt2 = await el2.getProperty('innerText');
            const ProductName = await txt2.jsonValue();
            console.log(sku);
            console.log(ProductName);
            await browser.close();
            return
        }
    } catch (e){} 
    try { // Cases for goeman's displays Mielle's pricing
        const [elem] = await page.$x('//*[@id="terms"]');
        const mielleTxt = await elem.getProperty('innerText');
        const mielle = await mielleTxt.jsonValue();
        if(mielle == 'What is this?'){
            console.log("No Pricing");
            // Product Name
            await page.waitForXPath('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
            const [el3] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
            const txt3 = await el3.getProperty('innerText');
            const productName = await txt3.jsonValue();
            console.log(sku);
            console.log(productName);
            await browser.close();
            return
        }
    } catch(e){}
    // Pricing exists
        // Extract Price
        const [el] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/dl[2]/dd');
        const txt = await el.getProperty('innerText');
        const rawTxt = await txt.jsonValue();
        let text = rawTxt.replace(/\$|,/g,''); // Turn price into integer value
        
        // Extract Product Name
        await page.waitForXPath('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
        const [el3] = await page.$x('/html/body/div[3]/div/div[2]/div[3]/div[2]/div[2]/h2');
        const txt3 = await el3.getProperty('innerText');
        const rawTxt3 = await txt3.jsonValue();

        console.log(parseFloat(text));
        console.log(sku);
        console.log(rawTxt3);
        await browser.close();
}

//scrapeProduct('https://www.goemans.com/home/kitchen/cooking/range/gas/HR-1124-3-LP-AG');

async function sitemap(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.goto('https://www.goemans.com/sitemap.xml');
    page.setDefaultNavigationTimeout(0); // Sets navigation limit to inf
    await page.waitForNavigation({ // Wait until network is idle
        waitUntil: 'networkidle0',
      });
    // Loop: Extracts URL & lastmod from sitemap
    for(var i=350;i<450;i++){
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

        scrapeProduct(url,lastmod, i);
        await page.waitForTimeout(1500);
    }
    //await page.waitForTimeout(3000);
    // for(var i=415;i<9000;i++){
    //     // Extracts url
    //     await page.waitForSelector(`#folder${i} > div.opened > div:nth-child(2) > span:nth-child(2)`, { // Wait for selector to laod
    //         visible: true,
    //     });
    //     const [el] = await page.$$(`#folder${i} > div.opened > div:nth-child(2) > span:nth-child(2)`);
    //     const txt = await el.getProperty('innerText');
    //     const url = await txt.jsonValue();
    //     // Extracts lastmod
    //     await page.waitForSelector(`#folder${i} > div.opened > div:nth-child(4) > span:nth-child(2)`, {
    //         visible: true,
    //     });
    //     const [el2] = await page.$$(`#folder${i} > div.opened > div:nth-child(4) > span:nth-child(2)`);
    //     const txt2 = await el2.getProperty('innerText');
    //     const lastmod = await txt2.jsonValue();

    //     scrapeProduct(url,lastmod, i);
    //     await page.waitForTimeout(1250);
    // }
    await browser.close();
}

sitemap();
