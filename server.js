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
    socket.on('chest to inv',data =>{
        let item = PLAYER_LIST[socket.id].chest[data.data];
        if(PLAYER_LIST[socket.id].AddPack(item)){
            PLAYER_LIST[socket.id].chest.splice(data.data,1);
        } else {
            let chest = PLAYER_LIST[socket.id].chest;
            socket.emit('chest',{box:chest});
        }
        let player = PLAYER_LIST[socket.id];
        socket.emit('player update',{player,atChest:true});
    });
    socket.on('inv to chest', data=> {
       let item = PLAYER_LIST[socket.id].backpack[data.data];
       let player = PLAYER_LIST[socket.id];
       if(player.using.length>0&&player.using[0].name===item.name){
           player.using.pop();
       }
       player.backpack.splice(data.data,1);
       player.kg -= item.kg;
       player.chest.push(item);
       socket.emit('player update',{player,atChest:true}); 
    });
    socket.on('using',data =>{
        console.log("using",data);
        if(PLAYER_LIST[socket.id].using.length>0){
            PLAYER_LIST[socket.id].using.pop();
        }
        PLAYER_LIST[socket.id].using.push(data);
    })
    socket.on('move',data =>{
        console.log(data);
        PLAYER_LIST[socket.id].doFlag="nothing";
        if(data.inputDir==="right"){
            if(data.block==="."||data.block===","||data.block==="+"||data.block===";"){
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
            if(data.block==="."||data.block===","||data.block==="+"||data.block===";"){
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
            if(data.block==="."||data.block===","||data.block==="+"||data.block===";"){
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
            if(data.block==="."||data.block===","||data.block==="+"||data.block===";"){
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
setInterval( function() {
    for(i in PLAYER_LIST){
        let player = PLAYER_LIST[i];
        console.log("is doing... ", player.doFlag);
        let socket = SOCKET_LIST[player.id];
        if(player.doFlag==="mining"){
            var attempt = "You swing your pickaxe at the rock.  ";
            var rng = Math.random();
            console.log("trying to hit ore with rng:" + rng + "with a baseDiff of " + (player.data.baseDiff+player.mine/100));
            if(rng<(player.data.baseDiff+(player.mine/100))){
                attempt += "You score a good enough hit to wrench free a chunk of ore!";
                let chunk = player.data.onSuccess();
                player.xp += player.data.xp;
                player.AddPack(chunk);
                if(player.kg===player.maxKg){
                    attempt = "You can't hold any more materials.";
                }
            } else {
                attempt += "Nothing yet...";
            }
            socket.emit('msg',{msg:attempt});
            socket.emit('player update',{player,atChest:false});
            PLAYER_LIST[socket.id] = player;
        }
    }

},3000)
//Interaction functions
function collision(target){
    pack=[];
    socket = SOCKET_LIST[target.id];
    if(target.b==='#'){
        socket.emit('msg',{msg:"You try to run through a wall and get a physics lesson."});
    }
    if(target.b==="P"){
        console.log("P @:",target.x,target.y);
        for(i in NPCBox){
            if(NPCBox[i].x===target.x&&NPCBox[i].y===target.y){
                pack.push(NPCBox[i]);
            }
        }
        socket.emit('msg',{msg:"You begin talking to an NPC."});
        socket.emit('npc',{npc:pack});
    }
    if(target.b==="%"){
        let chest = PLAYER_LIST[target.id].chest;
        socket.emit('msg',{msg:"You begin sorting the contents of your storage chest."});
        socket.emit('chest',{box:chest});
    }
    if(target.b==="c"){
        if(PLAYER_LIST[target.id].using.length>0){
            if(PLAYER_LIST[target.id].using[0].skill==="mine"){
                PLAYER_LIST[target.id].doFlag="mining";
                PLAYER_LIST[target.id].data=copperMine;
                console.log(PLAYER_LIST[socket.id].name + " began mining copper");
                socket.emit('msg',{msg:"You begin to swing your pickaxe at the copper deposit..."});
            } else {
                socket.emit('msg',{msg:"Your tool isn't meant for mining."});
            }
        } else {
            socket.emit('msg',{msg:"You need to equip a tool first!"});
        }

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
    this.exp = 0;
    this.exptnl = 40*this.level*1.2;
    this.str = 1;
    this.def = 1;
    this.agi = 1;
    this.mine = 1;  this.mineXp = 0; this.mineTnl=40*this.mine*1.1;
    this.chop = 1;  this.chopXp = 0; this.chopTnl=40*this.chop*1.1;
    this.cook = 1;  this.cookXp = 0; this.cookTnl=40*this.cook*1.1;
    this.fish = 1;  this.fishXp = 0; this.cookTnl=40*this.fish*1.1;
    this.forge = 1;  this.forgeXp = 0; this.forgeTnl=40*this.forge*1.1;
    this.craft = 1;  this.craftXp = 0; this.craftTnl=40*this.craft*1.1;
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
        for(let i = 0; i < 3; i++){
            chunkC = new Ore("copper ore",.5,1,.5);
            chunkT = new Ore("tin ore",.5,1,.5);
            this.chest.push(chunkC);
            this.chest.push(chunkT)
        }
    }
    this.AddPack = function(item){
        console.log(item);
        if(this.kg+item.kg>this.maxKg){
            return false;
        }
        this.kg += item.kg;
        this.backpack.push(item);
        return true;
        }
}
function Tool(name,skill,req,bonus,kg){
    this.type="tool";
    this.name=name;
    this.skill=skill;
    this.req=req;
    this.bonus=bonus;
    this.kg=kg;
    this.stackable=false;
    this.id=Math.random();
}
function Ore(name,purity,req,kg){
    this.type="ore";
    this.name=name;
    this.purity=purity;
    this.req=req;
    this.kg=kg;
    this.stackable=true;
    this.id=Math.random();
}
const NPC0 = {
    name: "Balaster",
    x:3,
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
    x:6,
    y:7,
    conversations:[
        {message:"Confound it! I can never understand how this singularity point allows you to take and leave things at will with such capacity!",end:true}
    ],
    questBool:true
}
NPCBox.push(NPC0);
NPCBox.push(NPC1);
const copperMine = {
    req:1,
    baseDiff:.25,
    lowest:.2,
    highest:.8,
    xp:5,
    onSuccess: function(){
        let purity = Math.random()*(this.highest-this.lowest)+this.lowest;
        let ore = new Ore("copper ore",purity,1,.5);
        console.log("made new ore item: ", ore);
        return ore;
    }
}
//With all the files loaded, the below statement causes the server to boot up and listen for client connections.


server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');
