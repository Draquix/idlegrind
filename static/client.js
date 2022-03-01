console.log('script loaded');
const socket = io();

//elements
const msgs = document.querySelector('#msgs');
const display = document.querySelector('#display');
const action = document.querySelector('#action');
let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
const love = 42;

let post = document.createElement('p');
post.innerText = "display loaded";
display.appendChild(post);
let loaded = document.createElement('p');
loaded.innerText = "action loaded";
action.appendChild(loaded);
var player={
    xpos:1,
    ypos:1
}

var charBox = [];
charBox.push(player);
function draw(){
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
            if (map[i][j]==="t"){
                ctx.fillStyle = 'grey';
                ctx.fillText('^',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="O"){
                ctx.fillStyle = 'brown';
                ctx.fillText('T',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="i"){
                ctx.fillStyle = 'red';
                ctx.fillText('^',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="c"){
                ctx.fillStyle = 'brown';
                ctx.fillText('^',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="/"){
                ctx.fillStyle = 'green';
                ctx.fillText('|',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="="){
                ctx.fillStyle = "red";
                ctx.fillText('=',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="-"){
                ctx.fillStyle = "white";
                ctx.fillText('=',(xpos*(j)*tile)+1, (ypos*(i+1)*tile)+1);
            }
            if (map[i][j]==="+"){
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
    ctx.fillText(charBox[0].xpos+1,24*tile,29*tile);
    ctx.fillText(charBox[0].ypos,26*tile,29*tile);
    ctx.fillStyle = "blue";
    ctx.fillText(charBox[0].tileTarget,4*tile,29*tile);
    }
}
function charDisplay(atChest){
    display.innerHTML = " ";
    if(atChest===false){
        action.innerHTML = " ";
    }
    let player=charBox[0];
    // console.log("displaying object",player);
    let char = document.createElement('p');
        char.innerHTML = `Stats for ${player.name} <br> `;
        char.innerHTML +=`Hp: ${player.hp}/${player.mHp} || Level: ${player.level}  xpTnl: ${player.exp}/${player.expTnl} <br>`;
        char.innerHTML +=`Strength: ${player.str}  || Defense: ${player.def} || Agility: ${player.agi} <BR>`;
        char.innerHTML +=`Mining: ${player.mine} Xp/Tnl: ${player.mineXp}/${player.mineTnl} || Woodcutting: ${player.chop} Xp/Tnl: ${player.chopXp}/${player.chopTnl} <br> `;
        char.innerHTML +=`Cooking: ${player.cook} Xp/Tnl: ${player.cookXp}/${player.cookTnl} ||  Fishing: ${player.fish} Xp/Tnl: ${player.fishXp}/${player.fishTnl} <br>`;
        char.innerHTML +=`Forging: ${player.forge} Xp/Tnl: ${player.forgeXp}/${player.forgeTnl}  || Crafting: ${player.craft} Xp/Tnl: ${player.craftXp}/${player.craftTnl} <br>`;
        char.innerHTML +=`Carrying ${player.kg} out of maximum of ${player.maxKg} <br>`
        if(player.using.length>0){
            char.innerHTML += `Currently weilding: ${player.using[0].name} <BR>`;
        } else {
            char.innerHTML += `Empty Handed<BR>`;
        }
        char.innerHTML +=`Backpack: `
        if(atChest===false){
            console.log("not at chest");
            for(i in player.backpack){
                char.innerHTML += `${player.backpack[i].name}`
                if(player.backpack[i].type==="tool"){
                    char.innerHTML += ` <a href="javascript:useItem(${i});"> use </a>, `;
                } else {
                    char.innerHTML += `, `;
                }
            }
        } else {
            console.log("at chest");
            for(i in player.backpack){
                char.innerHTML += `${player.backpack[i].name} <a href="javascript:putChest(${i});"> store </a>, `;
            }
        }
        char.innerHTML+=`<br><br> Coordinates: ${player.xpos}x,${player.ypos}y <br>`;
        display.appendChild(char);
        let stacklist = [];
        for(i in player.backpack){
            let name = player.backpack[i].name;
            if(player.backpack[i].stackable===true){
                if(stacklist.length>0){
                    let bool = false;
                    for(i in stacklist){
                        if(stacklist[i]===name)
                        bool = true;
                    }
                    if(bool===false){
                        stacklist.push(name);
                    }
                } else {
                    stacklist.push(name);
                }
            }
        }
        for(i in stacklist){
            let btn = document.createElement('button');
            let name = stacklist[i];
            btn.innerText = "stack all " + name;
            btn.onclick = function () {
                stackThis(name);
            }
            display.appendChild(btn);
        }
}
function stackThis(itemName){
    console.log("wanting to stack",itemName);
    let pack = charBox[0].backpack;
    let stack = {
        name:"stacked " + itemName,
        pack:[],
        quantity:0,
        kg:0,
    };
    let targetSplice = [];
    for(i in pack){
        console.log("item i",pack[i]);
        if(pack[i].name===itemName){
            targetSplice.push(i);
            stack.kg+=pack[i].kg;
            stack.quantity++;
            stack.pack.push(pack[i]);
        }
    }
    console.log("after stacking: ", stack);
    console.log("for splicing",targetSplice);
    socket.emit('stackpack',{stack,del:targetSplice});
}

function useItem(num){
    if(charBox[0].using.length>0){
        charBox[0].using.pop();
    }
    let item = charBox[0].backpack[num];
    console.log('grabbing this item: ',item);
    charBox[0].using.push(item);
    socket.emit('using',item);
    let msg = document.createElement('p');
    msg.innerText = `You begin using the ${item.name} as a tool.`;
    msgs.appendChild(msg);
    charDisplay(false);
}
let CONVO = 0;
function converse(NPC,flow){
    action.innerHTML =" ";
    console.log('npc: ', NPC);
    const NPCname = document.createElement('p');
    NPCname.innerText = NPC.name;
    action.appendChild(NPCname);
    let message = document.createElement('p');
    message.innerText = NPC.conversations[flow].message;
    action.appendChild(message);
    for ( i in NPC.conversations[flow].choice){
        let btn = document.createElement('button');
        btn.innerText = NPC.conversations[flow].choice[i];
        let trigger = NPC.conversations[flow].answerI[i];
        let NPCcopy = NPC;
        btn.onclick = function () {
            converse(NPCcopy,trigger);
        }
        action.appendChild(btn);
    }
}
function storage(){
    action.innerHTML = "Contents of your Storage Chest: <br>";
    charDisplay(true);
    for(i in charBox[0].chest){
        let thing = document.createElement('p');
        thing.innerHTML = charBox[0].chest[i].name + `<a href="javascript:takeChest(${i});"> take </a>`
        action.appendChild(thing);
    }
}
function takeChest(num){
    let item = charBox[0].chest[num];
    charBox[0].chest.splice(num,1);
    socket.emit('chest to inv',{data:num});
    console.log("trying get this item: ",item);
    storage();
}
function putChest(num){
    let item = charBox[0].backpack[num];
    if(charBox[0].using.length>0&&item.name===charBox[0].using[0].name){
        charBox[0].using.pop();
    }
    charBox[0].backpack.splice(num,1);
    socket.emit('inv to chest',{data:num});
    storage();
}
socket.on('msg', data => {
    let msg = document.createElement('p');
    msg.innerHTML = data.msg;
    msgs.appendChild(msg);
});
socket.on('player update', data =>{
    console.log('player update object data:',data);
    charBox.pop();
    charBox.push(data.player);
    charDisplay(data.atChest);
});

let localID = 0;
socket.on('handshake', (player,id) =>{
    localID = id;
    charBox.pop();
    let name = prompt("What is your name?");
    socket.emit('name', {name:name});
    player.name = name;
    charBox.push(player);
    console.log("in the box: ",charBox[0]);
    charDisplay(false);
});
socket.on('Tick', data =>{
    draw();
    var player = charBox[0];
    charBox.pop();
    player.xpos = data[0].xpos;
    player.ypos = data[0].ypos;
    // console.log('tick data',data);
    var map = Data.maps[0];
    var space=map[player.ypos][player.xpos];
    console.log(space, player.xpos, player.ypos);
    ctx.fillStyle="white";
    ctx.fillText("C",(player.xpos)*18,(player.ypos+1)*18);
    charBox.pop();
    charBox.push(player);
});
socket.on('npc', data =>{
    console.log("triggered a conversation",data);
    converse(data.npc[0],0);
});
socket.on('chest', data => {
    console.log("Opening storage chest",data);
    charBox[0].chest = data.box;
    storage();
});
document.onkeydown = function(event){
    var player = charBox[0];
    var map = Data.maps[0];
    charDisplay(false);
    if(event.keyCode === 68){  //d
        space = map[player.ypos][player.xpos+1];
        socket.emit('move',{inputDir:'right',block:space});
    }
    else if(event.keyCode === 83){ //s
        space = map[player.ypos+1][player.xpos];
        socket.emit('move', {inputDir:'down',block:space});
    }
    else if(event.keyCode === 65){  //a
        space = map[player.ypos][player.xpos-1];
        socket.emit('move', {inputDir:'left',block:space});
    }
    else if(event.keyCode === 87){ //w
        space = map[player.ypos-1][player.xpos];
        socket.emit('move', {inputDir:'up',block:space});
    }
}
var Data = {};
    Data.maps = [];
const mapArr = [
    ['#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#'],
    ['#','S',',','#','=','#','-','#',',','.','.',',','#','#','c','#','#','.','#'],
    ['#','.',',','.','.','*','.','.',',','.','.',',','#',';',';',';',';',';','#','#'],
    ['#','.','.','.','.','.','.','.','.','.','.','.','#','.',';','.','.',',','/','#'],
    ['#','.','.','P','.','.','.','.','.','#','+','#','#','.','.','.','.',',','/','#','#'],
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

