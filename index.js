var CELL_SIZE = 40;
var CELL_STATUS_UNKNOWN = 0;
var CELL_STATUS_SAFE = 1;
var CELL_STATUS_FLAG = 2;

var GAME_STATUS_PLAYING = 0;
var GAME_STATUS_WIN = 1;
var GAME_STATUS_LOSE = 2;

var g_gameStatus = GAME_STATUS_PLAYING;
var g_map = [];
var g_checkedMap = [];
var g_checkPosList = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    //    [0, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1]
];

var g_width = 0;
var g_height = 0;
var g_mineCnt = 0;

function showMines() {
    var cells = document.querySelectorAll(".cell");
    for (var i in cells) {
        var cell = cells[i];
        cell.innerText = g_map[i];
    }
}

function calMinesCnt(index) {
    var cnt = 0;

    var x = index % g_width;
    var y = Math.floor(index / g_width);

    for (var i in g_checkPosList) {
        var pos = g_checkPosList[i];
        var rx = x + pos[0];
        var ry = y + pos[1];
        if (rx < 0 || rx >= g_width)
            continue;
        if (ry < 0 || ry >= g_height)
            continue;

        if (rx === x && ry === y)
            continue;

        if (g_map[g_width * ry + rx] == -1)
            cnt++;
    }

    return cnt;
}

function generateStage() {
    var maxCnt = g_width * g_height;

    g_map = [];
    g_checkedMap = [];
    var i;
    for (i = 0; i < maxCnt; ++i) {
        g_map.push(0);
        g_checkedMap.push(CELL_STATUS_UNKNOWN);
    }

    for (i = 0; i < g_mineCnt; ++i) {
        var x = Math.floor((Math.random() * g_width));
        var y = Math.floor((Math.random() * g_height));

        g_map[g_width * y + x] = -1;
    }

    for (i = 0; i < maxCnt; ++i) {
        if (g_map[i] == -1)
            continue;

        g_map[i] = calMinesCnt(i);
    }
    //showMines();
}

function changeCellColor(index) {
    var ele = document.querySelector('.cell[data-index="' + index + '"]');
    ele.style['background-color'] = "#fff";
    g_checkedMap[index] = CELL_STATUS_SAFE;
    if (g_map[index] === 0)
        return;
    ele.innerText = g_map[index];
}

function checkedCell(index) {
    return g_checkedMap[index];
}

function clicked(index) {
    if (checkedCell(index) !== CELL_STATUS_UNKNOWN) {
        return false;
    }

    changeCellColor(index);

    if (g_map[index] !== 0) {
        return true;
    }

    var x = index % g_width;
    var y = Math.floor(index / g_width);

    for (var i in g_checkPosList) {
        var pos = g_checkPosList[i];
        var rx = x + pos[0];
        var ry = y + pos[1];
        var ri = ry * g_width + rx;

        if (rx < 0 || rx >= g_width)
            continue;
        if (ry < 0 || ry >= g_height)
            continue;

        clicked(ri);
    }

    return true;
}

function onContextmenu(e) {
    e.preventDefault();

    if (g_gameStatus !== GAME_STATUS_PLAYING)
        return;

    var srcEle = e.srcElement;
    var index = srcEle.getAttribute('data-index');

    if (g_checkedMap[index] === CELL_STATUS_SAFE)
        return;

    if (g_checkedMap[index] === CELL_STATUS_UNKNOWN) {
        srcEle.style['background-color'] = "#0f0";
        g_checkedMap[index] = CELL_STATUS_FLAG;
    } else {
        srcEle.style['background-color'] = "#aaa";
        g_checkedMap[index] = CELL_STATUS_UNKNOWN;
    }
}

function checkGameStatus() {
    var safe_cnt = 0;
    for (i = 0; i < g_checkedMap.length; ++i)
        if (g_checkedMap[i] === CELL_STATUS_SAFE)
            safe_cnt++;

    if (safe_cnt === g_checkedMap.length - g_mineCnt) {
        alert('게임 승리!');
        g_gameStatus = GAME_STATUS_WIN;
    }
}

function onClickCell() {
    if (g_gameStatus !== GAME_STATUS_PLAYING)
        return;

    var index = this.getAttribute('data-index');

    if (g_map[index] === -1) {
        g_gameStatus = GAME_STATUS_LOSE;
        showMines();
        alert("bomb!");
        return;
    }

    clicked(index);

    checkGameStatus();
}

function generateStageHTML() {
    var maxCnt = g_width * g_height;

    var ele = document.querySelectorAll("#container")[0];
    ele.style.width = (CELL_SIZE + 2) * g_width + "px";

    ele.innerHTML = '';


    var cell;
    for (var i = 0; i < maxCnt; i++) {
        cell = document.createElement('div');
        cell.innerHTML = '<div class="cell" data-index=' + i + ' data-checked=false></div>';
        cell.firstChild.style.width = CELL_SIZE + "px";
        cell.firstChild.style.height = CELL_SIZE + "px";
        cell.firstChild.onclick = onClickCell;

        ele.appendChild(cell.firstChild);
    }
}

function init(width, height, mineCnt) {
    g_width = width;
    g_height = height;
    g_mineCnt = mineCnt;
    g_gameStatus = GAME_STATUS_PLAYING;
    generateStageHTML();
    generateStage();
}

document.addEventListener("DOMContentLoaded", function () {
    init(9, 9, 10);
    window.oncontextmenu = onContextmenu;
});