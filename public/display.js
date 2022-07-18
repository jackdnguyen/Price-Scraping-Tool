//var fs = require('fs');  
// var progresBar = scrapeForm.addEventListener('submit', myFunction);
// var getProfiles = document.getElementsByTagName("select");
var profileArr = ["default","default","default"];
var numRows = 1;
var totalCases = 50;
var scrapeForm = document.getElementById("scraper");

var getProfile3;
var getProfile2;

var getProfile1 = document.getElementsByTagName("select")[0].addEventListener('change', function(){
    console.log("profile 1");
    let value = document.getElementsByTagName("select")[0].value;
    profileArr[0] = value;
    scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}`
});

function getProfiles(){
    if(numRows === 2){
        getProfile1 = document.getElementsByTagName("select")[1].addEventListener('change', function(){ // Profile 1 Tables increment downwards
            console.log("profile 1");
            let value = document.getElementsByTagName("select")[1].value;
            profileArr[0] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}`
        });
        getProfile2 = document.getElementsByTagName("select")[0].addEventListener('change', function(){
            console.log("profile 2");
            let value = document.getElementsByTagName("select")[0].value;
            profileArr[1] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}`
        });
    } else if(numRows === 3){
        getProfile1 = document.getElementsByTagName("select")[2].addEventListener('change', function(){ // Profile 1 Tables increment downwards
            console.log("profile 1");
            let value = document.getElementsByTagName("select")[2].value;
            profileArr[0] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}`
        });
        getProfile2 = document.getElementsByTagName("select")[1].addEventListener('change', function(){
            console.log("profile 2");
            let value = document.getElementsByTagName("select")[1].value;
            profileArr[1] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}`
            });
        getProfile3 = document.getElementsByTagName("select")[0].addEventListener('change', function(){
            console.log("profile 3");
            let value = document.getElementsByTagName("select")[0].value;
            profileArr[2] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}`
        });
    }
}

var scrapeButton = document.getElementById("scrapeButton").addEventListener('click', async function(){
    var goeMans = await fetch('/running')
    .then(response => response.text())
    .then(text => text);
    
    if(goeMans == 'true'){
        alert("Goemans is Running!");
    }
});

function cloneRow() {
    if(numRows < 3){
        var row = document.getElementById("row"); 
        var table = document.getElementById("urlTable"); 
        var clone = row.cloneNode(true); 
        table.prepend(clone); 
        numRows++;
        getProfiles();
    }else{
        document.getElementById("add").disabled = true;
    }
    $('select').on('change', function() {
        $('option').prop('disabled', false);
        $('select').each(function() {
            var val = this.value;
            $('select').not(this).find('option').filter(function() {
                return this.value === val;
            }).prop('disabled', true);
        });
    }).change();
}


var totalCases = 50;
async function getProg() {
        // fetch progress
        var counter = await fetch('/progress')
            .then(response => response.text())
            .then(text => parseInt(text))
        // outputs the content of the text file

        //counter++;    
        console.log(counter);

        $('#progUpdate').empty().append("(" + counter + " Products)" );

        $('#progBar').val((counter/totalCases) * 100);

        // if (counter < totalCases) {
        //     setTimeout(myFunction, 4000);
        // }
};

$('select').on('change', function() {
    $('option').prop('disabled', false);
    $('select').each(function() {
        var val = this.value;
        $('select').not(this).find('option').filter(function() {
            return this.value === val;
        }).prop('disabled', true);
    });
}).change();