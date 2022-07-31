const knex = require('../knex.js')

const getPricesFilter = async (tableName)=>{

    var low = await knex.select('*').from('coastAppl').join(tableName, function(){ 
        this
            .on(tableName +'.sku','like', 'coastAppl.sku')
            .andOn(tableName +'.price','<', 'coastAppl.price')
    })

    var high = await knex.select('*').from('coastAppl').join(tableName, function(){
        this
            .on(tableName +'.sku','like', 'coastAppl.sku')
            .andOn(tableName +'.price','>', 'coastAppl.price')
    })

    var data = {low: low, high: high};

    return data;
}


const getMatch =  async ()=> {
    var data1 = 'RD14257N';
    var data2 = 'RD14257';
    var sku = 'L';

    var searchQuery3 = await knex.select('*').from('canAppl').where('sku','like', '%'+ sku +'%');
      console.log(searchQuery3);

    // const result = data2.includes(data1);
    // console.log(result);

}

getPricesFilter('canAppl');

