// //terminal commands - npm i chai, npm i chai-http, npm i cors, npm i mocha -g 
var chai = require("chai");
let mockSession = require('mock-session')
var testSession = null;
const chaiHttp = require("chai-http");
const { session } = require("passport");
var server = require("../index");
var should = chai.should();
request = require('supertest')
chai.use(chaiHttp);

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
  request(app)
      .get("/dashboard")
      .expect(302)
      .expect('Location', '/')
      .end(done)
});

it('display shouldnt be run without login', function(done){
  request(app)
      .get("/display")
      .expect(302)
      .expect('Location', '/')
      .end(done)
});

it('display-data shouldnt be run without login', function(done){
  request(app)
      .get("/display-data")
      .expect(302)
      .expect('Location', '/')
      .end(done)
});

it('all shouldnt be run without login', function(done){
  request(app)
      .get("/all")
      .expect(302)
      .expect('Location', '/')
      .end(done)
});

it('home shouldnt be run without login', function(done){
  request(app)
      .get("/home")
      .expect(302)
      .expect('Location', '/')
      .end(done)
});

it('canApp shouldnt be run without login', function(done){
  request(app)
      .get("/canApp")
      .expect(302)
      .expect('Location', '/')
      .end(done)
});

it('goemans shouldnt be run without login', function(done){
  request(app)
      .get("/goemans")
      .expect(302)
      .expect('Location', '/')
      .end(done)
});

// it('skuwSearch shouldnt be run without login', function(done){
//   request(app)
//       .get("/skuwSearch")
//       //.send({ Sku_name: "adsasda"})
//       .expect(302)
//       .expect('Location', '/')
//       .end(done)
// });

it('midAppl shouldnt be run without login', function(done){
  request(app)
      .get("/midAppl")
      .expect(302)
      .expect('Location', '/')
      .end(done)
});

it('coastAppl shouldnt be run without login', function(done){
  request(app)
      .get("/coastAppl")
      .expect(302)
      .expect('Location', '/')
      .end(done)
});
});


// describe("session render test", function () {
//   beforeEach(function () {
//     let cookie = mockSession('session', 'bigpete', {"count":1});   
//   });
//   it('should delete a single user on post request for /delete/:id', async()=> {
//         var res0 = await request(app).get('/dashboard').expect('Location','/urlPage');
//   })
// });