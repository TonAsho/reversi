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
        x.histories = [];
        if(x.name == name) {
          new Promise(resolve => {
            if(x.history.length == 0) resolve();
            for(let i = x.history.length - 1; i >= Math.max(x.history.length-5,0); i--) {
              db.all("select * from histories where id=?",x.history[i], (err, result) => {
                x.histories.push(result[0]);
                if(i == Math.max(x.history.length-5,0)) {
                  resolve();
                }
              })
            }
          })
          .then(() => {
            res.send(x);
          });
        }
      });
    });
  }
});

module.exports = router;