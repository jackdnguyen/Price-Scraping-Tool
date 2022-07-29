//var fs = require('fs');  
// var progresBar = scrapeForm.addEventListener('submit', myFunction);
// var getProfiles = document.getElementsByTagName("select");
var profileArr = ["default","default","default","default", 1];
var options = ["default", "canAppl", "goemans", "midAppl", "coastAppl"];
var numRows = 1;
var scrapeForm = document.getElementById("scraper");

var getProfile4;
var getProfile3;
var getProfile2;

var getProfile1 = document.getElementsByTagName("select")[0].addEventListener('change', function(){
    console.log("profile 1");
    let value = document.getElementsByTagName("select")[0].value;
    profileArr[0] = value;
    scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}/${profileArr[3]}/${numRows}`
});

function getProfiles(){
    if(numRows === 2){
        getProfile1 = document.getElementsByTagName("select")[1].addEventListener('change', function(){ // Profile 1 Tables increment downwards
            console.log("profile 1");
            let value = document.getElementsByTagName("select")[1].value;
            profileArr[0] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}/${profileArr[3]}/${numRows}`
        });
        getProfile2 = document.getElementsByTagName("select")[0].addEventListener('change', function(){
            console.log("profile 2");
            let value = document.getElementsByTagName("select")[0].value;
            profileArr[1] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}/${profileArr[3]}/${numRows}`
        });
    } else if(numRows === 3){
        getProfile1 = document.getElementsByTagName("select")[2].addEventListener('change', function(){ // Profile 1 Tables increment downwards
            console.log("profile 1");
            let value = document.getElementsByTagName("select")[2].value;
            profileArr[0] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}/${profileArr[3]}/${numRows}`
        });
        getProfile2 = document.getElementsByTagName("select")[1].addEventListener('change', function(){
            console.log("profile 2");
            let value = document.getElementsByTagName("select")[1].value;
            profileArr[1] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}/${profileArr[3]}/${numRows}`
            });
        getProfile3 = document.getElementsByTagName("select")[0].addEventListener('change', function(){
            console.log("profile 3");
            let value = document.getElementsByTagName("select")[0].value;
            profileArr[2] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}/${profileArr[3]}/${numRows}`
        });
    } else if(numRows === 4){
        getProfile1 = document.getElementsByTagName("select")[3].addEventListener('change', function(){ // Profile 1 Tables increment downwards
            console.log("profile 1");
            let value = document.getElementsByTagName("select")[3].value;
            profileArr[0] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}/${profileArr[3]}/${numRows}`
        });
        getProfile2 = document.getElementsByTagName("select")[2].addEventListener('change', function(){
            console.log("profile 2");
            let value = document.getElementsByTagName("select")[2].value;
            profileArr[1] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}/${profileArr[3]}/${numRows}`
            });
        getProfile3 = document.getElementsByTagName("select")[1].addEventListener('change', function(){
            console.log("profile 3");
            let value = document.getElementsByTagName("select")[1].value;
            profileArr[2] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}/${profileArr[3]}/${numRows}`
        });
        getProfile4 = document.getElementsByTagName("select")[0].addEventListener('change', function(){
            console.log("profile 4");
            let value = document.getElementsByTagName("select")[0].value;
            profileArr[3] = value;
            scrapeForm.action = `/scrape/${profileArr[0]}/${profileArr[1]}/${profileArr[2]}/${profileArr[3]}/${numRows}`
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

async function cloneRow() {
    if(numRows < 4){
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

// Function updates Progress Bars
var totalCases = 10000;
async function getProg() {
        // fetch progress
        var counterList = await fetch('/progress')
            .then(response => response.text())
            .then(text => text);

        counterList = counterList.split(','); // Splits counters in array [CanApplCounter, GoemansCounter, MidLandAppl Counter]
        var progUpdate = document.getElementsByName("progUpdate");
        var progBar = document.getElementsByName("progBar");

        var totalCases1;
        var totalCases2;
        var totalCases3;
        var totalCases4;

        var success1;
        var success2;
        var success3;
        var success4;

        //counter++;    
        console.log(counterList);
        //console.log(bars);
        if(numRows == 1){
            var counter = 0;
            if(profileArr[0] == 'canAppl'){
                counter = parseInt(counterList[0]);
                totalCases1 = 15000;
                if(counterList[4] == true){
                    success1 = true;
                }
            }else if (profileArr[0] == 'goemans'){
                counter = parseInt(counterList[1]);
                totalCases1 = 10000;
                if(counterList[5] == true){
                    success1 = true;
                }
            } else if (profileArr[0] == 'midAppl'){
                counter = parseInt(counterList[2]);
                totalCases1 = 10000;
                if(counterList[6] == true){
                    success1 = true;
                }
            } else if (profileArr[0] == 'coastAppl'){
                counter = parseInt(counterList[3]);
                totalCases1 = 10000;
                if(counterList[7] == true){
                    success1 = true;
                }
            }
            progUpdate[0].textContent = ''
            if(success1 == true){
                progUpdate[0].append("Success!");      
            } else {
                progUpdate[0].append("(" + counter + " Products)" );      
            }
            progBar[0].value = ((counter/totalCases1) * 100);

        } else if (numRows == 2){
            var counter = 0;
            if(profileArr[0] == 'canAppl'){
                counter = parseInt(counterList[0]);
                totalCases1 = 15000;
                if(counterList[4] == true){
                    success1 = true;
                }
            }else if (profileArr[0] == 'goemans'){
                counter = parseInt(counterList[1]);
                totalCases1 = 10000;
                if(counterList[5] == true){
                    success1 = true;
                }
            } else if (profileArr[0] == 'midAppl'){
                counter = parseInt(counterList[2]);
                totalCases1 = 10000;
                if(counterList[6] == true){
                    success1 = true;
                }
            } else if (profileArr[0] == 'coastAppl'){
                counter = parseInt(counterList[3]);
                totalCases1 = 10000;
                if(counterList[7] == true){
                    success1 = true;
                }
            }
            progUpdate[1].textContent = ''
            if(success1 == true){
                progUpdate[1].append("Success!");      
            } else {
                progUpdate[1].append("(" + counter + " Products)" );      
            }     
            progBar[1].value = ((counter/totalCases1) * 100);

            var counter2 = 0;
            if(profileArr[1] == 'canAppl'){
                counter2 = parseInt(counterList[0]);
                totalCases2 = 15000;
                if(counterList[4] == true){
                    success2 = true;
                }
            }else if (profileArr[1] == 'goemans'){
                counter2 = parseInt(counterList[1]);
                totalCases2 = 10000;
                if(counterList[5] == true){
                    success2 = true;
                }
            } else if (profileArr[1] == 'midAppl'){
                counter2 = parseInt(counterList[2]);
                totalCases2 = 10000;
                if(counterList[6] == true){
                    success2 = true;
                }
            } else if (profileArr[1] == 'coastAppl'){
                counter2 = parseInt(counterList[3]);
                totalCases2 = 10000;
                if(counterList[7] == true){
                    success2 = true;
                }
            }
            progUpdate[0].textContent = ''
            if(success2 == true){
                progUpdate[0].append("Success!");      
            } else {
                progUpdate[0].append("(" + counter2 + " Products)" );      
            }     
            progBar[0].value = ((counter2/totalCases2) * 100);

        } else if (numRows == 3){
            var counter = 0;
            if(profileArr[0] == 'canAppl'){
                counter = parseInt(counterList[0]);
                totalCases1 = 15000;
                if(counterList[4] == true){
                    success1 = true;
                }
            }else if (profileArr[0] == 'goemans'){
                counter = parseInt(counterList[1]);
                totalCases1 = 10000;
                if(counterList[5] == true){
                    success1 = true;
                }
            } else if (profileArr[0] == 'midAppl'){
                counter = parseInt(counterList[2]);
                totalCases1 = 10000;
                if(counterList[6] == true){
                    success1 = true;
                }
            } else if (profileArr[0] == 'coastAppl'){
                counter = parseInt(counterList[3]);
                totalCases1 = 10000;
                if(counterList[7] == true){
                    success1 = true;
                }
            }
            progUpdate[2].textContent = ''
            if(success1 == true){
                progUpdate[2].append("Success!");      
            } else {
                progUpdate[2].append("(" + counter + " Products)" );      
            }     
            progBar[2].value = ((counter/totalCases1) * 100);

            var counter2 = 0;
            if(profileArr[1] == 'canAppl'){
                counter2 = parseInt(counterList[0]);
                totalCases2 = 15000;
                if(counterList[4] == true){
                    success2 = true;
                }
            }else if (profileArr[1] == 'goemans'){
                counter2 = parseInt(counterList[1]);
                totalCases2 = 10000;
                if(counterList[5] == true){
                    success2 = true;
                }
            } else if (profileArr[1] == 'midAppl'){
                counter2 = parseInt(counterList[2]);
                totalCases2 = 10000;
                if(counterList[6] == true){
                    success2 = true;
                }
            } else if (profileArr[1] == 'coastAppl'){
                counter2 = parseInt(counterList[3]);
                totalCases2 = 10000;
                if(counterList[7] == true){
                    success2 = true;
                }
            }
            progUpdate[1].textContent = ''
            if(success2 == true){
                progUpdate[1].append("Success!");      
            } else {
                progUpdate[1].append("(" + counter2 + " Products)" );      
            }     
            progBar[1].value = ((counter2/totalCases2) * 100);

            var counter3 = 0;
            if(profileArr[2] == 'canAppl'){
                counter3 = parseInt(counterList[0]);
                totalCases3 = 15000;
                if(counterList[4] == true){
                    success3 = true;
                }
            }else if (profileArr[2] == 'goemans'){
                counter3 = parseInt(counterList[1]);
                totalCases3 = 10000;
                if(counterList[5] == true){
                    success3 = true;
                }
            } else if (profileArr[2] == 'midAppl'){
                counter3 = parseInt(counterList[2]);
                totalCases3 = 10000;
                if(counterList[6] == true){
                    success3 = true;
                }
            } else if (profileArr[2] == 'coastAppl'){
                counter3 = parseInt(counterList[3]);
                totalCases3 = 10000;
                if(counterList[7] == true){
                    success3 = true;
                }
            }
            progUpdate[0].textContent = ''
            if(success3 == true){
                progUpdate[0].append("Success!");      
            } else {
                progUpdate[0].append("(" + counter3 + " Products)" );      
            }     
            progBar[0].value = ((counter3/totalCases3) * 100);

        } else if (numRows == 4){
            var counter = 0;
            if(profileArr[0] == 'canAppl'){
                counter = parseInt(counterList[0]);
                totalCases1 = 15000;
                if(counterList[4] == true){
                    success1 = true;
                }
            }else if (profileArr[0] == 'goemans'){
                counter = parseInt(counterList[1]);
                totalCases1 = 10000;
                if(counterList[5] == true){
                    success1 = true;
                }
            } else if (profileArr[0] == 'midAppl'){
                counter = parseInt(counterList[2]);
                totalCases1 = 10000;
                if(counterList[6] == true){
                    success1 = true;
                }
            } else if (profileArr[0] == 'coastAppl'){
                counter = parseInt(counterList[3]);
                totalCases1 = 10000;
                if(counterList[7] == true){
                    success1 = true;
                }
            }
            progUpdate[3].textContent = ''
            if(success1 == true){
                progUpdate[3].append("Success!");      
            } else {
                progUpdate[3].append("(" + counter + " Products)" );      
            }     
            progBar[3].value = ((counter/totalCases1) * 100);

            var counter2 = 0;
            if(profileArr[1] == 'canAppl'){
                counter2 = parseInt(counterList[0]);
                totalCases2 = 15000;
                if(counterList[4] == true){
                    success2 = true;
                }
            }else if (profileArr[1] == 'goemans'){
                counter2 = parseInt(counterList[1]);
                totalCases2 = 10000;
                if(counterList[5] == true){
                    success2 = true;
                }
            } else if (profileArr[1] == 'midAppl'){
                counter2 = parseInt(counterList[2]);
                totalCases2 = 10000;
                if(counterList[6] == true){
                    success2 = true;
                }
            } else if (profileArr[1] == 'coastAppl'){
                counter2 = parseInt(counterList[3]);
                totalCases2 = 10000;
                if(counterList[7] == true){
                    success2 = true;
                }
            }
            progUpdate[2].textContent = ''
            if(success2 == true){
                progUpdate[2].append("Success!");      
            } else {
                progUpdate[2].append("(" + counter2 + " Products)" );      
            }     
            progBar[2].value = ((counter2/totalCases2) * 100);

            var counter3 = 0;
            if(profileArr[2] == 'canAppl'){
                counter3 = parseInt(counterList[0]);
                totalCases3 = 15000;
                if(counterList[4] == true){
                    success3 = true;
                }
            }else if (profileArr[2] == 'goemans'){
                counter3 = parseInt(counterList[1]);
                totalCases3 = 10000;
                if(counterList[5] == true){
                    success3 = true;
                }
            } else if (profileArr[2] == 'midAppl'){
                counter3 = parseInt(counterList[2]);
                totalCases3 = 10000;
                if(counterList[6] == true){
                    success3 = true;
                }
            } else if (profileArr[2] == 'coastAppl'){
                counter3 = parseInt(counterList[3]);
                totalCases3 = 10000;
                if(counterList[7] == true){
                    success3 = true;
                }
            }
            progUpdate[1].textContent = ''
            if(success3 == true){
                progUpdate[1].append("Success!");      
            } else {
                progUpdate[1].append("(" + counter3 + " Products)" );      
            }     
            progBar[1].value = ((counter3/totalCases3) * 100);

            var counter4 = 0;
            if(profileArr[3] == 'canAppl'){
                counter4 = parseInt(counterList[0]);
                totalCases4 = 15000;
                if(counterList[4] == true){
                    success4 = true;
                }
            }else if (profileArr[3] == 'goemans'){
                counter4 = parseInt(counterList[1]);
                totalCases4 = 10000;
                if(counterList[5] == true){
                    success4 = true;
                }
            } else if (profileArr[3] == 'midAppl'){
                counter4 = parseInt(counterList[2]);
                totalCases4 = 10000;
                if(counterList[6] == true){
                    success4 = true;
                }
            } else if (profileArr[3] == 'coastAppl'){
                counter4 = parseInt(counterList[3]);
                totalCases4 = 10000;
                if(counterList[7] == true){
                    success4 = true;
                }
            }
            progUpdate[0].textContent = ''
            if(success4 == true){
                progUpdate[0].append("Success!");      
            } else {
                progUpdate[0].append("(" + counter4 + " Products)" );      
            }     
            progBar[0].value = ((counter4/totalCases4) * 100);
        }
};

async function onLoad(){
    console.log("hi");
    console.log(numRows);
    pageData = await fetch("/urlPageData")
        .then(response => response.text())
        .then(text => text);
    console.log(pageData);
    pageData = pageData.split(',');
    console.log(pageData);
    numRows = parseInt(pageData[4]);
    if(numRows == 1){
        document.getElementsByTagName("select")[0].selectedIndex = options.indexOf(pageData[0]); // Set retrieved data to selected option
        profileArr[0] = pageData[0]; // Set profile arrays;
    }else if(numRows == 2){
        var row = document.getElementById("row"); 
        var table = document.getElementById("urlTable"); 
        var clone = row.cloneNode(true); 
        table.prepend(clone); 

        document.getElementsByTagName("select")[1].selectedIndex = options.indexOf(pageData[0]); // Row 1
        profileArr[0] = pageData[0];
        document.getElementsByTagName("select")[0].selectedIndex = options.indexOf(pageData[1]); // Row 2
        profileArr[1] = pageData[1];
        getProfiles();
    }else if(numRows == 3){
        var row = document.getElementById("row"); 
        var table = document.getElementById("urlTable"); 
        var clone = row.cloneNode(true); 
        table.prepend(clone); 

        var row2 = document.getElementById("row"); 
        var table2 = document.getElementById("urlTable"); 
        var clone2 = row2.cloneNode(true); 
        table2.prepend(clone2); 

        document.getElementsByTagName("select")[2].selectedIndex = options.indexOf(pageData[0]); // Row 1
        profileArr[0] = pageData[0];
        document.getElementsByTagName("select")[1].selectedIndex = options.indexOf(pageData[1]); // Row 2
        profileArr[1] = pageData[1];
        document.getElementsByTagName("select")[0].selectedIndex = options.indexOf(pageData[2]); // Row 3
        profileArr[2] = pageData[2];
        getProfiles();
    }else if(numRows == 4){
        var row = document.getElementById("row"); 
        var table = document.getElementById("urlTable"); 
        var clone = row.cloneNode(true); 
        table.prepend(clone); 

        var row2 = document.getElementById("row"); 
        var table2 = document.getElementById("urlTable"); 
        var clone2 = row2.cloneNode(true); 
        table2.prepend(clone2); 

        var row3 = document.getElementById("row"); 
        var table3 = document.getElementById("urlTable"); 
        var clone3 = row3.cloneNode(true); 
        table3.prepend(clone3); 

        document.getElementsByTagName("select")[3].selectedIndex = options.indexOf(pageData[0]); // Row 1
        profileArr[0] = pageData[0];
        document.getElementsByTagName("select")[2].selectedIndex = options.indexOf(pageData[1]); // Row 2
        profileArr[1] = pageData[1];
        document.getElementsByTagName("select")[1].selectedIndex = options.indexOf(pageData[2]); // Row 3
        profileArr[2] = pageData[2];
        document.getElementsByTagName("select")[0].selectedIndex = options.indexOf(pageData[3]); // Row 4
        profileArr[3] = pageData[3];
        getProfiles();
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
window.onLoad = onLoad();