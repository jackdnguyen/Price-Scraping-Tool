// //terminal commands - npm i chai, npm i chai-http, npm i cors, npm i mocha -g 
var chai = require("chai");
const chaiHttp = require("chai-http");
const { session } = require("passport");
var server = require("../index");
var should = chai.should();
request = require('supertest')
chai.use(chaiHttp);
let mockSession = require('mock-session')

describe("login test", function () {

  it("should login only for user name admin and password scraper", function (done) {
    request(app)
      .post("/login")
      .send({ f_uname: "admin", f_pwd: "scraper" })
      .expect(302)
      .expect('Location', '/dashboard')
      .end(done)
  });
  it("shouldnt login only for user name admn and password scrper", function (done) {
    request(app)
      .post("/login")
      .send({ f_uname: "admn", f_pwd: "scrper" })
      .expect(302)
      .expect('Location', '/')
      .end(done)
  });
  it("logout should logout use and redirect to homepage", function (done) {
    request(app)
      .post("/logout")
      .expect(302)
      .expect('Location', '/')
      .end(done)
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

// describe("session render test", function () {
//   it('should delete a single user on post request for /delete/:id', async()=> {
//     let cookie = mockSession('my-session', 'my-secret', {"count":1});
//     var res0 = await chai.request(server).get('/getAllUser');
//     var num_user_before = res0.body.length;

//     const id = 20
//     //delete user with uid 20
//     var res2 = await chai.request(server).post('/delete/'+id).set('cookie', [cookie]);


//     var res3 = await chai.request(server).get('/getAllUser');
//     var num_user_after = res3.body.length;


//     (num_user_before - num_user_after).should.equal(1)
//     res3.should.have.status(200)
// });
// });