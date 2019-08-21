let {Schema, model} = require("mongoose");

let AccompagnementSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    etat:{type:Number, required: true}, //Pour Dire si c'est une boisson ou Accomp 1 ou Accomp 2
    register_date: { type: Date, default: Date.now },
});
exports.Accompagnement = model('accompagnement', AccompagnementSchema);


let PlatSchema = new Schema({
    tit:{
        type: String,
        required: true,
    },
    url:{
        type:String,
        required: true,
        unique: true,
    },
    price:{ type: String, required:true},
    etat:{type:Number, required:true},
    affiche:{
        type:Number,
        required:true,
        default:1,
    },
    accompagement:[{accomp:AccompagnementSchema}],
    register_date: { type: Date, default: Date.now },
});
exports.Plat = model('plat', PlatSchema);

let ClientSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    firstname:{
        type:String,
        required: true,
    },
    schoolValue:{
        type:String,
        required: true,
    },
    address:{
        type:String,
        required: true,
    },
    numero:{ type: String, required:true},
    password:{type:String,required:true},
    register_date: { type: Date, default: Date.now },
    login_date: { type: Date, default: null }
});
exports.Client = model('client', ClientSchema);


let SchoolSchema = new Schema({
    label: { type: String, required:true},
    value:{type: Number, required:true},
    register_date: { type: Date, default: Date.now },
});
exports.School = model('school', SchoolSchema);

let AdminSchema = new Schema({
    pseudo:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    numero:{ type: Number, required:false},
    password: { type: String, required:true},
    register_date: { type: Date, default: Date.now },
    login_date: { type: Date, default: null },
});
exports.Admin = model('user', AdminSchema);


let CommandeSchema = new Schema({
    CliendId:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    platId:{
        type:String,
        required:true
    },
    code:{
        type:String,
        required:true
    },
    etat:{
      type:Number,
      required: true
    },
    contain:Array,
    register_date: { type: Date, default: Date.now },
});
exports.Commande = model('commande', CommandeSchema);
