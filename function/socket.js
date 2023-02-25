const { encodePayload } = require('engine.io-parser');
const { Server } = require('socket.io');

let userCount = 0;
let wait = [];
let game = new Map();

const chat = (server) => {
  const io = new Server(server);
  io.on('connection', (socket) => {
    userCount++;
    io.emit("userCount", (userCount));
    
    //　マッチメイク
    socket.on("start", () => {
        wait.push(socket.id);
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

    // 駒を打った
    socket.on("utu", (e) => {
        io.to(game.get(socket.id)).emit("getUtu", {id: e.id});
    })

    // 退出
    socket.on('disconnect', () => {
        userCount--;
        io.emit("userCount", (userCount));
    });
  });
}

module.exports = chat;