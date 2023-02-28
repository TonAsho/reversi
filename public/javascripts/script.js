let field = [ // "1" is black, "-1" is white;
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,-1,1,0,0,0],
    [0,0,0,1,-1,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
];
let turn = 1; // black
let s = 1; //先手:１、　後手:-1
let ok = false;
let H = 8, W = 8;
const moveH = [0, 0, 1, -1, 1, 1, -1, -1], moveW = [1, -1, 0, 0, 1, -1, -1, 1];
let mark = [], his = [];
let hh, ww, cnt, notPut = false, number = 4;
let can_turn = [], now = []; // ひっくり返せる駒のID
let bot = false;

function yech(id) { 
    if(turn != s && !ok) {
        al("相手の手番です！");
        return;
    }
    let h = Math.floor(id / 8), w = id % 8;
    if(w === 0) w = 8, h--;
    w--;
    if(field[h][w] != 0) return; //何もない場所か
    // おいてとれるか
    // ひっくり返す
    if(change(h, w)) {
        if(his.length > 0) getId(his[his.length-1]).style.backgroundColor = "lightgreen";
        delMark(), can_turn.push(id), changeColor();
        his.push(id);
        getId(id).style.backgroundColor = "green";
        if(turn === 1) turn = -1;
        else turn = 1;
        if(!bot) utu(id);
        can_turn = [], now = [];
        number++;
        if(number === 64) {
            finish();
            return;
        }
        putMark();
        if(bot && turn == -1) {
            ok = true;
            yech(mark[Math.floor(Math.random() * mark.length)]);
            ok = false;
        }
        return ;
    }
    else {
        al("そこには置けません！")
    } 

}
function change(h, w) {
    for(let i = 0; i < 8; ++i) {
        hh = h, ww = w;
        cnt = 0;
        if(f(moveH[i], moveW[i])) {
            now.forEach(element => {
                can_turn.push(element);
            });
        }
        now = [];
    }
    return (can_turn.length > 0);
}
function f(h, w) {
    hh += h, ww += w;
    if(hh < 0 || hh >= H || ww < 0 || ww >= W) return false;
    if(turn + field[hh][ww] == 0) {
        cnt++;
        now.push(8 * hh + (ww + 1));
        return f(h, w);
    } else if(turn == field[hh][ww]) {
        if(cnt > 0) return true;
        else return false;
    }
}
function changeColor() {
    can_turn.forEach(e => {
        let h = Math.floor(e / 8), w = e % 8;
        if(w === 0) w = 8, h--;
        w--;
        document.getElementById(String(e)).innerHTML = "";
        let add = document.createElement("div");
        if(turn == 1) add.className = "black", document.getElementById(String(e)).appendChild(add), field[h][w] = 1;
        if(turn == -1) add.className = "white", document.getElementById(String(e)).appendChild(add), field[h][w] = -1;
    });
}
function start() {
    reset();
    document.getElementById("wait").style.display = "none";
    document.getElementById("border").style.display = "block";
    for(let i = 0; i < H; ++i) for(let j = 0; j < W; ++j) {
        let add = document.createElement("div");
        if(field[i][j] == 1) add.className = "black", get(i, j).appendChild(add);
        else if(field[i][j] == -1) add.className = "white", get(i, j).appendChild(add);
        else get(i, j).innerHTML = "";
        get(i, j).style.backgroundColor = "lightgreen";
    }
    putMark();
}
function delMark() {
    mark.forEach(e => {
        //document.getElementById(String(e)).className = "ban";
        document.getElementById(String(e)).innerHTML = "";
    });
    mark = [];
}
function putMark() {
    for(let i = 0; i < H; ++i) for(let j = 0; j < W; ++j) {
        if(field[i][j] != 0) continue;
        if(change(i, j)) {
            mark.push(8 * i + j + 1);
            let add = document.createElement("div");
            add.className = "banMark";
            get(i, j).appendChild(add);
        }
        can_turn = [], now = [];
    }
    if(mark.length === 0) {
        if(notPut) {
            if(number === 64) return;
            notPut = false;
            finish();
            return;
        }
        if(turn === 1) turn = -1, al("置けまへんので黒番がパスしました！");
        else turn = 1, al("置けまへんので白番がパスしました！");;
        notPut = true;
        putMark();
    } else notPut = false;
}
function get(i, j) {
    return document.getElementById(String(8 * i + (j + 1)));
}
function getId(id) {
    return document.getElementById(String(id));
}
async function finish() {
    let black = 0, white = 0;
    for(let i = 0; i < H; ++i) for(let j = 0; j < W; ++j) {
        if(field[i][j] === 1) black++;
        else if(field[i][j] === -1) white++;
    }
    await al("試合終了！！");
    let b = 0, w = 0;
    for(let i = 0; i < H; ++i) for(let j = 0; j < W; ++j) {
        if(field[i][j] == 1) b++;
        else if(field[i][j] == -1) w++;
    }
    if(!bot) {
        if((s==1&&b>w)||(s==-1&&w>b)) socketFinish(1, document.getElementById("logined").innerHTML);
        else if((s==-1&&b>w)||(s==1&&w>b)) socketFinish(-1, document.getElementById("logined").innerHTML);
        else socketFinish(0, document.getElementById("logined").innerHTML);
    }
    if(b < w) await al(`黒${b}、白${w}で白の勝ち！！`);
    else if(b > w) await al(`黒${b}、白${w}で黒の勝ち！！`);
    else  await al(`黒${b}、白${w}で引き分け！！`);
    document.getElementById("main").style.display = "block";
    document.getElementById("border").style.display = "none";
    reset();
}

// ボットと対戦
function botGame() {
    document.getElementById("main").style.display = "none";
    start();
    bot = true;
    al("ランダムに置きます。負けたらオセロを引退しましょう。");
}

//　全情報のリセット
function reset() {
    field = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,1,-1,0,0,0],
        [0,0,0,-1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ]
    turn = 1;
    s = 1;
    ok = false;
    H = 8, W = 8;
    mark = [], his = [];
    hh, ww, cnt, notPut = false, number = 4;
    can_turn = [], now = [];
    bot = false;
}