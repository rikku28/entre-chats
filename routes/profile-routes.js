const router = require('express').Router();

const authVerif = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else{
        next();
    }
};

router.get('/', authVerif, (req, res) => {
    // res.send('Vous êtes connectés sur votre page de profile : ' + req.user.username);
    res.render('profile', {user: req.user});
});

module.exports = router;