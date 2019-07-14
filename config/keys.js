// Ajouter ce fichier à .gitgnore !!!
// Sinon, indiquer les données en tant que variables d'environnement sur l'hébergeur!

module.exports = {
    twitter:{
        consumerKey: process.env.TWITTER_KEY,
        consumerSecret: process.env.TWITTER_SECRET
    },
    mongodb:{
        // dbURI:"mongodb+srv://rikku28:montest@cluster0-iylji.mongodb.net/test?retryWrites=true&w=majority"
        dbURI:process.env.MONGODB_URI
    },
    session:{
        cookieKey: process.env.COOKIE_KEY
    }
}