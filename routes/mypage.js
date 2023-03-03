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
    return res.send({});
  } else {
    let name = req.session.username;
    db.all("select * from users", (err, rows) => {
      rows.forEach(e => {
        let x = JSON.parse(e.user);
          if(x.name == name) {
            return res.send(x);
          }
      });
    });
  }
});

module.exports = router;