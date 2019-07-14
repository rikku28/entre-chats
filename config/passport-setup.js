// Fichier de configuration de passport.js
// https://console.developers.google.com/apis/credentials
// Suite à la disparition de Google+ : https://developers.google.com/identity/sign-in/web/sign-in#before_you_begin

// https://github.com/jaredhanson/passport-google-oauth/issues/76
// https://stackoverflow.com/questions/51226112/error-at-strategy-oauth2strategy-parseerrorresponse-nodejs-passport-google-oau


const passport = require('passport');
const PassportGoogleStrategy = require('passport-google-oauth20').Strategy;
// const PassportGoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');
// const mongoose = require('mongoose');
// const User = mongoose.model('users');

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) =>{
        done(null, user.id)
    });
});

passport.use(new TwitterStrategy({
    consumerKey: keys.twitter.consumerKey,
    consumerSecret: keys.twitter.consumerSecret,
    callbackURL: "http://www.example.com/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    console.log('La fonction de callback Twitter de Passport.js est déclenchée !');
    console.log(profile);
    console.log(accessToken);
    console.log(refreshToken);
    
    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
  }
));

passport.use(
    new PassportGoogleStrategy({
    // Options pour définir la stratégie de connexion via Google
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: 'http://localhost:3333/auth/google/redirection',
        // callbackURL: 'auth/google/redirection'
        // proxy: true
    },
    async function(accessToken, refreshToken, profile, done){
        // Fonction de callback
        console.log('La fonction de callback Google de Passport.js est déclenchée !');
        console.log(profile);
        console.log(accessToken);
        console.log(refreshToken);

        const theUser = await User.findOne({googleId: profile.id});

        if(theUser){
            console.log('L\'utilisateur est : ' + currentUser);
            done(null, theUser);
        } else {
            const newUser = await new User({
                username: profile.displayName,
                googleId: profile.id,
                thumbnail: profile._json.image.url,
                strategy: "google"
            }).save();
            console.log('Nouvel utilisateur créé : ' + newUser);
            done(null, newUser); //callback to let passport know that we are done processing
        }

        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                console.log('L\'utilisateur est : ' + currentUser);
                done(null, currentUser);
            } else{
                const newUser = new User({
                    username: profile.displayName,
                    googleId: profile.id,
                    thumbnail: profile._json.image.url,
                    strategy: "google"
                });
                newUser.save()
                .then(() => {
                    console.log('Nouvel utilisateur créé : ' + newUser);
                    done(null, newUser); //callback to let passport know that we are done processing
                });
            }
        });
    })
);