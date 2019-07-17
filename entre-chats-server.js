/******************************************************************************************************************/
/***************************************** Entre-chats : côté serveur ********************************************/
/****************************************************************************************************************/
'use strict';

/********************** Configuration des modules "path" et "fs" (file system) de Node.JS **********************/
const path = require('path');
const fileSys = require('fs');

/********************* Configuration du module "http" avec Express JS + du port HTTP *********************/
const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
app.use(express.static('public'));
const port = 3333;

/************************** Ajout de modules **************************/
const socketIo = require('socket.io');


/************************************* Configuration du module MongoDB *************************************/
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = process.env.MONGODB_URI;
const dbName = 'heroku_z2g9tqqw';

// const mongoose = require('mongoose');


/************* Constante de raccourci pour "console.log" + déclaration des variables globales **************/
const log = console.log;
var logged = false;
var cats = {};
var nbCats = 0;
var infosChatsBDD;


/************************************** Création d'un nouveau chat **********************************************/
var Kitty = function(pseudo, pwd, urlImg, socketId){
    this.dateCrea = Date.now();
    this.pseudo = pseudo;
    this.identifiant = this.pseudo + '-' + this.dateCrea;
    this.password = pwd;
    this.score = 0;
    this.avatar = urlImg;
    this.socketId = socketId;
};

/**************************** On rattache le serveur HTTP à socket.io ************************************/
const io = socketIo(httpServer);
// log(io);






/*********************************** Connexion d'un utilisateur *******************************************/
log('Un nouvel utilisateur vient de se connecter. ' + socket.id);

socket.on('login', async function(infosUser){

    log('infosUser : ', infosUser);

    let checkPseudo = async function(infosUser.pseudo){
        await checkLogin.verifPseudo(infosUser.pseudo);
        log('Pseudo : ' + checkPseudo);
        if(!checkPseudo){
            log(`On est dans la condition !checkPseudo`);
            socket.emit('badPseudo');
            // socket.emit('badPseudo', {msg: 'Votre pseudonyme est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'});
            log(`Pseudo non valide!`);
        }
    } 

    let checkPwd = await checkLogin.verifPwd(infosUser.mdp);
    log('Pass : ' + checkPwd);
    if(!checkPwd){
        log(`On est dans la condition !checkPwd`);
        socket.emit('badPwd', {msg: 'Votre mot de passe est vide ou trop court).'});
        log(`Mot de passe non valide!`);
    }

    log(`First login vaut : ${infosUser.firstLogin}`);
    let checkUrl = await checkLogin.verifUrl(infosUser.img);
    log('URL : ' + checkUrl);
    // let checkUrl = checkLogin.verifUrl(infosUser.img, infosUser.firstLogin);
    if(infosUser.firstLogin){
        log(checkUrl);
        if(!checkUrl){
            socket.emit('badAvatar', {msg: 'L\'url du lien vers votre avatar est vide ou non valide. Cela doit commencer par \'http://\' ou \'https://\''});
            log(`Url non valide!`);
        }
    }
    log('1st Login : ' + infosUser.firstLogin);
    await checkVerifs(checkPseudo, checkPwd, checkUrl, infosUser);
});




/*********************************** Echange de messages entre chats *******************************************/
socket.on('chatMsg', function (message){
    log('Pseudo : ', cats[socket.id].pseudo);
    log(message);
    message = message;
    // log(cats);
    io.emit('afficheChatMsg',  {pseudo: cats[socket.id].pseudo, msg: message, date: Date.now()});
});





/*********************************** Déconnexion d'un utilisateur *******************************************/
// Déconnexion d'un utilisateur
socket.on('disconnect', function(reason){
    log('Déconnexion : ', socket.id, reason);
    log('Joueur qui vient de se déconnecter : ', cats[socket.id]);
    log(`Nombre de joueurs connectés (avant décrémentation si loggée) : ${nbCats}`);
    nbCats--;
    if(logged){
        // nbCats--;
        socket.broadcast.emit('decoCat', {pseudo: socket.pseudo, id: socket.catId});
        log(`Nombre de joueurs connectés (après une déconnexion loggée) : ${nbCats}`);
        delete cats[socket.id];
    }
    // socket.broadcast.emit('decoCat', {pseudo: socket.pseudo, id: cats[socket.id].identifiant});
    log(`Nombre de joueurs connectés (après une déconnexion loggée) : ${nbCats}`);

    if(nbCats === undefined || nbCats <= 0){
        log(`On est dans le "if" de la déconnexion`);
        nbCats = 0;
        log(`En cas de -1 ou undefined, nbCats passe à 0 : ${nbCats}`);
    }
});

});

/************************************** Démarrage du serveur HTTP **************************************/
httpServer.listen(process.env.PORT || port, function(error){
    // httpServer.listen(port, function(error){
    if(error){
        console.log(`Impossible d'associer le serveur HTTP au port ${port}.`);
    } else{
        console.log(`Serveur démarré et à l'écoute sur le port ${port}.`);
    }
});