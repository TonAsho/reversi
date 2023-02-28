var express = require('express');
var router = express.Router();

var sqlite3 = require("sqlite3");
var db = new sqlite3.Database("mydb.sqlite3");

/* GET users listing. */
router.get('/', function(req, res, next) {  
  if(req.session.username != undefined) {
    res.redirect("/");
  }
  else {
    res.render("login", {flg:true});
  }
});

router.post('/', (req, res, next) => {  
  if(req.session.username != undefined) {
    res.redirect("/");
    return;
  }
  let name = req.body.name;
  let password = req.body.password;
  let flg = false;
  db.serialize(() => {
      db.all("select * from users", (err, rows) => {
          rows.forEach(e => {
              if(e.name == name && e.password == password) {
                  flg = true;
              }
          });
          if(flg) {
            // ログイン成功
              req.session.username = name;
              res.redirect("/");
          } else {
            res.render("login", {flg:false});
          }
      });
  });
});

module.exports = router;
