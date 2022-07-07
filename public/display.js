var getProfile = document.getElementsByTagName("select")[0].value;


async function handleInput(e) {
    let getProfile = document.getElementsByTagName("select")[0].value;
    if (getProfile == 'canAppl') {
        await sitemap1();
    }
    else if(getProfile == 'goemans') {
        await sitemap(106);
    }
}



// window.onclick=async function(value){
//     console.log("display")
//     await sitemap1();
// }
