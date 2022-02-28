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
let NPCBox = [];


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
            if(data.block==="."||data.block===","||data.block==="+"){
                PLAYER_LIST[socket.id].xpos+=1;
            } else {
                var target = {
                    x:PLAYER_LIST[socket.id].xpos+1,
                    y:PLAYER_LIST[socket.id].ypos,
                    b:data.block,
                    id:socket.id
                }
                collision(target);
            }
        }
        if(data.inputDir==="left"){
            if(data.block==="."||data.block===","||data.block==="+"){
                PLAYER_LIST[socket.id].xpos-=1;
            } else {
                var target = {
                    x:PLAYER_LIST[socket.id].xpos-1,
                    y:PLAYER_LIST[socket.id].ypos,
                    b:data.block,
                    id:socket.id
                }
                collision(target);
            }
        }
        if(data.inputDir==="up"){
            if(data.block==="."||data.block===","||data.block==="+"){
                PLAYER_LIST[socket.id].ypos-=1;
            } else {
                var target = {
                    x:PLAYER_LIST[socket.id].xpos,
                    y:PLAYER_LIST[socket.id].ypos-1,
                    b:data.block,
                    id:socket.id
                }
                collision(target);
            }
        }
        if(data.inputDir==="down"){
            if(data.block==="."||data.block===","||data.block==="+"){
                PLAYER_LIST[socket.id].ypos+=1;
            } else {
                var target = {
                    x:PLAYER_LIST[socket.id].xpos,
                    y:PLAYER_LIST[socket.id].ypos+1,
                    b:data.block,
                    id:socket.id
                }
                collision(target);
            }
        }
    });
    socket.on('disconnect', function(){
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    })
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
//Interaction functions
function collision(target){
    pack=[];
    if(target.b==='#'){
        socket = SOCKET_LIST[target.id];
        socket.emit('msg',{msg:"You try to run through a wall and get a physics lesson."});
    }
    if(target.b==="P"){
        console.log("NPC collision",target);
    }
}

//data structures
function Player(id){
    this.id = id;
    this.name = "new character";
    this.using =[];
    this.xpos = 1;
    this.ypos = 1;
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
const NPC0 = {
    name: "Balaster",
    x:4,
    y:4,
    conversations: [
        {message:"Ahh, welcome newcomer to DraqRogue!",choice:["Where am I?","What should I do?"],answerI:[1,2],end:false},
        {message:"These are the starting barracks... people begin here to feed the machine.",choice:["...the machine?"],answerI:[3],end:false},
        {message:"In this room is a furnace and an anvil. If you had the materials, you could smelt and forge things.",choice:["Where do I get materials?","Is there anything else to do?"],answer:[4,5],end:false},
        {message:"Draq wages constant war on other realms, so he needs to train people to work and fight to grind them down!",choice:["Who's the wizard in green?","What should I do?"],answerI:[6,2],end:false},
        {message:"Go out the door to the work yard and train on menial tasks so you become a good cog.",end:true},
        {message:"Aside from gathering and crafting, we do need good soldiers... you could train at combat. Also head out the door for that",end:true},
        {message:"Oh, that's wizard Gillar. He can teach you about the inventory storage system.",end:true}
    ],
    questBool:false
}
const NPC1 = {
    name: "Gillar",
    x:8,
    y:8,
    conversations:[
        {message:"Confound it! I can never understand how this singularity point allows you to take and leave things at will with such capacity!",end:true}
    ],
    questBool:true
}
NPCBox.push(NPC0);
NPCBox.push(NPC1);

//With all the files loaded, the below statement causes the server to boot up and listen for client connections.


server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');
