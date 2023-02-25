const socket = io();

//　入場者数取得
socket.on("userCount", (cnt) => {
    document.getElementById("userCount").innerHTML = cnt;
})

//　対戦相手が決まる
socket.on("gameStart", (e) => {
    console.log("gameStart!!");
    // 先手か後手か
    if(e.turn) {
        s = 1;
    } else {
        s = -1;
    }
    start();
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
document.getElementById("start").addEventListener("click", (e) => {
    document.getElementById("main").style.display = "none";
    document.getElementById("wait").style.display = "block";
    socket.emit("start");
})
document.getElementById("back").addEventListener("click", (e) => {
    document.getElementById("main").style.display = "block";
    document.getElementById("wait").style.display = "none";

})