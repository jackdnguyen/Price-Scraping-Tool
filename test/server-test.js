var chai = require("chai");
const chaiHttp = require("chai-http");
const { session } = require("passport");
var server = require("../index");
var should = chai.should();

chai.use(chaiHttp);

describe("login test 1", function () {
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

  it("should login only for user name admin and password scraper", function (done) {
    chai
      .request(server)
      .post("/login")
      .send({ f_uname: "admin", f_pwd: "scraper" })
      .end(function (error, res) {
        try {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a("array");
          res.body[0].n.should.equal("admin");
          res.body[0].a.should.equal("scraper");
          done();
        } catch (error) {
          //console.log(error);
          //done();
        }
      });
  });

  it("should not login for user not named admin and password scraper", function (done) {
    chai
      .request(server)
      .post("/login")
      .send({ f_uname: "adin", f_pwd: "scrper" })
      .end(function (error, res) {
        try {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a("array");
          res.body[0].n.should.equal("adin");
          res.body[0].a.should.equal("scrper");
          done();
        } catch (error) {
          //console.log(error);
          //done();
        }
      });
  });
    it('run logout and see if works', function(done){
      chai.request(server).post('/logout')
      .end(function(error, res){
          try{
              res.should.have.status(200);
              done()
          }
          catch(error){
          }
      });
  });

  it('dash board shouldnt be run without login', function(done){
    chai.request(server).post('/dashboard')
    .end(function(error, res){
        try{
            res.should.have.status(200);
        }
        catch(error){
          done()
        }
    });
  });

  it('display shouldnt be run without login', function(done){
    chai.request(server).post('/display')
    .end(function(error, res){
        try{
            res.should.have.status(200);
        }
        catch(error){
          done()
        }
    });
  });

  it('display-data shouldnt be run without login', function(done){
    chai.request(server).post('/display-data')
    .end(function(error, res){
        try{
            res.should.have.status(200);
        }
        catch(error){
          done()
        }
    });
  });

  it('all shouldnt be run without login', function(done){
    chai.request(server).post('/all')
    .end(function(error, res){
        try{
            res.should.have.status(200);
        }
        catch(error){
          done()
        }
    });
  });

  // it('skuwSearch shouldnt be run without login', function(done){
  //   chai.request(server).post('/skuwSearch')
  //   .end(function(error, res){
  //       try{
  //           res.should.have.status(200);
  //           done();
  //       }
  //       catch(error){
  //         done()
  //       }
  //   });
  // });

  it('home shouldnt be run without login', function(done){
    chai.request(server).post('/home')
    .end(function(error, res){
        try{
            res.should.have.status(200);
        }
        catch(error){
          done()
        }
    });
  });

  it('canApp shouldnt be run without login', function(done){
    chai.request(server).post('/canApp')
    .end(function(error, res){
        try{
            res.should.have.status(200);
        }
        catch(error){
          done()
        }
    });
  });

  it('goemans shouldnt be run without login', function(done){
    chai.request(server).post('/goemans')
    .end(function(error, res){
        try{
            res.should.have.status(200);
        }
        catch(error){
          done()
        }
    });
  });

  it('midAppl shouldnt be run without login', function(done){
    chai.request(server).post('/midAppl')
    .end(function(error, res){
        try{
            res.should.have.status(200);
        }
        catch(error){
          done()
        }
    });
  });

  it('coastAppl shouldnt be run without login', function(done){
    chai.request(server).post('/coastAppl')
    .end(function(error, res){
        try{
            res.should.have.status(200);
        }
        catch(error){
          done()
        }
    });
  });
});


// describe("login test part 2", function () {
// // before(chai
// //   .request(server)
// //   .post("/login")
// //   .send({ f_uname: "admin", f_pwd: "scraper" }))

// it('display-data shouldnt be run without login', function(done){
  
//   //req.session.user = req.body;

//   chai.request(server).post('/display-data')//.send(req.session.user)
//   .end(function(error, res){
//       try{
//           res.should.have.status(200);
//           done()
//       }
//       catch(error){
        
//       }
//   });
// })
// });


//terminal commands - npm i chai, npm i chai-http, npm i cors, npm i mocha -g
