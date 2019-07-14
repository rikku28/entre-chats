// https://www.youtube.com/watch?v=7UEyJH7ak1M&list=PL4cUxeGkcC9jdm7QX143aMLAqyM-jTZ2x&index=3

const express = require('express');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/auth-routes');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const passport = require('passport');

// require('./models/User');

const app = express();

//Set up view engine
app.set('view engine', 'ejs');

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

//Initialisation de passport

app.use(passport.initialize());
app.use(passport.session());

// Connexion à MongoDB via Mongoose
mongoose.connect(keys.mongodb.dbURI, { useNewUrlParser: true }, () =>{
    console.log(`Nous sommes connectés à MongoDB !`);
});

//Set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// Route vers la page d'accueil
app.get('/', (req, res)=>{
    res.render('home', {user: req.user});
});




app.listen(3333, () =>{
    console.log('On écoute sur le port 3333');
});