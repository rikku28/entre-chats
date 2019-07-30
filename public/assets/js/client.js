/******************************************************************************************************************/
/****************************************** Entre-chats : côté client ********************************************/
/****************************************************************************************************************/
'use strict';

// IIFE
(function(window, io){
/***************************************** Event de chargement du DOM ******************************************/
    window.addEventListener('DOMContentLoaded', function(){

/************** Constante de raccourci pour "console.log" + déclaration des variables globales ***************/
        const log = console.log;
        var cats = [];
        var premiereConnexion = false;
// On déclare l'ip et le port auxquels le socket sera relié.
        var socket = io();

// Date et timestamp de la date du jour
        var dateJour = new Date();
        var timestamp=dateJour.getTime(dateJour);
        var zoneTxt = "";
        var pseudoMsg = "";
        // var pseudoAmi = "";

/******************************************* Actions côté client ********************************************/
        log('Coucou côté client');
// On masque toutes les balises sauf celles du formulaire de connexion.
        $('.cache-header').hide();
        $('.cache-login-form').hide();
        $('.cache-quiz').hide();
        $('.cache-menu').hide();
        $('.cache-infos-joueurs').hide(); // à la place de .fadeOut()

// Joueur déjà inscrit :
        $('#welcomeBack').click(function(e){ 
            // e.preventDefault();
            premiereConnexion = false;
            $('.msg-login-incorrect').remove();
            $('.cache-login-form').show();
            $('.champs-masques').hide();
            $('#btn-connexion').hide();
            // $('#btn-valider').show();
        });

// Inscription d'un nouveau joueur :
        $('#firstConnexion').click(function(e){
            // e.preventDefault();
            premiereConnexion = true;
            $('.msg-login-incorrect').remove();
            $('.cache-login-form').show();
            $('#btn-connexion').hide();
        });

// Formulaire de connnexion : Récupération, puis envoi des infos de connexion au serveur
    let loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(event){
        event.preventDefault();
        
        let raceSelec;
        $("select")
            .change(function () {
                $( "select option:selected" ).each(function() {
                    raceSelec = $(this).text();
                });
                log(raceSelec);
            })
            .change();

        // let genreSelec;
        // $("input:checkbox[name=genre]:checked").each(function() {
        //     genreSelec = $(this).val();
        //     log(genreSelec);
        // });

        log($( "input[type=radio][name=genre]:checked" ).val());
        // log($("input[name=genre]:checked").val());

        socket.emit('login', {
            firstLogin: premiereConnexion,
            pseudo : $('#login-form-pseudo').val(),
            mdp: $('#login-form-mdp').val(),
            email: $('#login-form-email').val(),
            img: $('#login-form-avatar').val(),
            race: raceSelec,
            genre: $( "input[type=radio][name=genre]:checked" ).val()
        });
    });

    // Evènements liés à la vérification en BDD des infos de connextion
    socket.on('badPseudo', function(info){
        log(`badPseudo`);
        $('#login-form').prepend('<p class="text-danger msg-login-incorrect" id="badPseudo"><strong>Votre mot de passe est vide ou invalide.</strong></p>');
    });

    socket.on('alreadyUsedPseudo', function(info){
        log(`alreadyUsedPseudo`);
        $('#msg-erreur').prepend('<p class="text-warning msg-login-incorrect" id="alreadyUsedPseudo"><strong>' + info.msg + '</strong></p>');
    });

    socket.on('badPwd', function(info){
        // log(`badPwd`);
        $('#msg-erreur').prepend('<p class="text-danger msg-login-incorrect" id="badPwd"><strong>' + info.msg + '</strong></p>');
    });

    socket.on('badAvatar', function(info){
        // log(`badAvatar`);
        $('#msg-erreur').prepend('<p class="text-danger msg-login-incorrect" id="badAvatar"><strong>' + info.msg + '</strong></p>');
    });

    socket.on('badMail', function(info){
        // log(`badAvatar`);
        $('#msg-erreur').prepend('<p class="text-danger msg-login-incorrect" id="badAvatar"><strong>' + info.msg + '</strong></p>');
    });

    socket.on('badInfos', function(info){
        // log(`badInfos`);
        $('#msg-erreur').prepend('<p class="text-danger msg-login-incorrect" id="badInfos"><strong>' + info.msg + '</strong></p>');
    });

    socket.on('userUnknown', function(info){
        // log(`userUnknown`);
        $('#msg-erreur').prepend('<p class="text-danger msg-login-incorrect" id="userUnknown"><strong> Chat introuvable. Veuillez vous connecter avec les bons identifiants, ou vous inscrire si c\'est la 1ère fois que vous venez sur entre-chats.</strong></p>');
        $('.cache-login-form').hide();
        $('#btn-connexion').fadeIn();
    });

// Nouveau joueur connecté
    socket.on('loginOK', function(infos){
        // log(`Pseudo transmis au chat connecté : ${infos}`);
        log(infos);
        localStorage.setItem(infos.key, infos.item);
        $('#login-form').remove();
        $('.msg-login-incorrect').remove();
        $('.cache-header').fadeIn();
        $('.cache-infos-joueurs').show();
        $('#welcome').html('<h1 style="font-size: 3em">Bienvenue ' + infos.pseudo + ' <img src="' + infos.avatar + '" width="75px"/></h1>');
        $('.cache-menu').show();
        cats.push(infos.pseudo);
        log(cats);
    });

    socket.on('newCat', function(infos){
        // log('Pseudo transmis aux autres joueurs', infos);
        $('#zone-infos').prepend('<p><em> ' + infos.pseudo + ' a rejoint la partie !</em></p>');
    });

// Affichage des joueurs en ligne
    socket.on('onlinePlayers', function(infos){
        $('#online-scores').empty();
        // log('Joueurs en ligne', infos);
        for (var player in infos){
            $('#online-scores').append('<p class="infos-joueurs" id="' + infos[player].identifiant + '"><img src="' + infos[player].avatar + '" class="rounded" width="50px"/> ' + infos[player].pseudo + '</p>');
        }
    });
    
// Déconnexion d'un joueur
    socket.on('decoCat', function(infos){
        // log('Joueur déconnecté : ', infos);
        localStorage.removeItem(infos.key);
        $('#zone-infos').prepend('<p><em>' + infos.pseudo + ' s\'est déconnecté !</em></p>');
        let balPlayerDis = document.getElementById(infos.id);
        $(balPlayerDis).remove();
    });

// Echange de messages
    $('#chat-form').submit(function(e){
        e.preventDefault();
        var message = $('#chat-message').val();
        socket.emit('chatMsg', message); // Transmet le message au serveur
        $('#chat-message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    });

    socket.on('afficheChatMsg', function(msg){
        $('#zone-infos').prepend('<p><strong>' + msg.pseudo + '</strong> : ' + msg.msg + '</p>');
    });

/********************************************* Ajout de ch'amis *********************************************/

    let addFriend = function(pseudoAmi){
// Envoi du pseudo pour la demande d'ajout en ami.
        // pseudoAmi = pseudoDeLAmi;
        log(pseudoAmi);
        socket.emit('ajoutAmi', pseudoAmi);
    };

// Voir les demandes d'amis reçues

    // socket.on('demandeAmi', function(infos){

    // }); 

/********************************************* Messages privés *********************************************/

    let sendMail = function(pseudoDest){
    // Afficher fenêtre avec text area pour saisie message.
        pseudoMsg = pseudoDest;

        let idBtn="btn-msg-" + pseudoDest;
        let balTextArea = document.getElementById(id);
        log(balTextArea);

        zoneTxt = balTextArea;

        $('#' + balTextArea).after('<div class="container"><form id="txt-mp"><div class="form-group"><label for="saisieMsgPrive">Saisissez votre message</label><textarea class="form-control" id="saisieMsgPrive" placeholder="Saisissez votre message pour ' + pseudoDest + '" rows="3"></textarea></div><button type="submit" class="btn btn-primary mb-2">Confirm identity</button></form></div>');

        // Sinon tester : balTextArea.after(); ou comme dans le jeu-cv
    };

    $('#txt-mp').submit(function(e){
        e.preventDefault();
        var msg = $('#saisieMsgPrive').val();
        log(msg);

        let infos = {
            pour: pseudoMsg,
            message: msg
        };

        socket.emit('envoiMP', infos); // Transmet le message au serveur
        $('zoneTxt').remove;
        // $('#chat-message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    });

/********************************************* Recherche de chats *********************************************/
    let searchCats = document.getElementById('search-bar');
    searchCats.addEventListener('submit', function(event){
        event.preventDefault();
        log('Le mot-clé envoyé est : ' + $('#searching-cats').val());

        socket.emit('searchingCats', {
            recherche : $('#searching-cats').val()
        });
    });

    socket.on('catList', function(liste){
        log(liste);
        log(`On est dans le résultat de la recherche de chats.`);
        $('#res-search-cats').empty();

        let listeChats = liste;
        // let listeChats = [];

        // for(var key in liste){
        //     listeChats.push(liste[key]);
        // };

        log(listeChats);

// Affichage de la liste de résultats + ajout des boutons permettant d'ajouter un chat en ami ou de lui envoyer un message

// Avec onclick
        $.each(listeChats, function(index, value) {
            log(index + ' ' + value);
            // $('#res-search-cats').append('<div><img src="' + listeChats[index].avatar + '" class="rounded" width="40px"/><button type="button" class="btn btn-primary ajout-ami" value="' + listeChats[index].pseudo + '" id="btn-add-' + listeChats[index].pseudo + '" value="' + listeChats[index].pseudo + '" onClick="addFriend(listeChats[index].pseudo);">Ajouter ' + listeChats[index].pseudo + ' en ami</button><button type="button" class="btn btn-warning envoi-msg" value="' + listeChats[index].pseudo + '" id="btn-msg-' + listeChats[index].pseudo + '" value="' + listeChats[index].pseudo + '" onClick="sendMail(listeChats[index].pseudo);">Envoyer un mail à ' + listeChats[index].pseudo + '</button></div>');
            $('#res-search-cats').append('<p class="col-md-5 offset-md-1" id="end-' + listeChats[index].pseudo + '"><img src="' + listeChats[index].avatar + '" class="rounded" width="40px"/> ' + listeChats[index].pseudo + '</p>');
        });
    });

// 

        // $.each(listeChats, function(index, value) {
        //     log(index + ' ' + value);
        //     $('#res-search-cats').append('<p class="fin-partie col-md-5 offset-md-1" id="chat-' + listeChats[index].pseudo + '"><img src="' + listeChats[index].avatar + '" class="rounded" width="40px"/> ' + listeChats[index].pseudo + ' <input type="button" class="btn btn-primary ajout-ami" value="' + listeChats[index].pseudo + '" id="btn-add-' + listeChats[index].pseudo + '">Ajout ami</input></p>');
        // });
        // $('#res-search-cats').prepend('<p><strong>' + msg.pseudo + '</strong> : ' + msg.msg + '</p>');
        // Afficher la liste sous forme de "card" Bootstrap avec bouton pour ajout en ami.

/******************************************* Fin de partie ********************************************/
    socket.on('endGame', function(infos){
        $('#zone-infos').prepend('<p><strong><em>Fin de partie</em></strong></p>');
        log(infos);
        $('.cache-quiz').hide();
        // startGame = false;

        let tabPlayers = [];
        for(var key in infos){
            tabPlayers.push(infos[key]);
        };

        // log(tabPlayers);
        tabPlayers.sort(function(a, b){
            return b.score - a.score
        });
      
        // log(tabPlayers);
        $('#online-scores').empty();

        $('#zone-infos').prepend('<p class="text-warning bg-primary"><strong> Félicitations ' + tabPlayers[0].pseudo + '. Vous remportez la partie.</strong></p>');

        $.each(tabPlayers, function(index, value) {
            log(index + ' ' + value);
            log('Pseudo : ' + tabPlayers[index].pseudo);

            $('#online-scores').append('<p class="fin-partie" id="end-' + tabPlayers[index].identifiant + '"><img src="' + tabPlayers[index].avatar + '" class="rounded" width="50px"/> ' + tabPlayers[index].pseudo + ' - Score : <span class="score">' + tabPlayers[index].score + '</span></p>');
        });
    });

/******************************************* Affichage du classement général ********************************************/
    socket.on('classement', function(infos){
        log(`On est dans le classement des joueurs.`);
        // let tabRanking = Object.entries(infos);
        let tabRanking = infos;
        log(tabRanking);
        $('#all-best-scores').empty();
        
        $.each(tabRanking, function(index, value) {
            log(index + ' ' + value);
            $('#all-best-scores').append('<p class="fin-partie col-md-5 offset-md-1" id="end-' + tabRanking[index].identifiant + '"><img src="' + tabRanking[index].avatar + '" class="rounded" width="40px"/> ' + tabRanking[index].pseudo + ' - Score : <span class="score">' + tabRanking[index].bestScore + '</span></p>');
        });
    });
    
/***********************************************************************/
/******************** Affichage de la date du jour ********************/
/*********************************************************************/
    (function today(){
    // IIFE qui affiche la date dans le footer, pour le fun. Création de tableaux pour récupérer les mois et jours sous forme textuels. Vu que ces données ne changement pas, je les ai déclaré en constantes.
            let todayP = document.getElementById('date-jour');
            let numeroJour = dateJour.getDate(); 
            let indexJour = dateJour.getDay();   // getDay() va de 0 à  6, 0 correspondant à  Dimanche et 6 à  samedi. 
            const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']; 
            let indexMois = dateJour.getMonth();   // getMonth() va de 0 à  11, 0 correspondant au mois de Janvier et 11 au mois de Décembre. 
            const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    // let jour = jours[indexJour] + ' ' + numeroJour + ' ' + mois[indexMois] + ' ' + annee; 
            // console.log(jour); 
            let txtDate = document.createTextNode('Nous sommes le ' + jours[indexJour] + ' ' + numeroJour + ' ' + mois[indexMois] + ' ' + dateJour.getFullYear());
            todayP.appendChild(txtDate);
        })();
    });
})(window, io);