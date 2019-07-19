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
const sgMail = require('@sendgrid/mail');
var multer  = require('multer');

/************************************* Configuration du module MongoDB *************************************/
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = process.env.MONGODB_URI;
const dbName = 'heroku_z2g9tqqw';

// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI);
// let db = mongoose.connection;

//Models
// const Users = require("../models/user-model");
// const Image = require("../models/upload-image-model");


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



/*********************************** Fonction globale de vérification des identifiants du joueur qui se connecte *******************************************/
let checkVerifs = function(aPseudo, bPwd, cAvatar, dInfosJoueur){
    log(`On est dans la fonction "checkVerifs".`);

    if(aPseudo && bPwd && cAvatar && dInfosJoueur.firstLogin){
        // findUserInDB(dInfosJoueur.pseudo, dInfosJoueur.mdp);
        log(1);
        log(typeof dInfosJoueur.pseudo);
        log(`Pseudo reçu : ${dInfosJoueur.pseudo}`);
        // log('Pseudo récupéré : ' + infosJoueursBDD.pseudo);
        // log(typeof(joueurEnBdd.pseudo));
        // log(joueurEnBdd.pseudo === dInfosJoueur.pseudo);

        MongoClient.connect(url,{ useNewUrlParser: true },function(error,client){
            if(error){
                log(`Connexion à Mongo impossible!`);
                log(error);
                // throw error;
            } else{
                log(`On est dans le "else" de la fonction "findUserInDB".`);
                const db = client.db(dbName);
                const collection = db.collection('users');
                collection.findOne({pseudo: dInfosJoueur.pseudo, pwd: dInfosJoueur.mdp}, function(error,datas){
                    log(`On rentre dans la fonction de callback.`);
                    if(error){
                        log(`Que se passe-t-il? ${error}`);
                    } else{
                        infosJoueursBDD = datas;
                        client.close();
                        log('Infos récupérées : ', datas);

                    log(`Datas récupérées en base : ${infosJoueursBDD}`);

                    if(!datas){
                        log(`Le pseudonyme n'existe pas en base. On enregistre les infos`);
                        log(2);

                        MongoClient.connect(url, { useNewUrlParser: true }, function(error,client){
                            if(error){
                                log(`Connexion à Mongo impossible!`);
                            } else{
                                log(`On va intégrer les données en base`);
                                const db = client.db(dbName);
                                const collection = db.collection('users');
                        collection.insertOne({pseudo: dInfosJoueur.pseudo, pwd: dInfosJoueur.mdp, avatar: dInfosJoueur.img, lastScore: 0, bestScore: 0});
                            }
                            client.close();
                        });

                        log(3);
                        socket.pseudo = dInfosJoueur.pseudo;
                        let newPlayer = new Player(dInfosJoueur.pseudo, dInfosJoueur.mdp, dInfosJoueur.img, socket.id);
                        log('Nouveau joueur : ', newPlayer);
                        let pseudo = dInfosJoueur.pseudo;
                        players[socket.id] = newPlayer;
                        socket.playerId = players[socket.id].identifiant;
                        nbPlayers++;

                        log(`Nb joueurs : ${nbPlayers}`);
                        socket.emit('loginOK', newPlayer);
                        socket.broadcast.emit('newPlayer', newPlayer);
                        log(players);
                        io.emit('onlinePlayers', players);
                        logged = true;
                        checkNbPlayers();

                        } else{
                            log(4);
                            let message = `Le pseudo ${dInfosJoueur.pseudo} est déjà pris!`;
                            socket.emit('alreadyUsedPseudo', {msg: message});
                            log(`Pseudo déjà utilisé!`);
                        }
                        // return datas;
                    }
                });
            }
        });
    } else{
        if (aPseudo && bPwd && !dInfosJoueur.firstLogin){
            log(5);
            MongoClient.connect(url,{ useNewUrlParser: true },function(error,client){
                if(error){
                    log(error);
                    log(`Connexion à Mongo impossible!`);
                    // throw error;
                } else{
                    log(`On est dans le "else" de la fonction "findUserInDB".`);
                    const db = client.db(dbName);
                    const collection = db.collection('users');
                    collection.findOne({pseudo: dInfosJoueur.pseudo, pwd: dInfosJoueur.mdp}, function(error,datas){
                        infosJoueursBDD = datas;
                        log(`On rentre dans la fonction de callback.`);
                        log(infosJoueursBDD);
                        if(error){
                            log(`Que se passe-t-il? ${error}`);
                        } else{
                            if(!datas){
                                log(6);
                                socket.emit('badInfos', {msg: 'Le pseudo et/ou le mot de passe est incorrect. Veuillez réessayer.'});
                            } else{
                                log(7);
                                socket.pseudo = dInfosJoueur.pseudo;
                                let newPlayer = new Player(dInfosJoueur.pseudo, dInfosJoueur.mdp, infosJoueursBDD.avatar, socket.id);
                                log('Nouveau joueur : ', newPlayer);
                                let pseudo = dInfosJoueur.pseudo;
                                players[socket.id] = newPlayer;
                                socket.playerId = players[socket.id].identifiant;
                                nbPlayers++;
                    
                                log(`Nb joueurs : ${nbPlayers}`);
                                socket.emit('loginOK', newPlayer);
                                socket.broadcast.emit('newPlayer', newPlayer);
                                log(players);
                                io.emit('onlinePlayers', players);
                                logged = true;
                                checkNbPlayers();
                            }
                        }
                    });
                }
                client.close();
            });
        } else{
            log(8);
            socket.emit('userUnknown');
        }
    }
};
// };

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
            socket.emit('badPseudo', {msg: 'Votre pseudonyme est vide ou incorrect).'});
            log(`Pseudo non valide!`);
        }
    } 

    let checkPwd = await checkLogin.verifPwd(infosUser.mdp);
    log('Pass : ' + checkPwd);
    if(!checkPwd){
        log(`On est dans la condition !checkPwd`);
        socket.emit('badPwd', {msg: 'Votre mot de passe est vide, trop court (6 caractères min) ou trop long (12 caractères max).'});
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