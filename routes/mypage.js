var express = require('express');
var router = express.Router();

var sqlite3 = require("sqlite3");
var db = new sqlite3.Database("mydb.sqlite3");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.post('/',function(req, res){
  if(req.session.username == undefined) {
    res.send({});
  } else {
    let name = req.session.username;
    db.serialize(() => {
      db.all("select * from users", (err, rows) => {
          rows.forEach(e => {
              if(e.name == name) {
                res.send(JSON.stringify(e));
                return ;
              }
          });
      });
    });
  }
});

module.exports = router;