// Server file running socket.io and simple http express server for html game with multiplayer

//SERVER SETUPS -- all the required modules and initialization
require('dotenv').config();
const { Console } = require('console');
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

const nod = require('./nodes');
const obj = require('./objects');

let NPCBox = nod.NPCBox;
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
    });
    socket.on('stackpack', data=> {
        console.log('stacked pack from above: ',data);
        let player = PLAYER_LIST[socket.id];
        for(var i = data.del.length;i>0;i--){
            player.backpack.splice(data.del[i-1],1);
        }
        player.backpack.push(data.stack);
        // console.log(player.backpack);
        socket.emit('player update',{player,atChest:false});
    });
    socket.on('unstack', data =>{
        console.log('unstacking: ',data.stack)
        PLAYER_LIST[socket.id].backpack.splice(data.num,1);
        for(i in data.stack.pack){
            PLAYER_LIST[socket.id].backpack.push(data.stack.pack[i]);
        }
        let player = PLAYER_LIST[socket.id];
        socket.emit('player update',{player,atChest:false});
    });
    socket.on('craft', data => {
        let list = recipeBook[data.level][data.index].ingredients;
        let pack = PLAYER_LIST[socket.id].backpack;
        let haveAll = true;
        for(i in list){
            let hasArr=[];
            for(t in pack){
                console.log("list item: ",list[i]," packchecking: ",pack[t]);
                if(pack[t].name===list[i]){
                    console.log("has ", pack[t]);
                    hasArr.push(pack[t]);
                    pack.splice(t,1);
                    list.splice(i,1);
                }
                console.log("pack",pack);
                console.log("list",list);
            }
            console.log(hasArr);
        }
        if(list.length>0){
            console.log('fail ');
            socket.emit('msg',{msg:"You do not have the correct ingredients to make that item."});
        } else {
            PLAYER_LIST[socket.id].backpack = pack;
            let item = obj.recipeBook[data.level][data.index].makeObj();
            console.log(item);
            PLAYER_LIST[socket.id].backpack.push(item);
            PLAYER_LIST[socket.id].weightCheck();
            PLAYER_LIST[socket.id].craftXp += recipeBook[data.level][data.index].xp;
            let player = PLAYER_LIST[socket.id];
            let msg = `You successfully crafted a ${item.name}.`;
            socket.emit('msg',{msg:msg});
            socket.emit('player update',{player,atChest:false});
        }
    });
    socket.on('move',data =>{
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
        let socket = SOCKET_LIST[player.id];
        if(player.doFlag==="mining"&&player.mine>=player.data.req){
            var attempt = "You swing your pickaxe at the rock.  ";
            var rng = Math.random();
            console.log("trying to hit ore with rng:" + rng + "with a baseDiff of " + (player.data.baseDiff+player.mine/100));
            if(rng<(player.data.baseDiff+(player.mine/100)+player.using[0].bonus/100)){
                attempt += "You score a good enough hit to wrench free a chunk of ore!";
                let chunk = player.data.onSuccess();
                player.mineXp += player.data.xp;
                if(player.mineXp>=player.mineTnl){
                    player.mine++;
                    player.mineTnl = 40*player.mine*1.1;
                }
                player.AddPack(chunk);
                if(player.kg===player.maxKg){
                    attempt = "You can't hold any more materials.";
                }
            } else {
                attempt += "Nothing yet...";
            }
            socket.emit('msg',{msg:attempt});
            socket.emit('player update',{player,atChest:false});
        } else if(player.doFlag==="mining"&&player.mine<player.data.req){
                    var attempt = "You don't have high enough skill to mine this material. Come back when you reach " + player.data.req;
                    player.doFlag="nothing";
                    // player.data.pop();
                    socket.emit('msg',{msg:attempt});
                    socket.emit('player update',{player,atChest:false});

        } else if(player.doFlag==="chopping"&&player.chop>=player.data.req){
            let rng = Math.random();
            if(rng<(player.data.baseDiff+(player.chop/100)+player.using[0].bonus/100)){
                var attempt = "You swing your axe and chop the tree.";
                player.data.trunk--;
                player.chopXp += player.data.xp;
                if(player.chopXp>player.chopTnl){
                    player.chop++;
                    player.chopTnl = 40*player.chop*1.1;
                }
                if(player.data.trunk===0){
                    let log = player.data.onSuccess();
                    player.AddPack(log);
                    attempt+="You fell the tree and get a log!";
                    player.data.trunk=player.data.count;
                }
            } else {
                var attempt = "Your wild and weak swing failed to make much of a dent in the trunk...";
            }
            socket.emit('msg',{msg:attempt});
            socket.emit('player update',{player,atChest:false});

        }    else if(player.doFlag==="chopping"&&player.chop<player.data.req){
                var attempt = "This tree is beyond your skill... go level up chopping to " + player.data.req;
                player.doFlag="nothing";
                player.data.pop();
                socket.emit('msg',{msg:attempt});
                socket.emit('player update',{player,atChest:false});

            }
            PLAYER_LIST[socket.id] = player;
        }
    

},3000);
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
    if(target.b==="c"||target.b==="t"){
        let node = {};
        if(target.b==="c"){
            node = nod.copperMine;
        }
        if(target.b==="t"){
            node = nod.tinMine;
        }
        if(PLAYER_LIST[target.id].using.length>0){
            if(PLAYER_LIST[target.id].using[0].skill==="mine"){
                PLAYER_LIST[target.id].doFlag="mining";
                if(target.b==="c"){
                    PLAYER_LIST[target.id].data=node;
                }
                if(target.b==="t"){
                    PLAYER_LIST[target.id].data=node;
                }
                socket.emit('msg',{msg:"You begin to swing your pickaxe at the ore deposit..."});
            } else {
                socket.emit('msg',{msg:"Your tool isn't meant for mining."});
            }
        } else {
            socket.emit('msg',{msg:"You need to equip a tool first!"});
        }
    socket.emit('node display',{node});
    }
    if(target.b==="T"||target.b==="O"){
        let node = {};
        if(target.b==="T"){
            node = nod.firTree;
        }
        if(target.b==="o"){
            node = nod.oakTree;
        }
        if(PLAYER_LIST[target.id].using.length>0){
            if(PLAYER_LIST[target.id].using[0].skill==="chop"){
                if(PLAYER_LIST[target.id].using[0].skill==="chop"){
                    PLAYER_LIST[target.id].doFlag="chopping";
                    if(target.b="T"){
                        PLAYER_LIST[target.id].data=node;
                    }
                    if(target.b==="O"){
                        PLAYER_LIST[target.id].data=node;
                    }
                }
            }else{
                socket.emit('msg',{msg:"You're using the wrong type of tool..."});
            }
            }else{
                socket.emit('msg',{msg:"You would need an axe to chop this tree..."})
            }
        socket.emit('node display',{node});
    }
    if(target.b==="f" || target.b==="F"){
        
    }
    if(target.b==="1"){
        socket.emit('poi',{msg:"Here is the forge '=' where you can smelt ores into bars for smithing at the anvil represented by'-'"});
    }
    if(target.b==="2"){
        socket.emit('poi',{msg:"Here at the fire, shown as red '&', you can cook the raw foods you have. At the crafting table, shown as a brown '!', you can make items from various materials or check the recipe list of possible crafts."});
    }
    if(target.b==="3"){
        socket.emit('poi',{msg:"Trees are a good source of wood for chopping. You need to use your axe at the 'T'.  It takes several good swings to fell a tree and get a log."});
    }
    if(target.b==="4"){
        socket.emit('poi',{msg:"You can mine ores at deposits shown as '^' on the map.  You'll need to use a pickaxe."});
    }
    if(target.b==="5"){
        socket.emit('poi',{msg:"Fishing is a good source of food.  You will need a fishing pole, which can be made from a fir log at the crafting table.  The pond has easier fish to catch than up the steam."});
    }
    if(target.b==="!"){
        socket.emit('crafting',{recipeBook});
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
    this.expTnl = 40*this.level*1.2;
    this.str = 1;
    this.def = 1;
    this.agi = 1;
    this.mine = 1;  this.mineXp = 0; this.mineTnl=40*this.mine*1.1;
    this.chop = 1;  this.chopXp = 0; this.chopTnl=40*this.chop*1.1;
    this.cook = 1;  this.cookXp = 0; this.cookTnl=40*this.cook*1.1;
    this.fish = 1;  this.fishXp = 0; this.fishTnl=40*this.fish*1.1;
    this.forge = 1;  this.forgeXp = 0; this.forgeTnl=40*this.forge*1.1;
    this.craft = 1;  this.craftXp = 0; this.craftTnl=40*this.craft*1.1;
    this.backpack = [];
    this.doFlag = "nothing";
    this.data = [];
    this.kg = 0;
    this.chest = [];
    this.maxKg = 10+this.str*5;
    this.init = function(){
        Rpick = new obj.Tool("Rusty Pickaxe","mine",1,1,3.5);
        Raxe = new obj.Tool("Rusty Axe","chop",1,1,3.5);
        this.AddPack(Rpick);
        this.AddPack(Raxe);
        for(let i = 0; i < 3; i++){
            chunkC = new obj.Ore("copper ore",.5,1,.5);
            chunkT = new obj.Ore("tin ore",.5,1,.5);
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
    this.weightCheck = function(){
        this.kg = 0;
        for(i in this.backpack){
            this.kg += this.backpack[i];
        }
    }
}




//With all the files loaded, the below statement causes the server to boot up and listen for client connect

server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');


