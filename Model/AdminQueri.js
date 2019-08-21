var { Admin, Plat, Client, Commande, Accompagnement, School } = require('./AdminSchM');
var ObjectID = require('mongodb').ObjectID

exports.Administration = class {
    static verifyAdmin(email,password){
        const user = new Date();
        return new Promise(async (next)=>{
           Admin.findOneAndUpdate({email:email, password:password}, {$set:{ "login_date": user }}, {new: true})
               .then((res) => {
                console.log(res);
                next(res);
            }).catch((err)=>{
               console.log(err);
               next(err);
            });
        })
    }
    static updatePlatAccomp(platName,AccompName){
        return new Promise(async next=>{
            await Accompagnement.findOne({name:AccompName})
                .then(async res=>{
                    await Plat.findOne({tit:platName})
                        .then(async ress =>{
                            ress.accompagement.push({accomp:res});
                            await ress.save().then(resss=>{console.log("il a été ajouté à ce plat"); next(resss)}).catch(errrs=>{console.log("erreur pour l'ajout de l'acompagment au plat", errrs); next(errrs)})
                        }).catch(errr=>{console.log("erreur on a pas pu trouvé ce plat", errr); next(errr)})
                }).catch(err=>{console.log("erreur on a pas pu trouvé ce Accom", err); next(err)})
        })
    }
    static verifyClient(name,password){
        const user = new Date();
        return new Promise(async (next)=>{
            Client.findOneAndUpdate({numero:name, password:password}, {$set:{ "login_date": user }}, {new: true})
                .then((res) => {
                    console.log(res);
                    next(res);
                }).catch((err)=>{
                next(err);
            });
        })
    }
    static setAdmin(pseudo, email, password, numero){
        return new Promise(async (next)=>{
            const user = new Admin({pseudo:pseudo, email: email, password:password, numero: parseInt(numero,10)});
            await user.save().then((res)=>{
                console.log(res);
                next(res);
            }).catch((err)=>{console.log(err); next(err)})
        })
    }


   


    static updatePass(_id, old,news){
        return new Promise(async (next)=>{
            await Admin.findOneAndUpdate({'_id':ObjectID(_id), password:old},{$set:{password:news}}, {new:true})
            .then((res)=>{
                console.log(res);
                next(res);
            }).catch((err)=>{console.log(err); next(err)})
        })
    }

    static updateClient(_id, pass,name,firstname,numero){

        return new Promise(async (next)=>{
            await Client.findOneAndUpdate({'_id':ObjectID(_id), password:pass},{$set:{name:name,firstname:firstname,numero:numero}}, {new:true})
                .then((res)=>{
                    console.log("ici")
                    next(res);
                }).catch((err)=>{console.log(err); next(err)})
        })
    }
    static setCommande(id, price, platId, contain, rend){
        return new Promise(async (next)=>{
            const user = new Commande({CliendId:id, price: price, platId:platId, contain: contain, code:rend.toString(), etat:1});
            await user.save().then((res)=>{
                console.log(res);
                next(res);
            }).catch((err)=>{console.log(err); next(err)})
        })
    }

    static getEcoleOfCommande(cliendId){
        return new Promise(async(next)=>{
            await Client.findOne({'_id':ObjectID(cliendId)})
                .then(res=>{
                    next(res);
                }).catch(err=>{
                    next(err);
                })
        })
    }
    static setClient(name, firstname, password, numero, schoolValue,commune){
        return new Promise(async (next)=>{
            const user = new Client({name:name, firstname: firstname, numero:numero, schoolValue: schoolValue, address:commune, password:password});
            await user.save().then((res)=>{
                console.log(res);
                next(res);
            }).catch((err)=>{console.log(err); next(err)})
        })
    }

    static setSchool(label, value){
        return new Promise(async (next)=>{
            const user = new School({label:label, value: value});
            await user.save().then((res)=>{
                next(res);
            }).catch((err)=>{console.log(err); next(err)})
        })
    }

    static getNumberPlatFixe(type){
        return new Promise(async (next)=>{
            await Plat.count({etat:type}).then(res =>{
                next(res);
            }).catch(err =>{
                next(err);
            })
        })
    }

    static getNumberCommande(){
        let ye = new Date().getFullYear();
        let mol = new Date().getMonth();
        let day = new Date().getDate();
        let ele = new Date(ye, mol ,day);
        return new Promise(async (next)=>{
            await Commande.count({register_date:{$gte:ele}}).then(res =>{
                next(res);
            }).catch(err =>{
                next(err);
            })
        })
    }

    static getNumberClient(){
        return new Promise(async (next)=>{
            await Client.find().then(res =>{
                next(res);
            }).catch(err =>{
                next(err);
            })
        })
    }

    static getNumberAdmin(){
        return new Promise(async (next)=>{
            await Admin.count().then(res =>{
                next(res);
            }).catch(err =>{
                next(err);
            })
        })
    }

    static getAdmins() {
        return new Promise(async (next)=>{
            await Admin.find()
            .then((res)=>{
                console.log("les Admin \n"+res)
                next(res);
            }).catch((err)=>{next(err)})
        })
    }

    static getSchools() {
        return new Promise(async (next)=>{
            await School.find()
                .then((res)=>{
                    console.log("les School \n"+res)
                    next(res);
                }).catch((err)=>{next(err)})
        })
    }
    static getCommandInWait() {
        let ye = new Date().getFullYear();
        let mol = new Date().getMonth();
        let day = new Date().getDate();
        let ele = new Date(ye, mol ,day);
        return new Promise(async (next)=>{
            await Commande.find({etat:1, register_date: {$gte: ele}})
                .then((res)=>{
                    console.log("les Admin \n"+res)
                    next(res);
                }).catch((err)=>{next(err)})
        });
    }

    static getPlatWithId(id){
        return new Promise(async(next)=>{
            await Plat.findOne({'_id':ObjectID(id)})
                .then(res=>{
                    next(res);
                }).catch(err=>{
                    next(err);
                })
        })
    }
    static getCommandWithId(id){
        return new Promise(async(next)=>{
            await Commande.find({'CliendId':id})
                .then(res=>{
                    next(res);
                }).catch(err=>{
                    next(err);
                })
        })
    }
    static getClientWithId(id){
        return new Promise(async(next)=>{
            await Client.findOne({'_id':ObjectID(id)})
                .then(res=>{
                    next(res);
                }).catch(err=>{
                    next(err);
                })
        })
    }

    static getCommandOnUpdateWithId(id){
        return new Promise(async(next)=>{
            await Commande.findOneAndUpdate({'_id':ObjectID(id)}, {$set:{ "etat": 2 }}, {new: true})
                .then(res=>{
                    next(res);
                }).catch(err=>{
                    next(err);
                })
        })
    }

    static getAccompagnementWithId(id){
        return new Promise(async(next)=>{
            await Accompagnement.findOne({'_id':ObjectID(id)})
                .then(res=>{
                    next(res);
                }).catch(err=>{
                    next(err);
                })
        })
    }

    static getCommandInSend() {
        return new Promise(async (next)=>{
            await Commande.find({etat:2})
                .then((res)=>{
                    next(res);
                }).catch((err)=>{next(err)})
        })
    }


    static getAllPlatByType(type) {
        return new Promise(async (next)=>{
            await Plat.find({etat:type})
                .then((res)=>{
                    next(res);
                }).catch((err)=>{next(err)})
        })
    }
    static getAllPlatByTypeWithAffiche(type,affiche) {
        return new Promise(async (next)=>{
            await Plat.find({etat:type, affiche:affiche})
                .then((res)=>{
                    next(res);
                }).catch((err)=>{next(err)})
        })
    }


    static getAllAccompagnementByType(type) {
        return new Promise(async (next)=>{
            await Accompagnement.find({etat:type})
                .then((res)=>{
                    next(res);
                }).catch((err)=>{next(err)})
        })
    }
    /*static getAllAccompagnementByTypeAndPlatNiveau(type, level) {
        return new Promise(async (next)=>{
            await Accompagnement.find({etat:type, platNiveau:level})
                .then((res)=>{
                    next(res);
                }).catch((err)=>{next(err)})
        })
    }*/
    static updateSemaine(id, affiche){
        return new Promise(async (next)=>{
            await Plat.updateOne({'_id':ObjectID(id)},{$set:{"affiche":affiche}})
                .then(res=>{
                    next(res);
                }).catch(err=>{
                    next(err);
                })
        })
    }
    static setPlat(name,price,url, etat, affiche){
        return new Promise(async (next)=>{
            let plat = new Plat({tit: name,price:price, url:url,etat:etat,affiche:affiche})
            await plat.save().then((res)=>{
                next(res)
            }).catch(err=>{
                next(err)
            })
        })
    }
    static setAccompagementByPlat(name, acompagement){
        return new Promise(async (next)=>{
            let plat = await Plat.findOne({name:name});
            plat.accompagement.push(acompagement)
            await plat.save().then(res=>{console.log("reussi ", res); next(res)}).catch(err=>{console.log("err ", err); next(err)})
        })
    }
    static delAccomp(name){
        console.log(name)
        return new Promise(async (next)=>{
            await Accompagnement.findOneAndDelete({name:name})
                .then(async res=>{
                    await Plat.find()
                        .then(async ress=>{
                            for(let i in ress){
                                for (let j in ress[i].accompagement){
                                    console.log(ress[i].accompagement[j]);
                                    if(ress[i].accompagement[0] && name === ress[i].accompagement[j].accomp.name){
                                        ress[i].accompagement.splice(j,1);
                                    }
                                }
                                await ress[i].save().then(resss=>{console.log("edité avec succès"); next(resss)}).catch(errss=>{console.log("erreur avec edit", errss); next(errss)})
                            }
                        }).catch(errs=>{console.log("mal Find ", errs), next(errs)})
                }).catch(err=>{console.log("mauvais del", err); next(err)});
        })
    }
    static delAPlat(name){
        return new Promise(async (next)=>{
            await Plat.findOneAndDelete({tit:name})
                .then(async res=>{
                    next(res)
                }).catch(err=>{console.log("mauvais del", err); next(err)});
        })
    }
    static setAccompagnement(name,etat){
        return new Promise(async (next)=>{
            let plat = new Accompagnement({name: name,etat:etat})
            await plat.save().then((res)=>{
                console.log("succ" + res)
                next(res)
            }).catch(err=>{
                console.log("err" + err)

                next(err)
            })
        })
    }

    static getNumberAccompagnement(type) {
        return new Promise(async (next)=>{
            await Accompagnement.count({etat:type})
                .then((res)=>{
                    next(res);
                }).catch((err)=>{next(err)})
        })
    }
};
