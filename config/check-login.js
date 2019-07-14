/************************************* A mettre dans "server.js" : Modularisation de la vérification des identifants du joueur qui se connecte *************************************/
// console.log('Dirname : ' + __dirname);
// const checkLogin = require('./config/check-login.js');

/************************************* Données pour le module "check-login.js" : Modularisation de la vérification des identifants du joueur qui se connecte : Trop galère, il faudrait exporter toutes les sockets pour que le module puisse émettre*************************************/

console.log(`Bienvenue dans le module check-login.js!`);
var exports = module.exports = {};

// Fonction pour vérifier que le pseudo n'est pas vide
exports.verifPseudo = function(pseudo){
    if(pseudo === '' || pseudo.length === 0 || pseudo === 'null' || pseudo === 'undefined' || pseudo === 'Infinity'){
        console.log(`Dans le module : Pseudo non valide!`);
        return false;
    } else{
        console.log(`Pseudo valide! -> A chercher en BDD!`);
        return true;
    }
};

// Fonction pour vérifier que le mot de passe n'est pas vide
exports.verifPwd  = function(pwd){
    if(pwd === '' || pwd === null || pwd.length === 0 || pwd === undefined || pwd === Infinity){
        console.log(`Dans le module : Mot de passe non valide!`);
        return false;
    } else{
        console.log(`Mot de passe valide! -> A chercher en BDD!`);
        return true;
    }
};

// Fonction pour vérifier que l'url de l'avatar est correcte
exports.verifUrl = function(url, premiereConnexion){
// Expression régulière pour vérifier l'url de l'avatar

    const urlRegex = new RegExp('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$', 'igm');

    if(url.match(urlRegex)){
        console.log(`Url OK!!!`);
        return true;
    } else{
        console.log(`Dans le module : Url non valide!`);
        return false;
    }
};