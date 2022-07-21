var chai = require('chai');
const chaiHttp = require('chai-http');
var server = require('../index');
var should = chai.should();

chai.use(chaiHttp);

describe('Users', function(){

    // it('should add a single user on a successful POST request for /adduser', function(done){
    //     chai.request(server).post('/adduser').send({'uname':'tester mctesty', 'age':'23'})
    //     .end(function(error, res){
    //         try{
    //             res.should.have.status(200);
    //             res.should.be.json;
    //             res.body.should.be.a('array');
    //             res.body[0].n.should.equal('tester mctesty')
    //             res.body[0].a.should.equal('23')
    //             done()
    //         }
    //         catch(error)
    //         {
    //             console.log(error)
    //             done()
    //         }
    //     });
    // });

    it('should login only for user name admin and password scraper', function(done){
        chai.request(server).post('/login').send({'f_uname':'admin', 'f_pwd':'scraper'})
        .end(function(error, res){
                res.should.have.status(200);
                // res.body[0].f_name.should.equal('admin')
                // res.body[0].f_pwd.should.equal('scraper')
                done()
        });

        
    });

    // it('should login only for user name admin and password scraper', function(done){
    //     chai.request(server).post('/skuSearch').send({'f_uname':'admin', 'f_pwd':'scraper'})
    //     .end(function(error, res){
    //             res.should.have.status(200);
    //             // res.body[0].f_name.should.equal('admin')
    //             // res.body[0].f_pwd.should.equal('scraper')
    //             done()
    //     });

    // })
})

//terminal commands - npm i chai, npm i chai-http, npm i cors, npm i mocha -g 