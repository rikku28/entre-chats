const router = require('express').Router();
const passport = require('passport');

// Auth login
router.get('/login', (req, res) =>{
    res.render('login', { user: req.user });
});

// Auth logout
router.get('/logout', (req, res) =>{
    // Ici, on gère avec passport.js : désérialisation?
    // res.send('Déconnexion');
    req.logout();
    res.redirect('/');
});

// Auth with Twitter
router.get('/twitter', passport.authenticate('twitter'));

// Route de Callback/redirection
router.get('/twitter/redirection', passport.authenticate('twitter', { successRedirect: '/',
failureRedirect: '/login' }));

module.exports = router;