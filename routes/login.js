var express = require('express');
var router = express.Router();

var sqlite3 = require("sqlite3");
var db = new sqlite3.Database("mydb.sqlite3");

/* GET users listing. */
router.get('/', function(req, res, next) {
  // db.run("drop table users", (err) => {
  //   if(err) {
  //     console.error(err.message);
  //   } else {
  //     console.log("deleted succecfully");
  //   }
  // });
  // db.run("CREATE TABLE history (id	INTEGER NOT NULL UNIQUE,history	JSON,PRIMARY KEY(id AUTOINCREMENT));", (err) => {
  //   if(err) {
  //     console.error(err.message);
  //   } else {
  //     console.log("made succecfully");
  //   }
  // });
  // db.run("delete from users where id < 1000;", (err) => {
  //   if(err) console.error(err.message);
  //   else console.log("deleted succecfully");
  // });
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
      // db.run('insert into users (user) values(?);','{"name":"b","password":"b","win":0,"lose":0,"total":0,"history":[]}', (err) => {
      //   if(err) {
      //     console.error(err.message);
      //   } else {
      //     console.log("added suceccfully");
      //   }
      // });  
      // db.all("select * from users where id=3", (e, r) => {
      //   let obj = JSON.parse(r[0].user);
      //   console.log(obj);
      // })
      db.all(`select * from users`, (err, rows) => {
          rows.forEach(e => {
            let x = JSON.parse(e.user);
            if(x.name == name && x.password == password) {
              flg = true;
            }
          });
          if(flg) {
              req.session.username = name;
              res.redirect("/");
          } else {
            res.render("login", {flg:false});
          }
      });
  });
});

module.exports = router;
