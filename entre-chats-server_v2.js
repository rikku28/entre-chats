/******************************************************************************************************************/
/***************************************** Entre-chats : côté serveur ********************************************/
/****************************************************************************************************************/
'use strict';

/********************** Configuration des modules "path" et "fs" (file system) de Node.JS **********************/
const path = require('path');
const fileSys = require('fs');

/********************* Configuration du module "http" avec Express JS, en plus de Node.JS *********************/
const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
app.use(express.static('public'));
const port = 3333;

/************************************* Ajout de modules complémentaires *************************************/
const socketIo = require('socket.io');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
const multer  = require('multer');

/************************************* Données pour server.js : Modularisation de la vérification des identifants du joueur qui se connecte *************************************/
// console.log('Dirname : ' + __dirname);
const checkLogin = require('./config/check-login.js');
const sendMail = require('./config/envoi-mail.js');
// const uploadImg = require('./config/upload-img.js');

/************************************* Configuration du module MongoDB *************************************/
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = process.env.MONGODB_URI;
const dbName = 'heroku_z2g9tqqw';

/************* Constante de raccourci pour "console.log" + déclaration des variables globales **************/
const log = console.log;
var logged = false;
var kittens = {};
var nbPlayers = 0;
var infosJoueursBDD;
var attenteJoueur = true;
var finPartie = false;
var bestScores = [];
var storageKey = 'LaCleLS';
var storageItem = 'Coucou Hibou!'
var chercheChats = '';
const saltRounds = 10;

/********************************** Création du serveur HTTP avec Express **********************************/
app.get('/', function(req, res, next){
    // log(req);
    console.log('Dirname : ' + __dirname);
    // console.log('Filename : ' + __filename);
    // console.log(`Current directory: ${process.cwd()}`);
    // console.log('process.arg : ' + process.argv);
    // let homePage = path.normalize(__dirname + '/public/index2.html');
    // let homePage = path.normalize(__dirname + '/public/login.html');
    let homePage = path.normalize(__dirname + '/public/index.html');
    log(homePage);

    //Doc Express pour le traitement des erreurs : https://expressjs.com/fr/guide/error-handling.html
    res.sendFile(homePage);
});

// app.get('/tchat', function(req, res, next){
//     console.log('Dirname : ' + __dirname);
//     let chatPage = path.normalize(__dirname + '/public/chat.html');
//     log(chatPage);
//     res.sendFile(chatPage);
// });

// app.get('/chat', function(req, res, next){
//     console.log('Dirname : ' + __dirname);
//     let chatPage = path.normalize(__dirname + '/public/chat.html');
//     log(chatPage);
//     res.sendFile(chatPage);
// });

// app.get('/apropos', function(req, res, next){
//     console.log('Dirname : ' + __dirname);
//     let aProposPage = path.normalize(__dirname + '/public/about.html');
//     log(aProposPage);
//     res.sendFile(aProposPage);
// });

// app.get('/about', function(req, res, next){
//     console.log('Dirname : ' + __dirname);
//     let aboutPage = path.normalize(__dirname + '/public/about.html');
//     log(aboutPage);
//     res.sendFile(aboutPage);
// });

// app.get('/profil', function(req, res, next){
//     console.log('Dirname : ' + __dirname);
//     let profilPage = path.normalize(__dirname + '/public/profil.html');
//     log(profilPage);
//     res.sendFile(profilPage);
// });

// app.get('/messages', function(req, res, next){
//     console.log('Dirname : ' + __dirname);
//     let msgPage = path.normalize(__dirname + '/public/messages.html');
//     log(msgPage);
//     res.sendFile(msgPage);
// });

// app.get('/amis', function(req, res, next){
//     console.log('Dirname : ' + __dirname);
//     let friendsListPage = path.normalize(__dirname + '/public/amis.html');
//     log(friendsListPage);
//     res.sendFile(friendsListPage);
// });

// app.get('/admin', function(req, res, next){
//     console.log('Dirname : ' + __dirname);
//     let adminPage = path.normalize(__dirname + '/public/admin.html');
//     log(adminPage);
//     res.sendFile(adminPage);
// });

app.get('/logout', function(req, res, next){
    // console.log('Dirname : ' + __dirname);
    // let adminPage = path.normalize(__dirname + '/public/admin.html');
    // log(adminPage);
    // res.sendFile(adminPage);
    logged = false;
    res.redirect('/');
});

/**************************** On rattache le serveur HTTP à socket.io ************************************/
const io = socketIo(httpServer);
// log(io);

// Cheatsheet : 
    // io.emit => On envoie le message / les infos à tout le monde.
    // socket.emit => On envoie le message / les infos au joueur correspond.
    // socket.broadcast.emit => On envoie le message / les infos à tous les joueurs, sauf celui correspondant à la "socket".


/************************************** Création de joueurs **********************************************/
var Kitten = function(pseudo, pwd, email, race, genre, urlImg, socketId){
    this.dateCrea = Date.now();
    this.pseudo = pseudo;
    this.identifiant = this.pseudo + '-' + this.dateCrea;
    this.password = pwd;
    this.email = email;
    this.genre = genre;
    this.race = race;
    this.avatar = urlImg;
    this.admin = false;
    this.socketId = socketId;
};

/*********************************** Vérification du nombre de joueur *******************************************/
var checkNbPlayers = function(){
    // log(`(checkNbPlayers) Le jeu est-il en cours? ${startGame}`);
    log(`Nombre de joueurs connectés (checkNbPlayers): ${nbPlayers}`);
    let playersLength = Object.keys(kittens).length;
    log('Avec object.keys - checkNbPlayers contient : ' + Object.keys(kittens).length + ' entrées');

    if(nbPlayers < playersLength){
        nbPlayers = playersLength;
        log(`nbPlayers plus petit que kittens, on repasse nbPlayers à : ${nbPlayers}`);
    }
};

/*********************************** On établie la connexion socket.io *******************************************/
io.on('connection', function(socket){
    // log(socket);
    log('Coucou depuis le serveur!');
    log(`Nombre de joueurs connectés : ${nbPlayers}`);
    // log('Connexion - kittens contient :' + kittens.length + ' objets.');  // Renvoi "undefined"
    log('Avec object.keys : ' + Object.keys(kittens).length);
    // if(!startGame && (Object.keys(kittens).length > nbPlayers)){
    //     nbPlayers = kittens.length;
    //     log(nbPlayers);
    //     checkNbPlayers();
    // }
    log(nbPlayers);
    checkNbPlayers();
    log(`Nombre de joueurs connectés (après nouvelle connexion): ${nbPlayers}`);

// /*********************************** Fonction pour vérifier que le pseudo n'est pas vide *******************************************/   // Déplacée dans le module
//     let verifPseudo = function(pseudo){
//         if(pseudo === '' || pseudo.length === 0 || pseudo ===null || pseudo === undefined || pseudo === Infinity){
//             socket.emit('badPseudo', {msg: 'Votre pseudonyme est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'});
//             console.log(`Pseudo non valide!`);
//             return false;
//         } else{
//             console.log(`Pseudo valide! -> A chercher en BDD!`);
//             return true;
//         }
//     };

/*********************************** Fonction de génération du cryptage des mots de passe *******************************************/

// let cryptPwd = function(pwdEnClair){
//     bcrypt.genSalt(saltRounds, function(err, salt) {
//         bcrypt.hash(pwdEnClair, salt, function(err, hash) {
//             // Store hash in your password DB.
//         });
//     });
// };

// OU : bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
  // Store hash in your password DB.
// });

// let comparePwd = function(pwdEnClair, pwdHash){
//     // Load hash from your password DB.
//     bcrypt.compare(pwdEnClair, pwdHash, function(err, res) {
//         // res == true
//     });
    // bcrypt.compare(someOtherPlaintextPassword, hash, function(err, res) {
    //     // res == false
    // });
// };

// Doc : https://www.npmjs.com/package/bcrypt

// Why is async mode recommended over sync mode?
// If you are using bcrypt on a simple script, using the sync mode is perfectly fine. However, if you are using bcrypt on a server, the async mode is recommended. This is because the hashing done by bcrypt is CPU intensive, so the sync version will block the event loop and prevent your application from servicing any other inbound requests or events. The async version uses a thread pool which does not block the main event loop.

// Test avec la branch bcrypt : problème de symbol illegal pour Mongo. A tester en faisant le hash séparément de l'enregistrement des infos en base.

/*********************************** Fonction globale de vérification des identifiants du chat qui se connecte *******************************************/
    let checkVerifs = function(aPseudo, bPwd, cAvatar, eMail, dInfosJoueur){
        log(`On est dans la fonction "checkVerifs".`);
        log(`Infos joueur : ${dInfosJoueur}`);
        // log(`Infos joueur : ${dInfosJoueur.pseudo}`);

        if(aPseudo && bPwd && cAvatar && eMail && dInfosJoueur.firstLogin){
            // findUserInDB(dInfosJoueur.pseudo, dInfosJoueur.mdp);
            log(1);
            log(typeof dInfosJoueur.pseudo);
            log(`Pseudo reçu : ${dInfosJoueur.pseudo}`);
            // log('Pseudo récupéré : ' + infosJoueursBDD.pseudo);
            // log(typeof(joueurEnBdd.pseudo));
            // log(joueurEnBdd.pseudo === dInfosJoueur.pseudo);

            MongoClient.connect(url,{ useNewUrlParser: true },function(error,client){
                if(error){
                    log(`Connexion à Mongo impossible! - log 1`);
                    log(error);
                    // throw error;
                } else{
                    log(`Connexion à MongoDB : OK - log 1`);
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
                                    log(`Connexion à Mongo impossible! - log 2`);
                                } else{
                                    log(`On va intégrer les données en base - log 2`);
                                    const db = client.db(dbName);
                                    const collection = db.collection('users');
                                    collection.insertOne({pseudo: dInfosJoueur.pseudo, pwd: dInfosJoueur.mdp, email: dInfosJoueur.email, avatar: dInfosJoueur.img, race: dInfosJoueur.race, genre: dInfosJoueur.genre, admin: false});
                                }
                                client.close();
                            });

                            log(3);
                            socket.pseudo = dInfosJoueur.pseudo;
                            let newCat = new Kitten(dInfosJoueur.pseudo, dInfosJoueur.mdp, dInfosJoueur.email, dInfosJoueur.race, dInfosJoueur.genre, dInfosJoueur.img, socket.id);
                            log('Nouveau joueur : ', newCat);
                            let pseudo = dInfosJoueur.pseudo;
                            kittens[socket.id] = newCat;
                            socket.playerId = kittens[socket.id].identifiant;
                            nbPlayers++;

                            log(`log 3 - Nb joueurs : ${nbPlayers}`);
                            socket.emit('loginOK', {pseudo: dInfosJoueur.pseudo, avatar: dInfosJoueur.img, race: dInfosJoueur.race, genre: dInfosJoueur.genre,
                            key: storageKey, item: storageItem});
                            socket.broadcast.emit('newCat', newCat);
                            log(kittens);
                            io.emit('onlinePlayers', kittens);
                            logged = true;
                            checkNbPlayers();

                            // res.redirect('/profil');
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
                        log(`Connexion à Mongo impossible! - log 5`);
                        // throw error;
                    } else{
                        log(`On est connecté à la base MongoDB! - log 5`);
                        log(`On est dans le "else" de la fonction "findUserInDB".`);
                        const db = client.db(dbName);
                        const collection = db.collection('users');
                        collection.findOne({pseudo: dInfosJoueur.pseudo, pwd: dInfosJoueur.mdp}, function(error,datas){
                            infosJoueursBDD = datas;
                            log(`On rentre dans la fonction de callback de "findOne". - log 5`);
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
                                    let newCat = new Kitten(dInfosJoueur.pseudo, dInfosJoueur.mdp, infosJoueursBDD.email, infosJoueursBDD.race, infosJoueursBDD.genre, infosJoueursBDD.avatar, socket.id);

                                    if (infosJoueursBDD.admin){
                                        newCat.admin = infosJoueursBDD.admin;
                                    }

                                    log('Nouveau joueur : ', newCat);
                                    let pseudo = dInfosJoueur.pseudo;
                                    kittens[socket.id] = newCat;
                                    socket.playerId = kittens[socket.id].identifiant;
                                    nbPlayers++;
                        
                                    log(`Nb joueurs : ${nbPlayers}`);

                                    socket.emit('loginOK', {pseudo: dInfosJoueur.pseudo, avatar: newCat.avatar, race: newCat.race, genre: newCat.genre, key: storageKey, item: storageItem});
                                    socket.broadcast.emit('newCat', newCat);
                                    log(kittens);
                                    io.emit('onlinePlayers', kittens);
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

    socket.on('login', function(infosUser){

        log('infosUser : ', infosUser);

        let checkPseudo = checkLogin.verifPseudo(infosUser.pseudo);
        log('Pseudo : ' + checkPseudo);
        if(!checkPseudo){
            log(`On est dans la condition !checkPseudo`);
            socket.emit('badPseudo');
            // socket.emit('badPseudo', {msg: 'Votre pseudonyme est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'});
            log(`Pseudo non valide!`);
        }

        let checkPwd = checkLogin.verifPwd(infosUser.mdp);
        log('Pass : ' + checkPwd);
        if(!checkPwd){
            log(`On est dans la condition !checkPwd`);
            socket.emit('badPwd', {msg: 'Votre mot de passe est vide ou équivalent à une valeur non autorisée (null, undefined et Infinity).'});
            log(`Mot de passe non valide!`);
        }

        log(`First login vaut : ${infosUser.firstLogin}`);
        let checkUrl = checkLogin.verifUrl(infosUser.img);

        let checkEmail = checkLogin.verifEmail(infosUser.email);

        log('URL : ' + checkUrl);
        // let checkUrl = checkLogin.verifUrl(infosUser.img, infosUser.firstLogin);
        if(infosUser.firstLogin){
            log(checkUrl);
            if(!checkUrl){
                socket.emit('badAvatar', {msg: 'L\'url du lien vers votre avatar est vide ou non valide. Cela doit commencer par \'http://\' ou \'https://\''});
                log(`Url non valide!`);
            }

            if(!checkEmail){
                socket.emit('badMail', {msg: 'L\'adresse email est vide ou non valide. Elle doit contenir un @ .'});
                log(`Mail non valide!`);
            }
        }

        log('1st Login : ' + infosUser.firstLogin);
        log(`Pseudo : ${checkPseudo} , Pwd : ${checkPwd} , Email : ${checkUrl} , URL : ${checkPseudo} `);
        checkVerifs(checkPseudo, checkPwd, checkUrl, checkEmail, infosUser);

        checkNbPlayers();
    });

/**************************************** Echange de messages entre joueurs (/) ************************************************/
socket.on('chatMsg', function (message){
    log('Pseudo : ', kittens[socket.id].pseudo);
    log(message);
    message = message;
    let dateMsg = new Date().toString();
    log(dateMsg);
    io.emit('afficheChatMsg', {pseudo: kittens[socket.id].pseudo, msg: message, date: dateMsg});
});

io.emit('onlinePlayers', kittens);

/**************************************** Infos récap profil du chat ************************************************/
socket.on('needInfos', function(msg){

    log(`On est dans la fonction pour transmettre les infos du chat au client, afin de remplir ses infos de profil`);
    log(`Message reçu du client : ${msg}`);
    // socket.emit('chatProfil', {pseudo: kittens[socket.id].pseudo, avatar: kittens[socket.id].avatar, email: kittens[socket.id].email, genre: kittens[socket.id].genre, race: kittens[socket.id].race});

});

/********************************************* Recherche de chats *********************************************/
let searchCats = function(catName){
// let searchCats = function(){
    log(`Nous sommes dans la fonction searchCats`);
    // log(catName);

    MongoClient.connect(url, {useNewUrlParser: true}, function(error, client){
        if(error){
            log(`Connexion à Mongo impossible! - Recherche de chats`);
            log(error);
            // throw error;
        } else{
            log(`1 : recherche de chats`)
            log(`Connexion à MongoDB : OK - On va chercher un chat.`);
            const db = client.db(dbName);
            const collection = db.collection('users');
            // collection.createIndex({pseudo:"text"}, {name: "indexTexte"});
            // collection.find({$text:{$search: catName}}).toArray(function(err,data){
            // {"pseudo": { "$regex": catName, "$options": "i" }}
            collection.find({"pseudo": catName}, {projection:{pseudo:1, avatar: 1, _id:0}}).toArray(function(err,data){
                log(`On rentre dans la fonction de callback.`);
                if(err){
                    log(`Que se passe-t-il? ${err} - recherche de chat`);
                } else{
                    log(`2 : recherche de chats`);
                    let resultatChats = data;
                    client.close();
                    log('Infos récupérées : ', data);
                    log('Nombre de scores récupérés : ' + resultatChats.length);
                    // log(`Datas récupérées en base : ${resultatChats}`);

                    if(!data){
                        log(`3 : recherche de chats`);
                        log(`Aucun chat ne correspond à votre recherche!`);
                        let message = 'Aucun chat ne correspond à votre recherche!';
                        socket.emit('noCat', {msg: message});
                    } else{
                        log(`4 : recherche de chats`);
                        let liste = resultatChats; // Ne transférer que le pseudo + avatar
                        socket.emit('catList', resultatChats);
                    }
                }
            });
        }
    });
};

socket.on('searchingCats', function(keyword){
    log(keyword.recherche);
    chercheChats = keyword.recherche;
    // chercheChats = '\"' + chercheChats + '\"';
    chercheChats = new RegExp(chercheChats, 'i');
    log(chercheChats);
    searchCats(chercheChats);
});


/********************************************* Ajout de ch'amis *********************************************/

//  Enregistrement de la demande d'ajout en ami :

socket.on('ajoutAmi', function(pseudoAmi){

    log(socket.pseudo);
    let statutAjout = 'pending';
    let dateAjout = new Date().toString();
    
    let objetMsgAjout = 'Entre-chats : ' + socket.pseudo + ' souhaite vous ajouter en ami';
    let msgAjout = 'Bonjour ' + pseudoAmi + ', <br/>' + socket.pseudo + ' t\'a demandé en ami. Connecte-toi pour valider sa demande. <br/>A bientôt sur <a href="http://entre-chats.herokuapp.com" target="_blank">Entre-chats</a>.';

    log(msgAjout);

    // Ajouter un ami en BDD

    // MongoClient.connect(url, { useNewUrlParser: true }, function(error,client){
    //     if(error){
    //         log(`Connexion à Mongo impossible! - log 5`);
    //     } else{
    //         log(`5 : on stocke le MP en bdd`);
    //         const db = client.db(dbName);
    //         const collection = db.collection('friends');
    //         collection.insertOne({demandeur: socket.pseudo, ami: pseudoAmi, statut: statutAjout, dateAjout: dateAjout});
    //     }
    //     client.close();
    // });

    MongoClient.connect(url, {useNewUrlParser: true}, function(error, client){
        if(error){
            log(`Connexion à Mongo impossible! - MP entre chats`);
            log(error);
            // throw error;
        } else{
            log(`1 : recherche du chat à ajouter en ami.`)
            log(`Connexion à MongoDB : OK - On va chercher le chat.`);
            const db = client.db(dbName);
            const collection = db.collection('users');
// collection.findOne({pseudo: dInfosJoueur.pseudo, pwd: dInfosJoueur.mdp}, function(error,datas){
// collection.findOne({pseudo: kittens[player].pseudo}, {projection:{pseudo:1, lastScore:1, bestScore:1, _id:0}}, function(error, datas){
            collection.findOne({"pseudo": pseudoAmi}, {projection:{pseudo:1, email: 1, _id:0}}, function(err,data){
                log(`On rentre dans la fonction de callback.`);
                if(err){
                    log(`2 - Erreur : Que se passe-t-il? ${err}`);
                } else{
                    log(`2 : A-t-on trouvé le chat?`);
                    let chatDest = data;
                    let chatDestMail = chatDest.email;
                    log(`Log 2.5 : Email à transmettre à Sendgrid ${chatDestMail}`);
                    client.close();
                    log('Infos récupérées : ', data);

                    // log(`Datas récupérées en base : ${resultatChats}`);

                    if(!data){
                        log(`3 : chat introuvable... Bizarre!`);
                        log(`Aucun chat ne correspond à votre recherche!`);
                        let message = 'Aucun chat ne correspond à votre recherche!';
                        socket.emit('noCat', message);

                    } else{
                        log(`4 : on stocke le MP en bdd`);

                        MongoClient.connect(url, { useNewUrlParser: true }, function(error,client){
                            if(error){
                                log(`Connexion à Mongo impossible! - log 5`);
                            } else{
                                log(`5 : on stocke le MP en bdd`);
                                const db = client.db(dbName);
                                const collection = db.collection('friends');
                                collection.insertOne({demandeur: socket.pseudo, ami: pseudoAmi, statut: statutAjout, dateDemande: dateAjout}, function(err, cb){
                                    if(err){
                                        log(`6`);
                                        log(err);
                                    } else{
                                        log(`7 : On envoie le MP par mail`);
                                        sendMail.sendPrivateMsg(chatDestMail, objetMsgAjout, msgAjout);
                                    }
                                });
                            }
                            client.close();
                        });                        
                    }
                }
            });
        }
    });
    
});


/********************************************* Vérification des demandes d'ajout en amis *********************************************/

// A vérifier quand l'utilisateur se connecte (vérif en bdd si demandes en "pending");


// socket.emit('demandeAmi', function(infos){

// }); 

// Mise à jour du statut de la demande d'ajout en ami : "validée" ou "rejetée"


/********************************************* Messages privés *********************************************/

socket.on('envoiMP', function(infos){
    log(infos);
    log(socket.pseudo);

    // let emetteurPseudo = socket.pseudo;
    let destinataire = infos.pour;
    let msg = infos.message;
    let dateMsg = new Date().toString();
    let objet = 'Entre-chats : Message privé de ' + socket.pseudo;

// On cherche l'email du destinataire en base

    MongoClient.connect(url, {useNewUrlParser: true}, function(error, client){
        if(error){
            log(`Connexion à Mongo impossible! - MP entre chats`);
            log(error);
            // throw error;
        } else{
            log(`1 : recherche du chat destinataire`)
            log(`Connexion à MongoDB : OK - On va chercher le chat.`);
            const db = client.db(dbName);
            const collection = db.collection('users');
            collection.findOne({"pseudo": infos.pour}, {projection:{pseudo:1, email: 1, _id:0}}, function(err,data){
                log(`On rentre dans la fonction de callback.`);
                if(err){
                    log(`2 - Erreur : Que se passe-t-il? ${err}`);
                } else{
                    log(`2 : A-t-on trouvé le chat?`);
                    let chatDest = data;
                    client.close();
                    log('Infos récupérées : ', data);

                    // log(`Datas récupérées en base : ${resultatChats}`);

                    if(!data){
                        log(`3 : chat introuvable... Bizarre!`);
                        log(`Aucun chat ne correspond à votre recherche!`);
                        let message = 'Aucun chat ne correspond à votre recherche!';
                        socket.emit('noCat', {msg: message});

                    } else{
                        log(`4 : On envoie le MP par mail`);
                        sendMail.sendPrivateMsg(chatDest.email, objet, msg);

                        log(`5 : on stocke le MP en bdd`);

                        MongoClient.connect(url, { useNewUrlParser: true }, function(error,client){
                            if(error){
                                log(`Connexion à Mongo impossible! - log 5`);
                            } else{
                                log(`5 : on stocke le MP en bdd`);
                                const db = client.db(dbName);
                                const collection = db.collection('privateMsg');
                                collection.insertOne({emetteur: socket.pseudo, destinatairePseudo: dInfosJoueur.mdp, destinataireEMail: chatDest.email , objet: objet, message: msg, dateMP: dateMsg});
                            }
                            client.close();
                        });
                    }
                }
            });
        }
    });
});

/*********************************** Déconnexion d'un utilisateur *******************************************/
// Déconnexion d'un utilisateur
    socket.on('disconnect', function(reason){
        log('Déconnexion : ', socket.id, reason);
        log('Joueur qui vient de se déconnecter : ', kittens[socket.id]);
        log(`Nombre de joueurs connectés (avant décrémentation si loggée) : ${nbPlayers}`);
        nbPlayers--;
        if(logged){
            // nbPlayers--;
            socket.broadcast.emit('decoCat', {pseudo: socket.pseudo, id: socket.playerId, key: storageKey});
            log(`Nombre de joueurs connectés (après une déconnexion loggée) : ${nbPlayers}`);
            delete kittens[socket.id];
        }
        // socket.broadcast.emit('decoPlayer', {pseudo: socket.pseudo, id: kittens[socket.id].identifiant});
        log(`Nombre de joueurs connectés (après une déconnexion loggée) : ${nbPlayers}`);

        if(nbPlayers === undefined || nbPlayers <= 0){
            log(`On est dans le "if" de la déconnexion`);
            nbPlayers = 0;
            // startGame = false;
            // attenteJoueur = true;
            // tour = 0;
            log(`En cas de -1 ou undefined, nbPlayers passe à 0 : ${nbPlayers}`);
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