var mongoose = require('mongoose');
var crypto = require('crypto');
// conf = require('../setting/config');
var config = require('../config');
var { Admin } = require('./AdminSchM');

//Connextion avec mongo
exports.Database = async function connect() {
    try {
        await mongoose.connect(config.db.host, {
            useNewUrlParser: true,
            useFindAndModify: config.db.useFindAndModify
        });
        await Admin.deleteMany({email:"admin@jillcantine.com"}).then((res)=>{
            console.log("Supprimé")
        }).catch((err)=>{
            console.log("err Supprimé" + err)
        });
        await Admin.find();
        let passwordD = crypto.createHmac('sha256', "azerty").update('I love cupcakes').digest('hex');
        let defaut = new Admin({pseudo:"ADMIN", email: "admin@jillcantine.com", password:passwordD, numero: 48803377});
        await defaut.save().then((ress)=>{
            console.log("Default oui " + ress)
        }).catch((err)=>{
            console.log("Default non " + err)
        });
        console.log(">>>> Database Connected");
    }
    catch (e) {
        console.log("err pour connect " +e.toString())
    }
}
