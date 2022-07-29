const knex = require('../knex.js')

const getPricesFilter = async (tableName)=>{

    var data1 = await knex.select('*').from('coastAppl').join(tableName, function(){ //returns goemans
        this
            .on('coastAppl.sku','=', tableName +'.sku')
    })

    var data2 = await knex.select('*').from(tableName).join('coastAppl', function(){ //returns coastAppl
        this
            .on('coastAppl.sku','=', tableName + '.sku');
    })

    let low = [];
    let high = [];

    data1.forEach((row1)=>{  //goemans rows
        data2.forEach((row2)=>{ //coastAppl rows
            if(row1.sku == row2.sku) 
                if(row1.price > row2.price){
                    high.push(row1);
                    return;
                }
                else if(row1.price < row2.price) {
                    low.push(row1);
                    return;
                }
        })
    })

    high.sort((a, b)=>{
        return (a.id) - (b.id);
    })

    low.sort((a, b)=>{
        return (a.id) - (b.id);
    })

    var data = {low: low, high: high};
    console.log(data.high);
    // return data;
}

getPricesFilter('goemans');

