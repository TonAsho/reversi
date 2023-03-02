var express = require('express');
var router = express.Router();

var sqlite3 = require("sqlite3");
var db = new sqlite3.Database("mydb.sqlite3");
/* GET users listing. */
router.get('/', function(req, res, next) {
    if(req.session.username != undefined) {
        res.redirect("/");
    } else {
        res.render("subscribe", {flg:true});
    }
});

router.post('/', (req, res, next) => {
    if(req.session.username != undefined) {
        res.redirect("/");
        return;
    }
    let name = req.body.name;
    let password = req.body.password;
    // db.run("insert into users (name, password) values (?,?)", req.body.name, req.body.password, (err) => {
    //     if(err) return console.error(err.message);
    // });
    let flg = true;
    db.serialize(() => {
        db.all("select * from users", (err, rows) => {
            rows.forEach(e => {
                let x = JSON.parse(e.user);
                if(x.name == name) {
                    flg = false;
                }
            });
            if(flg) {
                db.serialize(() => {
                    db.run("insert into users (user) values(?);",`{"name":"${name}","password":"${password}","win":0,"lose":0,"total":0,"history":[]}`);
                    req.session.username = name;
                    res.redirect("/");
                })
            } else {
                res.render("subscribe", {flg:false});
            }
            console.log(rows);
        });
    });
});


module.exports = router;