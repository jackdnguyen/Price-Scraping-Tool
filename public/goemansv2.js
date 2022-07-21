const puppeteer = require('puppeteer');

let browser;

const timer = ms => new Promise(res => setTimeout(res, ms)) // Creates a timeout using promise

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
]

var productNum = 1;
var x = 0;
var pageNum = 1;
var flag = true;
async function scrape(index){
    try{
        browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
        const page = await browser.newPage();
        for(x=index; x<collections.length; x++){
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

                console.log(prices.length)
                for(var i=0; i< prices.length ; i++){
                    console.log(`Product ${productNum}:`);
                    console.log(prices[i]);
                    console.log(url[i]);
                    console.log('');
                    productNum++;
                }
                pageNum++;
                flag = true;
                await timer(1.4);
            }
        }
        page.close();
        browser.close();
    }catch(e){
        console.log(e); // Timed Out
        flag = false; // Saves page num
        scrape(x);
    }
}

scrape(0);