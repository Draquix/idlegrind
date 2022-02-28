// Server file running socket.io and simple http express server for html game with multiplayer

//SERVER SETUPS -- all the required modules and initialization
require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const { runInThisContext } = require('vm');
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/static')));

//GLOBAL VARIABLES
let SOCKET_LIST = {};
let MAPS = {};
let PLAYER_LIST = {};


//socket.io handlers
io.on('connection', socket => {
    io.emit('msg', {msg:'new server connection established'});

    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    player = new Player(socket.id);
    player.init();
    PLAYER_LIST[player.id] = player;
    let tell = `Connected with id ${socket.id}`;
    socket.emit('msg',{msg:tell});
    console.log('Connection up with id',socket.id);
    socket.emit('handshake',player,socket.id);
    socket.on('name', name => {
        PLAYER_LIST[socket.id].name = name.name;
        console.log(PLAYER_LIST);
    });
    socket.on('move',data =>{
        console.log(data);
        if(data.inputDir==="right"){
            PLAYER_LIST[socket.id].xpos+=1;
            console.log(data.block);
        }
        if(data.inputDir==="left"){
            PLAYER_LIST[socket.id].xpos-=1;
        }
        if(data.inputDir==="up"){
            PLAYER_LIST[socket.id].ypos-=1;
        }
        if(data.inputDir==="down"){
            PLAYER_LIST[socket.id].ypos+=1;
        }
    });
});

//game loop
let ticker = 0;
setInterval( function () {
    ticker++;
    if(ticker % 20===0){
        console.log(`Running steady for ${ticker} game ticks.`);
    }
    let pack = [];
    for(i in PLAYER_LIST){
        pack.push({
            xpos:PLAYER_LIST[i].xpos,
            ypos:PLAYER_LIST[i].ypos,
            id:PLAYER_LIST[i].id       
         });
        let socket = SOCKET_LIST[i];
        socket.emit('Tick',pack);
    }

},200);


//data structures
function Player(id){
    this.id = id;
    this.name = "new character";
    this.using =[];
    this.xpos = 2;
    this.ypos = 2;
    this.hp = 10;
    this.mHp = 10;
    this.level = 1;
    this.xp = 0;
    this.str = 1;
    this.def = 1;
    this.agi = 1;
    this.mine = 1;
    this.chop = 1;
    this.cook = 1;
    this.fish = 1;
    this.forge = 1;
    this.craft = 1;
    this.backpack = [];
    this.doFlag = "nothing";
    this.data = [];
    this.kg = 0;
    this.chest = [];
    this.maxKg = 10+this.str*5;
    this.init = function(){
        Rpick = new Tool("Rusty Pickaxe","mine",1,1,3.5);
        Raxe = new Tool("Rusty Axe","chop",1,1,3.5);
        this.AddPack(Rpick);
        this.AddPack(Raxe);
    }
    this.AddPack = function(item){
        console.log(item);
        if(this.kg+item.kg>this.maxKg){
            return false;
        }
        this.kg += item.kg;
        this.backpack.push(item);
        return;
        }
}
function Tool(name,skill,req,bonus,kg){
    this.type="tool";
    this.name=name;
    this.skill=skill;
    this.req=req;
    this.bonus=bonus;
    this.kg=kg;
}
function Ore(name,purity,req,kg){
    this.name=name;
}



//With all the files loaded, the below statement causes the server to boot up and listen for client connections.


server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');
