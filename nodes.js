const NPCBox = [];
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
    name:"Copper Mine",
    req:3,
    baseDiff:.25,
    lowest:.2,
    highest:.8,
    xp:5,
    onSuccess: function(){
        let purity = Math.random()*(this.highest-this.lowest)+this.lowest;
        let ore = new Ore("copper ore",purity,1,.5);
        return ore;
    }
}
const tinMine = {
    name:"Tine Mine",
    req:1,
    baseDiff:.3,
    lowest:.2,
    highest:.8,
    xp:4,
    onSuccess: function(){
        let purity = Math.random()*(this.highest-this.lowest)+this.lowest;
        let ore = new Ore("tin ore",purity,1,.5);
        return ore;
    }
}
const firTree = {
    name:"Fir Tree",
    req:1,
    count:3,
    trunk:3,
    baseDiff:.7,
    xp:3,
    onSuccess: function(){
        let log = new Log("fir log",1,1);
        return log;
    }
}
const oakTree = {
    name:"Oak Tree",
    req:1,
    count:5,
    trunk:5,
    baseDiff:.6,
    xp:7,
    onSuccess: function(){
        let log = new Log("oak log",1,1);
        return log;
    }
}
module.exports = { NPCBox, copperMine, tinMine, firTree, oakTree};