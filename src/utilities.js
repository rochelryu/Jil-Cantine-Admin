const path = require('path');
exports.isErr = (_data) =>{
    return _data instanceof Error;
}

exports.isExist = (_aray, crypt) =>{
    let ele = -1;
    for(let i in _aray){
        if(crypt === _aray[i].emailcrypt){
            ele = i;
        }
        continue;
    }
    return ele;
}
exports.uploadProfil = (_data) =>{
    if (_data.mimetype === "image/png" || _data.mimetype === "image/jpg" || _data.mimetype === "image/jpeg" || _data.mimetype === "image/gif"){}
}
exports.verifUserConnected = (array, id) =>{
    let user = false;
    for (let i in array){
        if (array[i].id === id){
            user = true;
        }
    }
    return user;
}
exports.arrondi = (data)=>{
    data *= 100;
    data = Math.round(data);
    return data/100;
}
exports.verifImage = (_data) =>{
    let image = false;
    const re = /(?:\.([^.]+))?$/;
    let ext = re.exec(_data)[1];
    ext = ext.toLowerCase();
    if(ext == "jpeg" || ext == "jpg" || ext == "png" || ext == "gif"){
        image = true;
    }
    return image;
}
exports.strinfToDate = (data)=>{
    let date = new Date();
    let tab = new Array();
    data = data.toString()
    tab = data.split('-');
    date.setDate(tab[2]);
    date.setMonth(tab[1] - 1);
    date.setFullYear(tab[0]);
    return date;
}
exports.horodatage = (date) => {
    var ele = false;
    var post = new Date(date).getTime();
    var atMoment = new Date().getTime();
    post /= 1000;
    atMoment /= 1000;
    var fior = parseInt((post - atMoment), 10);
    if (fior <= 0){
        ele = true;
    }
    return ele;
}