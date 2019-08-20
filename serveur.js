const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
let { isErr } = require('./src/utilities');
const twig = require('twig');
let bodyParser = require('body-parser');
const morgan = require('morgan')('dev');
const crypto = require('crypto');
const config = require('./config');
let multer = require('multer');
const session = require('express-session');
const expressValidator = require('express-validator');
const cookieParser = require('cookie-parser');



const storageFixe = multer.diskStorage({
    destination: './views/images/Fixe/',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' +file.originalname);
    }
});

let uploadFixe = multer({
    storage: storageFixe,
}).single('fixeInput');

let { Database } = require('./Model/Database');
let {Administration} = require('./Model/AdminQueri');
Database();
const app = express();
const https = require('http').createServer(app);
let io = require('socket.io')(https);
const api = express.Router();
const apiMobile = express.Router();
app.use(session({
    secret: config.session.secret,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
}));
app.use(cookieParser());
//app.use(cors())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(express.static(`${__dirname}/views`));


app.use(morgan);


/*
For Web
 */
api.get('/', async (req, res)=>{
    if(req.session.Pharma){
        /*jwt.verify(token, config.session.secret, async function(err, decoded) {
            if (err) {res.send({stat:false, user: null});}
            else{*/
        let info = {};
        const NumberFixe = await Administration.getNumberPlatFixe(1);
        const NumberSemaine = await Administration.getNumberPlatFixe(2);
        const NumberBierre = await Administration.getNumberAccompagnement(3);
        const NumberAccomp = await Administration.getNumberAccompagnement(1);
        const NumberCont = await Administration.getNumberAccompagnement(2);
        const NumberClient = await Administration.getNumberClient();
        const NumberAdmin = await Administration.getNumberAdmin();
        const NumberCommande = await Administration.getNumberCommande();
        const CommandeInWait = await Administration.getCommandInWait();
        const CommandeSend = await Administration.getCommandInSend();
        for(let i in CommandeInWait){
            CommandeInWait[i].plat = await Administration.getPlatWithId(CommandeInWait[i].platId);
            for(let j in CommandeInWait[i].contain){
                const Focus = await Administration.getAccompagnementWithId(CommandeInWait[i].contain[j]);
                console.log("celui de focus", Focus);
                CommandeInWait[i].vraiEle.push(Focus)
            }
            CommandeInWait[i].client = await Administration.getEcoleOfCommande(CommandeInWait[i].CliendId)
        }
        for(let j in CommandeSend){
            CommandeSend[j].ecole = await Administration.getEcoleOfCommande(CommandeSend[j].CliendId)
        }
        info.NumberFixe = NumberFixe;
        info.NumberSemaine = NumberSemaine;
        info.NumberClient = NumberClient;
        info.NumberCommande = NumberCommande;
        info.CommandeSend = CommandeSend.reverse();
        info.CommandeInWait = CommandeInWait.reverse();
        info.NumberBierre = NumberBierre;
        info.NumberAccomp = NumberAccomp;
        info.NumberCont = NumberCont;
        info.NumberAdmin = NumberAdmin;
        res.render('index.twig',{stat:true, user: req.session.Pharma, info:info})
    }
    else{
        res.redirect('/login')
    }
});
api.get('/cantine', async (req, res)=>{
    if(req.session.Pharma){
        let info = {};
        const PlatFixe = await Administration.getAllPlatByType(1);
        const PlatSemaine = await Administration.getAllPlatByType(2);
        const Accompa = await Administration.getAllAccompagnementByType(1);
        const Accompagnement = await Administration.getAllAccompagnementByType(2);
        const Boisson = await Administration.getAllAccompagnementByType(3);
        const school = await Administration.getSchools();
        info.PlatFixe = PlatFixe;
        info.PlatSemaine = PlatSemaine;
        info.Accompagnement = Accompagnement;
        info.Accompa = Accompa;
        info.Boisson = Boisson;
        info.school = school;
        res.render('tabs.twig',{user: req.session.Pharma, info:info})
    }
    else{
        res.redirect('/login')
    }
});
api.post('/fixe', uploadFixe, async (req, res)=>{
    if(req.session.Pharma) {
        const name = req.body.name;
        const price = req.body.price + 'F cfa';
        const file = req.file.filename;
        console.log(name + ' ' + price + "\n" + file);
        let produit = await Administration.setPlat(name, price, file, 1, 2);
        res.redirect('/cantine')
    }

})
api.post('/accomp', async (req, res)=>{
    if(req.session.Pharma){
        const name = req.body.accomp;
        let produit = await Administration.setAccompagnement(name,1);
        res.redirect('/cantine')
    }
})
api.post('/accompnement', async (req, res)=>{
    if(req.session.Pharma) {
        const name = req.body.accomp;
        let produit = await Administration.setAccompagnement(name,2);
        res.redirect('/cantine')
    }
})
api.post('/boisson', async (req, res)=>{
    if(req.session.Pharma) {
        const name = req.body.accomp;
        let produit = await Administration.setAccompagnement(name,  3);
        res.redirect('/cantine')
    }
})
api.post('/semaine', uploadFixe, async (req, res)=>{
    const name = req.body.name;
    const price = req.body.price + 'F cfa';
    const file = req.file.filename;
    let produit = await Administration.setPlat(name,price,file,2,1);
    res.redirect('/cantine')

    /*if(!isErr(users)){
        res.send({stat: true, user: req.session.csucom, info: users});
    } else{
        res.send({stat: false, user: null});
    }*/

})
api.get('/login', async (req,res) =>{
    if(req.session.Pharma){
        res.redirect('/')
    }else{
        let error = (req.session.Error !== undefined) ? req.session.Error : "";
        res.render('login.twig', {})
    }
});
api.post('/login', async (req, res) =>{
    req.check('user', "Email Invalide").isEmail();
    req.check('pass', "On ne Valide Pas ce Genre de Mot de passe").isAlphanumeric(); //.matches(/^(?=.*[^a-zA-Z0-9])$/);

    const error = req.validationErrors();
    console.log("Validator" + error)
    if(error){
        req.session.Error = error;
        res.redirect('/login')
    }
    else{
        let user = req.body.user;
        let pass = req.body.pass;
        let password = crypto.createHmac('sha256', pass).update('I love cupcakes').digest('hex');
        let personC = await Administration.verifyAdmin(user,password);
        if (!isErr(personC)){
            req.session.Pharma = personC;
            /*const  expiresIn  =  24  *  60  *  60;
            const  accessToken  =  jwt.sign({ user:  personC }, config.session.secret, {
                expiresIn:  expiresIn*/
            res.redirect('/');
        }
        else{
            req.session.Error = 'Identification Echoué. Veuillez verifier vos cordonnées';
            res.redirect('/login');
        }
    }
});
api.get('/logout', async (req, res) => {
    req.session.destroy((err) => {
        console.log(`DESTRUCTION D'UNE SESSION`)
    })
    res.redirect('/login')
});


/*
FIn Web
 */





/*
For Mobile
 */

apiMobile.post('/signin', async (req, res) =>{
    req.check('name', "nom Invalide").notEmpty();
    req.check('firstname', "prenom Invalide").notEmpty();
    req.check('numero', "numero Invalide").notEmpty();
    req.check('schoolValue', "etablissement Invalide").notEmpty();
    req.check('commune', "commune Invalide").notEmpty();
    req.check('pass', "On ne Valide Pas ce Genre de Mot de passe").isAlphanumeric(); //.matches(/^(?=.*[^a-zA-Z0-9])$/);

    const error = req.validationErrors();
    if(error){
        req.session.Error = error;
        res.send({statue:false, error:error});
    }
    else{
        let name = req.body.name;
        let firstname = req.body.firstname;
        let numero = req.body.numero;
        let commune = req.body.commune;
        let schoolValue = req.body.schoolValue;
        let pass = req.body.pass;
        let password = crypto.createHmac('sha256', pass).update('I love cupcakes').digest('hex');
        let personC = await Administration.setClient(name,firstname,password,numero,schoolValue, commune);
        if (!isErr(personC)){
            req.session.Pharma = personC;
            /*const  expiresIn  =  24  *  60  *  60;
            const  accessToken  =  jwt.sign({ user:  personC }, config.session.secret, {
                expiresIn:  expiresIn*/
            res.send({statue:true, info:req.session.Pharma});
        }
        else{
            req.session.Error = 'Identification Echoué. Veuillez verifier vos cordonnées';
            res.send({statue:false, error:req.session.Error});
        }
    }
})
apiMobile.post('/commande/:id', async (req, res) =>{
    const user = await Administration.getClientWithId(req.params.id);
    if(user){
        req.check('platId', "plat Invalide").notEmpty();
        req.check('price', "prix Invalide").notEmpty();
        req.check('contain', "accompagnement Invalide").notEmpty();

        const error = req.validationErrors();
        if(error){
            req.session.Error = error;
            console.log("plein de Err",error)
            res.send({statue:false, error:error});
        }
        else{

            let id = req.params.id;
            let price = req.body.price;
            let platId = req.body.platId;
            let contain = req.body.contain;
            const rend = req.body.rend;
            let personC = await Administration.setCommande(id,price,platId,contain,rend);
            if (!isErr(personC)){
                res.send({statue:true, info:personC});
            }
            else{
                req.session.Error = 'Erreur de creation';
                res.send({statue:false, error:req.session.Error});
            }
        }
    }else{
        res.send({statue:false, error:"Auth is False"})
    }
})
apiMobile.post('/editor', async (req, res) =>{
    if(req.session.Pharma){
        req.check('name', "Nom Invalide").notEmpty();
        req.check('firstname', "Prénom Invalide").notEmpty();
        req.check('numero', "Numero Invalide").notEmpty();
        req.check('password', "Mot de passe Invalide").notEmpty();

        const error = req.validationErrors();
        if(error){
            req.session.Error = error;
            res.send({statue:false, error:error});
        }
        else{
            let password = crypto.createHmac('sha256', req.body.password).update('I love cupcakes').digest('hex');
            let personC = await Administration.updateClient(req.body.id,password,req.body.name,req.body.firstname,req.body.numero)
            if (!isErr(personC)){
                console.log("la persone", personC)
                res.send({statue:true, info:personC});
            }
            else{
                req.session.Error = 'Erreur de creation';
                res.send({statue:false, error:req.session.Error});
            }
        }
    }else{
        res.send({statue:false, error:"Auth is False"})
    }
})
apiMobile.post('/login', async (req, res) =>{
    req.check('user', "Email Invalide").notEmpty();
    req.check('pass', "On ne Valide Pas ce Genre de Mot de passe").isAlphanumeric(); //.matches(/^(?=.*[^a-zA-Z0-9])$/);

    const error = req.validationErrors();
    if(error){
        req.session.Error = error;
        res.send({stat:false, error:error})
    }
    else{
        let user = req.body.user;
        let pass = req.body.pass;
        let password = crypto.createHmac('sha256', pass).update('I love cupcakes').digest('hex');
        let personC = await Administration.verifyClient(user,password);
        if (!isErr(personC)){
            req.session.Pharma = personC;
            /*const  expiresIn  =  24  *  60  *  60;
            const  accessToken  =  jwt.sign({ user:  personC }, config.session.secret, {
                expiresIn:  expiresIn*/
            res.send({statue:true, info:req.session.Pharma});
        }
        else{
            req.session.Error = 'Identification Echoué. Veuillez verifier vos cordonnées';
            res.send({statue:false, error:req.session.Error});
        }
    }
});
apiMobile.get('/School',async (req,res)=>{
    const school = await Administration.getSchools();
    res.send({statue:true, school:school});
});
apiMobile.get('/me/:id',async (req,res)=>{
    const user = await Administration.getClientWithId(req.params.id);
    if(user){
        console.log("ici");
        const commande = await Administration.getCommandWithId(req.params.id);
        res.send({statue:true, info:{commande:commande}})
    }
    else {
        console.log("là");

        res.send({statue:false, info:{commande:[]}})
    }
   // res.send({statue:true, school:school});
});

apiMobile.get('/all/:id', async (req, res)=>{
    const user = await Administration.getClientWithId(req.params.id);
    if(user){
        let info = {};
        let fixe = await Administration.getAllPlatByTypeWithAffiche(1,2);
        let semaine = await Administration.getAllPlatByTypeWithAffiche(2,2);
        const Boisson = await Administration.getAllAccompagnementByType(3);
        info.fixe = fixe;
        info.semaine = semaine;
        info.Boisson = Boisson;
        res.send({statue:true, info:info})
    }
    else{
        res.send({statue:false, error:"Auth Fail"})
    }
})

apiMobile.get('/editInfo/:id', async (req, res)=>{
    const user = await Administration.getClientWithId(req.params.id);
    if(user){
        res.send({statue:true, info:user})
    }
    else{
        res.send({statue:false, error:"Auth Fail"})
    }
})



/*
End Mobile
 */
app.use('/', api);
app.use('/api/v1/ryu', apiMobile);

io.on('connection', (socket)=> {
    socket.on('LocalFinal', async data=>{
        const valid = await Administration.getCommandOnUpdateWithId(data);
    })
    socket.on("delAccomp", async (data)=>{
      let del = await Administration.delAccomp(data);
    })
    socket.on("delPlat", async (data)=>{
        let del = await Administration.delAPlat(data);
    })
    socket.on('semaineAjouComp', async (data)=>{

        for(let i in data.Accompagnement){
            const update = await Administration.updatePlatAccomp(data.plat, data.Accompagnement[i]);
        }
        for(let j in data.Suplement){
            const update = await Administration.updatePlatAccomp(data.plat, data.Suplement[j]);
        }
    })

    socket.on('fixeAjouComp', async (data)=>{
        for(let i in data.Accompagnement){
            const update = await Administration.updatePlatAccomp(data.plat, data.Accompagnement[i]);
        }
    });
    socket.on("viewInWait", async data=>{
        let block = [];

        data.contain = data.contain.split(",");

        let plat = await Administration.getPlatWithId(data.platId);
        let client = await Administration.getClientWithId(data.CliendId);
        for(let i in data.contain){
            const Focus = await Administration.getAccompagnementWithId(data.contain[i]);
            block.push(Focus)
        }
        socket.emit("RetourWait", {plat:plat, client:client, block:block})
    });
    socket.on("changePass", async (data)=>{
        let password = crypto.createHmac('sha256', data.news).update('I love cupcakes').digest('hex');
        let pass = crypto.createHmac('sha256', data.old).update('I love cupcakes').digest('hex');
        const user = Administration.updatePass(data.ident, pass, password);
        if(!isErr(user)){
            const mes = "Mot de passe changé avec succès";
            socket.emit("changeRetour", {type:"success", mes:mes})
        }
        else{
            const mes = "L'ancien mot de passe n'est pas correct";
            socket.emit("changeRetour", {type:"danger", mes:mes})
        }
    })
    socket.on("newSchool", async (data)=>{
        const valu =  Math.floor(Math.random() * 50) + 1;
        const Ecole = await Administration.setSchool(data,valu);
    })
    socket.on('AddWeek', async data =>{
        const addWeek = await Administration.updateSemaine(data,2)
    })
    socket.on('RemoveWeek', async data =>{
        const addWeek = await Administration.updateSemaine(data,1)
    })

});
https.listen(config.port,()=>{
    console.log('ecoute sur ' + config.port)
});
