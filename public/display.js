var scrapeForm = document.getElementById("scraper");


function handleInput(e) {
    var getProfile = document.getElementsByTagName("select")[0].addEventListener('change', function(){
        let value = document.getElementsByTagName("select")[0].value;
        if(value == 'canAppl' && e.value == 'https://www.canadianappliance.ca'){
            scrapeForm.action = "/scrapecanAppl"
            console.log(scrapeForm.action);
        } 
        else if(value == 'goemans' && e.value == 'https://www.goemans.com'){
            scrapeForm.action = "/scrapegoemans"
            console.log(scrapeForm.action);
        } 
        else if(value == 'default'){
            scrapeForm.action = "/scrape"
            console.log(scrapeForm.action);
        }
    });
}
