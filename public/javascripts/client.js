const socket = io();

//　入場者数取得
socket.on("userCount", (cnt) => {
    document.getElementById("userCount").innerHTML = cnt;
})

//　名前の送信
socket.emit("name", {name : document.getElementById("logined").innerHTML});

// マッチメイキング辞退
function back() {
    socket.emit("back");
}
//　対戦相手が決まる
socket.on("gameStart", (e) => {
    console.log("gameStart!!");
    // 相手の名前
    aite_name = e.aite_name;
    start();
    // 先手か後手か
    if(e.turn) {
        s = 1;
    } else {
        s = -1;
    }   
})

//マッチング中の人数取得
socket.on("waitingCount", (e) => {
    document.getElementById("waitingCount").innerHTML = `${e.count}人が待機中`;
})

//　手を打つ
function utu(id) {
    socket.emit("utu", {id: id});
}
//　手を受け取る
socket.on("getUtu", (e) => {
    getUtu(e.id);
})
function getUtu(id) {
    ok = true;
    yech(id);
    ok = false;
}

// 試合終了したときに、サーバーに知らせる
function socketFinish(win, accountname, hiss, sente, gote) {
    socket.emit("finish", {win:win, name:accountname, history:hiss,sente:sente,gote:gote});
}

// 通信切れ勝ち
socket.on("disconnectWin", () => {
    socket.emit("finish", {win:1, name:document.getElementById("logined").innerHTML,history:history,sente:sente,gote:gote});
    al("相手との接続が切れました。あなたの勝ちです！");
    document.getElementById("main").style.display = "block";
    document.getElementById("border").style.display = "none";
    reset();
})

document.getElementById("start").addEventListener("click", (e) => {
    if(document.getElementById("logined").innerHTML == "") {
        al("ログイン後に利用できます！");
        return;
    }
    document.getElementById("main").style.display = "none";
    document.getElementById("wait").style.display = "block";
    socket.emit("start");
})
document.getElementById("back").addEventListener("click", (e) => {
    document.getElementById("main").style.display = "block";
    document.getElementById("wait").style.display = "none";
    back();
})