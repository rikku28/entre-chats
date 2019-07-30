# entre-chats : Réseau social félin

URL du quiz : http://entre-chats.herokuapp.com/
Réseau social réalisé en javascript avec Node.js, Express JS, Socket.IO, MongoDB, Bootstrap et jQuery.

## Table of Contents

<!-- MarkdownTOC autolink=true bracket=round depth=2 -->
- [Concept du Projet](#Concept-du-Projet)
- [Arborescence du projet](#Arborescence-du-projet)
- [Installation](#installation)
- [Hébergement](#Hébergement)
<!-- - [Options](#options)
  - [Game_New-test options](#Game_New-test-options)
  - [http-proxy events](#http-proxy-events)
  - [http-proxy options](#http-proxy-options)
- [WebSocket](#websocket)
  - [External WebSocket upgrade](#external-websocket-upgrade)
  - [Changelog](#changelog) -->
- [License](#license)
- [Remerciements](#Remerciements)

## Concept du Projet

Ce réseau social est réalisé dans le cadre de la formation de développeur(se) fullstack JavaScript proposée par l'IFOCOP. Il s'agît de l'épreuve finale de la formation.

Ce projet consiste donc en la réalisation d'un réseau social de A à Z, même jusqu'à la gestion du projet. Le projet était à réaliser en parallèle du stage.

Les réseaux sociaux, ce n'est plus mon truc depuis quelques années déjà. Le projet n'est donc pas aussi motivant que les jeux qui étaient à réaliser lors des projets précédents.

Les réseaux sociaux ne me servent plus, principalement, qu'à suivre l'actualité en temps quasi réel des transports en commun qui animent mon quotidien, ainsi qu'à partager des photos de mes chats ou des félins du parc zoologique de Lumigny, où je vais me promener régulièrement. C'est pourquoi j'ai choisi une thématique féline.

Map du projet : [![](http://entre-chats.herokuapp.com/assets/img/Map-Reseau_social.png "Cartographie du projet de réseau social")](http://entre-chats.herokuapp.com/assets/img/Map-Reseau_social.png)


## Arborescence du projet

- **"entre-chats-server_v2.js"** : Ce fichier contient le code javascript qui constitue le serveur du site.

- **"config"** : Ce dossier contient un module et la liste des questions
    - **"check-login.js"** : module permettant de procéder à la vérification des infos de connexion (pseudo et pass non vide + adresse email + url de l'avatar valides)
    - **"envoi-mail.js"** : module permettant d'envoyer des emails via Sendgrid.
    - **"upload-img.js"** : module permettant de changer sa photo de profil avec Multer. => Dev. en stand-by.

- **"public"** : Dossier contenant le code front
    - **"index.html"** : page HTML du jeu

    - **"favicon.ico"** : favicon du jeu
    
    - **"assets"** : Dossier contenant les fichiers complémentaires
        - **"css"** : Dossier qui contient la feuille de style du jeu + les CSS de la librairie Bootstrap
        - **"style_entre-chats.css"** : Feuille de style du jeu
        - **"img"** : Dossier qui contient les images visibles sur la page, les indices et les icônes
            - **"about"** : Images affichées dans la section "À Propos"
            - **"backgrounds"** : Fonds pour <body> affichées dans la section "À Propos"
            - **"763689-kitty-avatars"** : Pack d'icônes
            - **"1818329-cat-avatars"** : Autre pack d'icônes
        - **"js"** : Dossier qui contient le code javascript client + les fichiers JS de la librairie Bootstrap
            - **"client.js"** : Ce fichier contient le code javascript exécuté côté front.
        - **"pdf"** : Dossier qui contient les fichiers pdf relatifs à l'app (en l'occurence, mon C.V.).

## Installation

Pour installer ce projet, il vous faut installer les modules Nodes.js suivants, dispos sur NPM:
- socket.io
- express
- mongodb
- @sendgrid/mail
- multer
- bcrypt
- node-pre-gyp
- nodemon (dev dependecie uniquement)

ou les installer directement à partir du fichier "package.json".

```javascript
$ npm install
```

## Hébergement

L'app est actuellement hébergée chez [Heroku](https://www.heroku.com/). J'ai utilisé leurs add-on gratuits [mLab](https://www.mlab.com/) pour créer ma base MongoDB et [sendgrid](https://app.sendgrid.com/) pour l'envoi d'emails.

## License

The MIT License (MIT)

Copyright (c) 2019 Amélie GAUDILLÈRE-MARTIN (aka rikku28)

## Remerciements

J'en profite pour remercier mes collègues, et principalement les équipes du Studio et Flux et Qualité, mais aussi la famille, les amis et les Foireuseries (Foireux un jour, Foireux toujours!), les Nobles et les Black Diamonds pour leur soutien. :D