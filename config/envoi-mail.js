/************************************* A mettre dans "server.js" : Modularisation de la vérification des identifants du joueur qui se connecte *************************************/
// console.log('Dirname : ' + __dirname);
// const checkLogin = require('./config/envoi-mail.js');

/************************************************** Données pour le module "envoi-mail.js" : Modularisation de l'envoi de mails **************************************************/

'use strict';

// entre-chats : ...
// Entre-Chats2 : ...
// Create an environment variable
// Update your development environment with your SENDGRID_API_KEY. Run the following in your shell:
// echo "export SENDGRID_API_KEY='...'" > sendgrid.env
// echo "sendgrid.env" >> .gitignore
// source ./sendgrid.env

// Install the package
// The following recommended installation requires npm. If you are unfamiliar with npm, see the npm docs. Npm comes installed with Node.js since node version 0.8.x, therefore you likely already have it:
// npm install --save @sendgrid/mail
// Send your first email
// The following is the minimum needed code to send an email:

// // using Twilio SendGrid's v3 Node.js Library
// // https://github.com/sendgrid/sendgrid-nodejs
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: 'test@example.com',
//   from: 'test@example.com',
//   subject: 'Sending with Twilio SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
// sgMail.send(msg);

// Implement and run the code above. If that runs without error, click “Next” and we’ll check to see if your email came through SendGrid.

console.log(`Bienvenue dans le module envoi-mail.js!`);
var exports = module.exports = {};
const sgMail = require('@sendgrid/mail');
const apiKey = process.env.SENDGRID_API_KEY;
const cciMail = process.env.SENDGRID_CCI_EMAIL;
const fromMail = process.env.SENDGRID_FROM_EMAIL;

sgMail.setApiKey(apiKey);
// Raccourci : sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendPrivateMsg = function(pour, objet, msg){
    console.log(`Bienvenue dans le module envoi-mail.js!`);

    let leMail = {
        to: pour,
        bcc: cciMail,
        from: fromMail,
        subject: objet,
        // text: 'Envoi avec Node.js',
        html: msg
    };

    console.log(leMail);

    sgMail.send(leMail).then(() => {
        console.log('Le mail a été envoyé');
    }).catch((error) => {
        console.log(error.response.statusCode);
        console.log('error sendgrid', error);
    });
}

// A tester si nouvelle erreur :
// sgMail.send(msg).then(() => {
//     console.log('Le message a été envoyé');
// }).catch((error) => {
//     console.log('error', error);
// });

// const msg = {
//     to: 'ladresse@dudestinataire.fr',
//     bcc: cciMail,
//     from: fromMail,
//     subject: 'Nouveau test d\'envoi de mail avec Sendgrid',
//     // text: 'Envoi avec Node.js',
//     html: 'Youhouuuuuuuuuuuuu!!! This is working! <br/><strong>and easy to do anywhere, even with Node.js</strong> <br/> Tuto : https://www.youtube.com/watch?v=s2bzUzHeSVw',
// };
// sgMail.send(msg);