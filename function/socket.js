const { Server } = require('socket.io');

var sqlite3 = require("sqlite3");
var db = new sqlite3.Database("mydb.sqlite3");

let userCount = 0;
let wait = [];
let game = new Map();
let name = new Map();

const chat = (server) => {
  const io = new Server(server);
  io.on('connection', (socket) => {
    userCount++;
    io.emit("userCount", (userCount));
    
    //　名前の取得
    socket.on("name", (e) => {
      name.set(socket.id, e.name);
    })
    
    //　マッチメイク
    socket.on("start", () => {
        wait.push(socket.id);
        io.emit("waitingCount", {count : wait.length});
        for(let i = 0; i < wait.length - 1; ++i) {
            game.set(wait[i], wait[i + 1]);
            game.set(wait[i + 1], wait[i]);
            io.to(wait[i]).emit("gameStart", {turn : true, aite_name : name.get(wait[i+1])});
            io.to(wait[i + 1]).emit("gameStart", {turn : false, aite_name : name.get(wait[i])});
            i++;
        }
        let num = wait[wait.length - 1], gameCount = wait.length;
        wait = [];
        if(gameCount%2 == 1) wait[0] = num;
    });

    // マッチメイキング辞退
    socket.on("back", () => {
      let now = [];
      for(let i = 0; i < wait.length; ++i)  {
        if(wait[i] != socket.id) now.push(wait[i]);
      }
      wait = now;
    })

    // 駒を打った
    socket.on("utu", (e) => {
        io.to(game.get(socket.id)).emit("getUtu", {id: e.id});
    })

    // 試合終了
    socket.on("finish", (obj) => {
      game.delete(socket.id);
      db.serialize(() => {
        db.run("insert into history (history) values (?)", `{"history":"${obj.history}", "sente":"${obj.sente}", "gote":"${obj.gote}"}`);
        let id = 0;
        db.all("select * from history", (err, result) => {
          id = JSON.parse(result[result.size() - 1]).id;
        })
        db.all("select * from users", (err, rows) => {
          rows.forEach(e => {
            let x = JSON.parse(e.user);
              if(x.name == obj.name) {
                db.serialize(() => {
                  if(obj.win == 1) x.win++;
                  else if(obj.win == -1) x.lose++;
                  x.total++;
                  x.history.push(id);
                  db.run("update users set user=? where id=?",x,e.id);
                  return ;
                });
              }
          });
        });
      });
    })

    // 退出
    socket.on('disconnect', () => {
        userCount--;

        //　マッチメイキング辞退
        let now = [];
        for(let i = 0; i < wait.length; ++i)  {
          if(wait[i] != socket.id) now.push(wait[i]);
        }
        wait = now;
        // もし、試合中だったら負けにする
        game.forEach((value, key) => {
          if(value == socket.id) {
            // valueが負けで、keyが勝ち
            io.to(game.get(value)).emit("disconnectWin");
            game.delete(value);
            db.serialize(() => {
              db.all("select * from users", (err, rows) => {
                rows.forEach(e => {
                      let x = JSON.parse(e.user);
                      if(x.name == name.get(value)) {
                        db.serialize(() => {
                          x.total++;
                          x.lose++;
                          db.run("update users set user=? where id=?",x,e.id);
                          name.delete(value);
                        })
                      }
                  });
                });
            })

          }
        })
        io.emit("userCount", (userCount));
    });
  });
}

module.exports = chat;