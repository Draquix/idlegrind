console.log('script loaded');
const socket = io();

//elements
const msgs = document.querySelector('#msgs');
const display = document.querySelector('#display');
const action = document.querySelector('#action');
const canvas = document.querySelector('#game');
const love = 42;

let post = document.createElement('p');
post.innerText = "display loaded";
display.appendChild(post);
let loaded = document.createElement('p');
loaded.innerText = "action loaded";
action.appendChild(loaded);
var character={
    xpos:2,
    ypos:2
}
function draw(){
    let canvas = document.getElementById('game');
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,360,360)
    let tile = 18;
    let xpos = 1, ypos = 1;
    let countP = 0, countC = 0;
    let map = Data.maps[0];
    ctx.font = '18px Helvetica';
    for (let i = 0; i < map.length; i++){
        for (let j = 0; j < map[i].length; j++){
            if (map[i][j]==="#"){
                ctx.fillStyle = 'brown';
                ctx.fillText('#',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="."){
                ctx.fillStyle = 'grey';
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="*"){
                ctx.fillStyle = "yellow";
                ctx.fillText('*',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]===","){
                ctx.fillStyle = 'white';
                ctx.fillText('.',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="~"){
                ctx.fillStyle = 'blue';
                ctx.fillText('~',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="P"){
                ctx.fillStyle = 'blue';
                ctx.fillText('P',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
                countP++;
            }
            if (map[i][j]===";"){
                ctx.fillStyle = 'brown';
                ctx.fillText(';',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="t"){
                ctx.fillStyle = 'grey';
                ctx.fillText('^',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="f"||map[i][j]==="F"){
                ctx.fillStyle = 'blue';
                ctx.fillText('@',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="i"||map[i][j]==="O"){
                ctx.fillStyle = 'brown';
                ctx.fillText('^',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            // if (map[i][j]==="/"||map[i][j]==="O"||map[i][j]){
            //     ctx.fillStyle = 'green';
            //     ctx.fillText('|',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            // }
            if (map[i][j]==="="){
                ctx.fillStyle = "red";
                ctx.fillText('=',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="-"){
                ctx.fillStyle = "white";
                ctx.fillText('=',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="1"||map[i][j]==="2"){
                ctx.fillStyle = "brown";
                ctx.fillText('+', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="&"){
                ctx.fillStyle = "red";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="T"){
                ctx.fillStyle = "green";
                ctx.fillText('T', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="$"){
                ctx.fillStyle = "yellow";
                ctx.fillText('$', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="%"){
                ctx.fillStyle = "brown";
                ctx.fillText('%', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="Q"){
                ctx.fillStyle = "dark grey";
                ctx.fillText('&', (xpos*j*tile)+1,(ypos*(i+1)*tile)+1);
            }
        }
    ctx.fillStyle = "white";
    ctx.fillText(",",25*tile,29*tile);
    ctx.fillText(character.xpos+1,24*tile,29*tile);
    ctx.fillText(character.ypos,26*tile,29*tile);
    ctx.fillStyle = "blue";
    ctx.fillText(character.tileTarget,4*tile,29*tile);
    }
}
socket.on('msg', data => {
    let msg = document.createElement('p');
    msg.innerHTML = data.msg;
    msgs.appendChild(msg);
});

let localID = 0;
socket.on('handshake', (id) =>{
    localID = id;
});
var Data = {};
    Data.maps = [];
const mapArr = [
    ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
    ['#','.',',','#','=','#','-','#',',','.','.',',','#','#','c','#','#','.','#'],
    ['#','.',',','.','.','*','.','.',',','.','.',',','#',';',';',';',';',';','#','#'],
    ['#','.','.','.','.','.','.','.','.','.','.','.','#','.',';','.','.',',','/','#'],
    ['#','.','.','P','.','.','.','.','.','#','1','#','#','.','.','.','.',',','/','#','#'],
    ['#',',','.','.',',','.','.',',','.','#',',','.','.','.','.','.','.','/',',','O','#'],
    ['#',',','.','.',',','.','.',',','.','#',',','.','.','.','.','/','T','.',',','/','#'],
    ['#',',','.','.',',','.','P',',','.','#','.','.','.','.','.','.','/','.',',',';','#'],
    ['#',',','.','.',',','.','%',',','.','&','#','.','.','.','.','.','.','.',',','#','#'],
    ['#',',','.','.',',','.','.',',','.','*','#','.','.','.','.','.','.','.',';','.','#'],
    ['#','#','#','#','#','#','#','#','#','#','#','.','.','.','.','.','.','.',';','t','#','#','#','#','#','#'],
    ['#','.','.','.','.','.','.',';','.',',','.','.','.','.',';','.',',','.','.','.','.',';',';',',',';','#'],
    ['#','~','.','.',';','.','.',',',',',',','.','.',';','.',';','.',',','.','.','.','.','.','.',',','i','#'],
    ['#','~','~','.','.','.','.',';','.',',','.','.','.','.',',','.',',','.','.','.','.',';','.',';','#','#'],
    ['#','~','~','f','.','.','.','.','.',',','.','.','.','.',';','.',',',',','.','.','.','.','.','#','#'],
    ['#','~','~','~','~','~','~','~','~','F','~','.','.','.','.','.',',','.','.','.','.',';','.','#'],
    ['#','#','#','#','#','#','#','#','#','#','~','#','#','#','#','#','#','#','#','#','#','#','#','#'],

];
Data.maps.push(mapArr);
draw();
console.log(localID);
