/*****************************************************************************************************************/
/******************************************** Script côté serveur ***********************************************/
/***************************************************************************************************************/
'use strict';

/********************** Configuration des modules "path" et "fs" (file system) de Node.JS **********************/
const path = require('path');
const fileSys = require('fs');

/********************* Configuration du module "http" avec Express JS, en plus de Node.JS *********************/
const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
app.use(express.static('public'));
// app.use('/public', express.static(__dirname + '/public'));
// app.use('/assets', express.static(__dirname + '/public/assets'));

/************************** Ajout du module Node de socket.io + config du port HTTP **************************/
const socketIo = require('socket.io');
const port = 3333;

/************************************* Données pour server.js : Modularisation de la vérification des identifants du joueur qui se connecte *************************************/
// console.log('Dirname : ' + __dirname);
const checkLogin = require('./config/check-login.js');

/************************************* Configuration du module MongoDB *************************************/
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = process.env.MONGODB_URI;
// const url = 'mongodb://localhost:27017';
const dbName = 'heroku_rm2b81xl';
// const dbName = 'jeuBackEnd';

/************* Constante de raccourci pour "console.log" + déclaration des variables globales **************/
const log = console.log;
var logged = false;
var players = {};
var nbPlayers = 0;
var startGame = false;
var tour = 0;
var tourMax = 25;
var listeQuestions;
var infosJoueursBDD;
var attenteJoueur = true;
var finPartie = false;
var bestScores = [];

/********************************** Création du serveur HTTP avec Express **********************************/
app.get('/', function(req, res, next){
    // log(req);
    console.log('Dirname : ' + __dirname);
    // console.log('Filename : ' + __filename);
    // console.log(`Current directory: ${process.cwd()}`);
    // console.log('process.arg : ' + process.argv);
    let htmlFile = path.normalize(__dirname + '/public/index-projet-back.html');
    log(htmlFile);

    //Doc Express pour le traitement des erreurs : https://expressjs.com/fr/guide/error-handling.html
    res.sendFile(htmlFile);
});

/**************************** On rattache le serveur HTTP à socket.io ************************************/
const io = socketIo(httpServer);
// log(io);

// Cheatsheet : 
    // io.emit => On envoie le message / les infos à tout le monde.
    // socket.emit => On envoie le message / les infos au joueur correspond.
    // socket.broadcast.emit => On envoie le message / les infos à tous les joueurs, sauf celui correspondant à la "socket".

/**************************** Récupération des questions du quiz dans la BDD ****************************/
MongoClient.connect(url,{ useNewUrlParser: true },function(error,client) {
    if(error){
        console.log(`Connexion à Mongo impossible!`);
    } else{
        const db = client.db(dbName);
        const collection = db.collection('questions');
        collection.find({}).limit(tourMax).toArray(function(error,datas){
            if(error){
                log(`Impossible de récupérer la liste de questions.`);
            } else{
                log('Nombre de questions : ', datas.length);
                log('Il y a ' + datas.length + ' questions récupérées en BDD.');
                listeQuestions = datas;
                // log(datas);
                tourMax = datas.length;
                // log(listeQuestions);
                // res.render('utilisateurs', {title:'Liste des utilisateurs en base', liste: datas});
            }
            client.close();
        });
    }
});

/**************************** Récupération des meilleurs scores des joueurs ****************************/

// let recupBestScores = function(){
    MongoClient.connect(url,{ useNewUrlParser: true },function(error,client) {
        if(error){
            console.log(`Connexion à Mongo impossible!`);
        } else{
            const db = client.db(dbName);
            const collection = db.collection('users');
            collection.find({}, {projection:{pseudo:1, avatar: 1, lastScore:1, bestScore:1, _id:0}}).sort({bestScore: -1, lastScore: -1}).toArray(function(error,datas){
                if(error){
                    log(`Impossible de récupérer la liste des meilleurs scores.`);
                } else{
                    // log(datas);
                    bestScores = datas;
                    log('Nombre de scores récupérés : ' + bestScores.length);
                    // socket.emit('classement', bestScores);
                }
                client.close();
            });
        }
    });
// };

// recupBestScores();

/************************************** Création de joueurs **********************************************/
var Player = function(pseudo, pwd, urlImg, socketId){
    this.dateCrea = Date.now();
    this.pseudo = pseudo;
    this.identifiant = this.pseudo + this.dateCrea;
    this.password = pwd;
    this.score = 0;
    this.avatar = urlImg;
    this.socketId = socketId;
};

/*********************************** On établie la connexion socket.io *******************************************/
io.on('connection', function(socket){
    // log(socket);
    log('Coucou depuis le serveur!');
    log(`Nombre de joueurs connectés : ${nbPlayers}`);
    // log('Connexion - players contient :' + players.length + ' objets.');  // Renvoi "undefined"
    log('Avec object.keys : ' + Object.keys(players).length);
    if(!startGame && (Object.keys(players).length > nbPlayers)){
        nbPlayers = players.length;
        log(nbPlayers);
        checkNbPlayers();
    }
    log(`Nombre de joueurs connectés (après nouvelle connexion): ${nbPlayers}`);

/*********************************** Vérification du nombre de joueur *******************************************/
    var checkNbPlayers = function(){
        log(`(checkNbPlayers) Le jeu est-il en cours? ${startGame}`);
        log(`Nombre de joueurs connectés (checkNbPlayers): ${nbPlayers}`);
        let playersLength = Object.keys(players).length;
        log('Avec object.keys - checkNbPlayers contient : ' + Object.keys(players).length + ' entrées');

        if(nbPlayers < playersLength){
            nbPlayers = playersLength;
            log(`nbPlayers plus petit que players, on repasse nbPlayers à : ${nbPlayers}`);
        }

        if(nbPlayers >= 2 && tour === 0 && !startGame){
            for (var player in players){
                players[player].score = 0;
            };

            attenteJoueur = false;
            startGame = true;

            // players[socket.id].score = 0;
            log('Nb de questions : ' + listeQuestions.length);
            listeQuestions[tour].tour = tour;
            log('Question en cour : ', listeQuestions[tour]);
            io.emit('startGame', listeQuestions[tour]);
        } else{
            io.emit('attenteJoueur');
        }
    };
    

/*********************************** Fin de partie : actuellement géré côté front *******************************************/
var classement = function(){
    let tabPlayers = Object.entries(players);

    tabPlayers.sort(function(a, b){
        return b.score - a.score
    });
    log(tabPlayers);

    var rank = 1;
    for (var i = 0; i < tabPlayers.length; i++) {
      if (i > 0 && tabPlayers[i].score < tabPlayers[i - 1].score) {
          rank++;
      }
      tabPlayers[i].rank = rank;
    };

    log(tabPlayers);

    io.emit('ranking', tabPlayers);
};

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
    log(`Le jeu est-il en cours? ${startGame}`);

    socket.on('login', function(infosUser){
        socket.emit('classement', bestScores);

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
        checkVerifs(checkPseudo, checkPwd, checkUrl, infosUser);

        checkNbPlayers();
    });

/*********************************** Echange de messages entre joueurs *******************************************/
    socket.on('chatMsg', function (message){
        log('Pseudo : ', players[socket.id].pseudo);
        log(message);
        message = message;
        // log(players);
        io.emit('afficheChatMsg',  {pseudo: players[socket.id].pseudo, msg: message});
    });

/*********************************** Echange de messages entre joueurs *******************************************/
    socket.on('restart-game', function (message){
        checkNbPlayers();
        io.emit('onlinePlayers', players);
    });

/*********************************** Vérification de la réponse sélectionnée *******************************************/
    var checkAnswer = function(answer){
        // let rep = answer.toLowerCase();
        let repOK = listeQuestions[tour].bonneRep;
        let repOk2 = listeQuestions[tour].reponses[repOK];
        let repString = (repOk2).toString();
        log('Réponse BDD - convertie en chaîne de caractère : ' + repString + ' ' + typeof repString);
        log('Réponse reçue ', answer, typeof answer);
        // log(socket);
        if(answer == repString){
        // if(answer == repOk2){
            log('Bonne réponse!');
            players[socket.id].score++;
            
            log(`Score du joueur ${players[socket.id].pseudo} : ${players[socket.id].score}`);
            MongoClient.connect(url,{ useNewUrlParser: true },function(error,client){
                if(error){
                    log(`Connexion à Mongo impossible!`);
                    log(error);
                    // throw error;
                } else{
                    log(`On est dans le "else" de la connextion Mongo de la fonction "checkAnswer".`);
                    let myScore = players[socket.id].score;
                    const db = client.db(dbName);
                    const collection = db.collection('users');
                    collection.updateOne({pseudo: players[socket.id].pseudo},
                    {$set: {lastScore: myScore}});
                    log(`Dernier score + meilleur score du joueur mis à jour. ${myScore}`);
                    client.close();
                }
            });

            // log(players[socket.id]);
            io.emit('bravo', {
                id: socket.playerId,
                pseudo: socket.pseudo,
                score: players[socket.id].score,
                img : players[socket.id].avatar,
                msg: 'Bonne réponse!'
            });
            return true;
        } else{
            log('Mauvaise réponse!');
            let indice = listeQuestions[tour].indiceTxt;
            socket.emit('dommage', {
                id: socket.playerId,
                pseudo: socket.pseudo,
                indiceTxt : indice,
                msg: 'Mauvaise réponse! :( Veuillez sélectionner une autre réponse.'
            });
            return false;
        }
    };

socket.on('answer', function(reponse){
    if(checkAnswer(reponse)){
        nextQuestion();
    }
});

/*********************************** Question suivante *******************************************/
    var nextQuestion = function(){
        tour++;
        log(`Tour n° ${tour} vs ${tourMax} questions MAX!`);

// Si fin de partie, on met à jour les meilleurs scores en base et émet un message pour que le client les affiche
        if(tour === tourMax){
            startGame = false;
            tour = 0;

            io.emit('endGame', players);

                MongoClient.connect(url,{ useNewUrlParser: true },function(error,client){
                    if(error){
                        log(`Connexion à Mongo impossible!`);
                        log(error);
                        // throw error;
                    } else{
                        log(`On est dans le "else" de la fonction "nextQuestion".`);
                        const db = client.db(dbName);
                        const collection = db.collection('users');

                        let iPlayer = 0;
                        for(var player in players){
                            log(players[player].pseudo + ' ' + iPlayer);

                            let myScore = players[player].score;

                        collection.findOne({pseudo: players[player].pseudo}, {projection:{pseudo:1, lastScore:1, bestScore:1, _id:0}}, function(error, datas){
                            log('Fin de partie : On cherche les données du joueur en BDD.')
                            log(datas);
                            if(error){
                                log(`Que se passe-t-il? ${error}`);
                                log(error);
                                // throw error;
                            } else{
                                log('Meilleur score du joueur, avant màj : ' + datas.bestScore);
                                if(myScore > datas.bestScore){
                                    collection.updateOne({pseudo: players[player].pseudo},
                                    {$set: {lastScore: myScore, bestScore: myScore}}, function(error, datas){
                                        if(error){
                                            log(`Tiens, y aurait-il un problème? ${error}`);
                                            log(error);
                                            // throw error;
                                        } else{
                                            log(`Dernier score + meilleur score du joueur mis à jour. ${myScore}`);
                                                collection.find({}, {projection:{pseudo:1, avatar: 1, lastScore:1, bestScore:1, _id:0}}).sort({bestScore: -1, lastScore: -1}).toArray(function(error,datas){
                                                    if(error){
                                                        log(`Impossible de récupérer la liste des meilleurs scores.`);
                                                        log(error);
                                                        // throw error;
                                                    } else{
                                                        log(datas);
                                                        bestScores = datas;
                                                        log('Nombre de scores récupérés : ' + bestScores.length);
                                                        io.emit('classement', bestScores);
                                                        iPlayer++;
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        };
                    }
                });
        } else{
            log(`Tour n° ${tour}`);
            listeQuestions[tour].tour = tour;
            // log('Question en cour : ', listeQuestions[tour]);
            io.emit('nextQuestion', listeQuestions[tour]);
        }
    };

/*********************************** Déconnexion d'un utilisateur *******************************************/
// Déconnexion d'un utilisateur
    socket.on('disconnect', function(reason){
        log('Déconnexion : ', socket.id, reason);
        log('Joueur qui vient de se déconnecter : ', players[socket.id]);
        log(`Nombre de joueurs connectés (avant décrémentation si loggée) : ${nbPlayers}`);
        nbPlayers--;
        if(logged){
            // nbPlayers--;
            socket.broadcast.emit('decoPlayer', {pseudo: socket.pseudo, id: socket.playerId});
            log(`Nombre de joueurs connectés (après une déconnexion loggée) : ${nbPlayers}`);
            delete players[socket.id];
        }
        // socket.broadcast.emit('decoPlayer', {pseudo: socket.pseudo, id: players[socket.id].identifiant});
        log(`Nombre de joueurs connectés (après une déconnexion loggée) : ${nbPlayers}`);

        if(nbPlayers === undefined || nbPlayers <= 0){
            log(`On est dans le "if" de la déconnexion`);
            nbPlayers = 0;
            startGame = false;
            attenteJoueur = true;
            tour = 0;
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