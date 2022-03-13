

const recipeBook = [" ", 
[//level 1 crafts:        Rpick = new Tool("Rusty Pickaxe","mine",1,1,3.5);
    { name:"Fishing Pole",
    xp:8,
    ingredients:["fir log"],
    makeObj: function(){
        let pole = new Tool("Fishing Pole","fish",1,1,1);
        return pole;
    },
}, { name:"Wooden Club",
    xp:8,
    ingredients:["fir log"],
    makeObj: function(){
        let club = new Weapon("Club","str",1,[1,4],1);
        return club;
    }
},{ name:"Copper Dagger",
    xp:12,
    ingredients:["fir log","copper bar"],
    makeObj: function(){
        let dagger = new Weapon("copper dagger","agi",2,[1,6],1);
        return dagger;
    }
}]
];
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
function Weapon(name,skill,req,dam,kg){
    this.type="weapon";
    this.name=name;
    this.skill=skill;
    this.req=req;
    this.dam=dam;
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
function Log(name,req,kg){
    this.type="log";
    this.name=name;
    this.req=req;
    this.kg=kg;
    this.stackable=true;
    this.id=Math.random();
}
function Bar(name,type){
    this.name=name;
    this.type=type;
    this.kg=1;
    this.stackable=true;
    this.id=Math.random();
}
module.exports = { recipeBook, Tool, Weapon, Ore, Log, Bar };


