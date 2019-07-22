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
        // var premiereConnexion = false;
// On déclare l'ip et le port auxquels le socket sera relié.
        var socket = io('/tchat');

// Date et timestamp de la date du jour
        var dateJour = new Date();
        var timestamp=dateJour.getTime(dateJour);

/******************************************* Actions côté client ********************************************/
        log('Coucou depuis le tchat');

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

// Affichage des joueurs en ligne
socket.on('onlinePlayers', function(infos){
    $('#online-scores').empty();
    // log('Joueurs en ligne', infos);
    for (var player in infos){
        $('#online-scores').append('<p class="infos-joueurs" id="' + infos[player].identifiant + '"><img src="' + infos[player].avatar + '" class="rounded" width="50px"/> ' + infos[player].pseudo + '</p>');
    }
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