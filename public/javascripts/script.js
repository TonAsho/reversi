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
let can_turn = [], now = []; // ひっくり返せる駒のID
let hh, ww, cnt, notPut = false, number = 4;
let bot = false;
let history = []; // 記録する
let monte_field; let last_time = false;
let kihu_now = false, kihu_ok = false, kihu_edi = false;
let aite_name = "";
monte_reset();

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
        if(kihu_now) {
            if(!kihu_ok && !kihu_edi) {
                // 編集開始
                document.getElementById("kihu_finish_edi").style.display = "block";
                kihu_edi = true;
                al("編集を開始します。バグるので優しく扱ってください。");
                document.getElementById("kihu_next").style.pointerEvents = "none";
                document.getElementById("kihu_back").style.pointerEvents = "none";
            }
        }
        if(his.length > 0) getId(his[his.length-1]).style.backgroundColor = "lightgreen";
        delMark(), can_turn.push(id), changeColor();getId(id).style.backgroundColor = "green";
        his.push(id);
        if(turn === 1) turn = -1;else turn = 1;
        if(!bot) utu(id);
        can_turn = [];
        number++;
        if(number === 64) {
            finish();
            return;
        }
        putMark();            
        if(bot && turn == -1) {
            setTimeout(() => {
                let x = -10000, p = 0;
                let turns;
                if(turn == 1) turns = 1;
                else turns = -1;
                for(let i = 0; i < mark.length; ++i) {
                    let x_cnt = 0;
                    let one = 1000, two = 1000;
                    if(mark.length <= 1) one = 1000;
                    else if(mark.length <= 2) one = 5000;
                    else if(mark.length <= 4) one = 2000;
                    if(number <= 20) two = 1000;
                    else if(number <= 35) two = 2000;
                    else two = 3000;
                    for(let j = 0; j < Math.max(one, two); ++j) {
                        monte_reset();
                        turn = turns;
                        monte_put(mark[i]);
                        if(monte() == true) x_cnt+=1;
                    }
                    if(x_cnt > x) {
                        x = x_cnt;
                        p = i;
                    }
                }
                turn = turns;
                ok = true;
                yech(mark[p]);
                ok = false;
                return ;
            }, 400);
        }
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
    document.getElementById("time1").style.display = "block";
    document.getElementById("time2").style.display = "block";
    document.getElementById("p2").innerHTML = document.getElementById("logined").innerHTML;
    document.getElementById("p1").innerHTML = aite_name;
    for(let i = 0; i < H; ++i) for(let j = 0; j < W; ++j) {
        let add = document.createElement("div");
        get(i, j).innerHTML = "";
        if(field[i][j] == 1) add.className = "black", get(i, j).appendChild(add);
        else if(field[i][j] == -1) add.className = "white", get(i, j).appendChild(add);
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
        can_turn = [];
    }
    if(mark.length === 0) {
        if(notPut) {
            if(number === 64) return;
            notPut = false;
            finish();
            return;
        }
        if(turn === 1) turn = -1, al("置けまへんので黒番がパスしました！");
        else turn = 1, al("置けまへんので白番がパスしました！");
        his.push("pass");
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
    document.getElementById("time1").style.display = "none";
    document.getElementById("time2").style.display = "none";
    reset();
}

// ボットと対戦
function botGame() {
    document.getElementById("main").style.display = "none";
    start();
    bot = true;
    al("モンテカルロ法によるオセロAIです。強さは分かりません。");
}

// オセロAI：モンテカルロ法
// monte_fieldに状態を入れておけば対局してくれます。
function monte() {
    let ava = []; // 今置ける場所
    for(let i = 0; i < H; ++i) for(let j = 0; j < W; ++j) {
        if(monte_field[i][j] != 0) continue;
        if(monte_change(i, j)) {
            ava.push(8 * i + (j + 1));
        }
        can_turn = [];
    }
    // 終了する場合
    if(ava.length == 0) {
        if(last_time) {
            // 終わりです。
            let b = 0, w = 0;
            for(let i = 0; i < H; ++i) for(let j = 0; j < W; ++j) {
                if(monte_field[i][j] == 1) b++;
                if(monte_field[i][j] == -1) w++;
            }
            monte_reset();
            if(w > b) return true;
            else return false;
        }
        if(turn == 1) turn = -1;else turn = 1;
        last_time = true;
        return monte();
    } else {
        last_time = false;
    }
    // モンテカルロ法
    let ram = Math.floor(Math.random() * ava.length);
    monte_put(ava[ram]);
    if(turn == 1) turn = -1;else turn = 1;
    return monte();
}
function monte_put(e) {
    let h = Math.floor(e / 8), w = e % 8;if(w === 0) w = 8, h--;
    w--;
    monte_change(h, w);
    can_turn.push(e);
    can_turn.forEach(element => {
        h = Math.floor(element / 8), w = element % 8;if(w === 0) w = 8, h--;w--;
        monte_field[h][w] = turn;
    })
    can_turn = [];
}
function monte_change(h, w) {
    for(let i = 0; i < 8; ++i) {
        hh = h, ww = w;
        cnt = 0;
        if(monte_f(moveH[i], moveW[i])) {
            now.forEach(element => {
                can_turn.push(element);
            });
        }
        now = [];
    }
    return (can_turn.length > 0);
}
function monte_f(h, w) {
    hh += h, ww += w;
    if(hh < 0 || hh >= H || ww < 0 || ww >= W) return false;
    if(turn + monte_field[hh][ww] == 0) {
        cnt++;
        now.push(8 * hh + (ww + 1));
        return monte_f(h, w);
    } else if(turn == monte_field[hh][ww]) {
        if(cnt > 0) return true;
        else return false;
    }
}

// monte_fieldにfieldの値を渡す
function monte_reset() {
    monte_field = [ // "1" is black, "-1" is white;
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,-1,1,0,0,0],
    [0,0,0,1,-1,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    ];
    for(let i = 0; i < H; ++i) for(let j = 0; j < W; ++j) {
        if(field[i][j] == 1) monte_field[i][j] = 1;
        if(field[i][j] == -1) monte_field[i][j] = -1;
        if(field[i][j] == 0) monte_field[i][j] = 0;
    }
    last_time = false;
}

// 棋譜rの棋譜再生
let r = {history:['44', '27', '20', '11', '21', '38', "pass", '30', '35', '45', '52', '43', '34', '19', '12', '5', '46', '51', '42', '53', '54', '62', '59'], sente:"Toncochan", gote:"KatukiSaikyou"};
let it = -1;
function review() {
    document.getElementById("kihu_next").style.display = "block";
    document.getElementById("kihu_back").style.display = "block";
    document.getElementById("myPage").style.display = "none";
    start();
    document.getElementById("p2").innerHTML = r.sente;
    document.getElementById("p1").innerHTML = r.gote;
    ok = true;
    kihu_now = true;
    it = -1;
}
function kihu_next() {
    if(it+1 >= r.history.length) {
        let b = 0, w = 0;
        for(let i = 0; i < H; ++i) for(let j = 0; j < W; ++j) {
            if(field[i][j] == 1) b++;
            if(field[i][j] == -1) w++;
        }
        if(b < w) al(`黒${b}、白${w}で白の勝ち！！`);
        else if(b > w) al(`黒${b}、白${w}で黒の勝ち！！`);
        else  al(`黒${b}、白${w}で引き分け！！`);
        return ;
    }
    it++;
    if(r.history[it] == "pass") return;
    kihu_ok = true;
    yech(r.history[it]);
    kihu_ok = false;
}
function kihu_back() {
    if(it == -1) return ;
    let x = it;
    review();
    it = -1;
    for(let i = -1; i < x-1; ++i) {
        kihu_next();
    }
    it = x-1;
}
function kihu_finish_edi() {
    kihu_edi = false;
    kihu_back();
    document.getElementById("kihu_next").style.pointerEvents = "";
    document.getElementById("kihu_back").style.pointerEvents = "";
    document.getElementById("kihu_finish_edi").style.display = "none";
    return ;
}
function kihu_finish() {
    reset();
    document.getElementById("kihu_next").style.display = "none";
    document.getElementById("kihu_back").style.display = "none";
    document.getElementById("myPage").style.display = "block";
    document.getElementById("border").style.display = "none";
    document.getElementById("time1").style.display = "none";
    document.getElementById("time2").style.display = "none";
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
    history = [];
    monte_reset();
    kihu_now = false, kihu_ok = false, kihu_edi = false;
}