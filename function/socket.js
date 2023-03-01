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
            io.to(wait[i]).emit("gameStart", {turn : true});
            io.to(wait[i + 1]).emit("gameStart", {turn : false});
            i++;
        }
        let num = wait[wait.length - 1], gameCount = wait.length;
        wait = [];
        if(gameCount%2 == 1) wait[0] = num;
    }) 

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
        db.all("select * from users", (err, rows) => {
            rows.forEach(e => {
                if(e.name == obj.name) {
                  db.serialize(() => {
                    if(obj.win == 1) db.run("update users set win=? where id=?",e.win+1,e.id)
                    else if(obj.win == -1) db.run("update users set lose=? where id=?",e.lose+1,e.id);
                    db.run("update users set total=? where id=?",e.total+1,e.id);
                    return ;
                  });
                }
            });
            console.log(rows)
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
            db.all("select * from users", (err, rows) => {
            rows.forEach(e => {
                  if(e.name == name.get(value)) {
                    db.serialize(() => {
                      db.run("update users set lose=? where id=?",e.lose+1,e.id);
                      db.run("update users set total=? where id=?",e.total+1,e.id);
                      name.delete(value);
                    })
                  }
              });
            });
          }
        })
        io.emit("userCount", (userCount));
    });
  });
}

module.exports = chat;