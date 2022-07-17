var scrapeForm = document.getElementById("scraper");

const button = document.getElementById("scrape");
const progress = document.querySelector('.progress');
const h2 = document.querySelector('h2');
var i = 0;
var x = 100;

progress.style.width = '0%';



button.onclick = function() {

	if (progress.style.width === '0%') {

		setInterval(speed, 2200);
		
		function speed(){

		if (i < 100) {
				i++;
				h2.innerHTML = i/10 + '%';
				progress.style.width = i/10 + '%';
                
			}

		}
	}


}


function cloneRow() {
    var row = document.getElementById("row"); 
    var table = document.getElementById("urlTable"); 
    var clone = row.cloneNode(true); 
    table.prepend(clone); 
  }





var getProfile = document.getElementsByTagName("select")[0].addEventListener('change', function(){
    let value = document.getElementsByTagName("select")[0].value;

    switch(value) {
        case 'canAppl':
            scrapeForm.action = "/scrapecanAppl"
            // console.log(scrapeForm.action);
            break;

        case 'goemans':
            scrapeForm.action = "/scrapegoemans"
            // console.log(scrapeForm.action);
            break;

        case 'midAppl':
            scrapeForm.action = "/scrapemidAppl"
            // console.log(scrapeForm.action);
            break;

        default:
            scrapeForm.action = "/scrape"
            // console.log(scrapeForm.action);

    }

});



