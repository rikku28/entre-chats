// https://github.com/niinpatel/nodejs-image-upload
// https://stackoverflow.com/questions/45154069/display-uploaded-image-with-multer
// https://code.tutsplus.com/tutorials/file-upload-with-multer-in-node--cms-32088
// Tuto Traversy Media : https://www.youtube.com/watch?v=9Qzmri1WaaE + https://github.com/bradtraversy/nodeuploads
// https://codeforgeek.com/file-uploads-using-node-js/
// https://stackoverflow.com/questions/31592726/how-to-store-a-file-with-file-extension-with-multer
// Sauvegarde dans Mongo? https://medium.com/@colinrlly/send-store-and-show-images-with-react-express-and-mongodb-592bc38a9ed
// 

console.log(`Bienvenue dans le module upload-img.js!`);
var exports = module.exports = {};

// const multer = require('multer');
// const upload = multer({dest: __dirname + '/uploads/images', preservePath: true});
// const path = require('path');

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: '../public/uploads/',
    filename: function(req, file, cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
});
// }).single('myImage');

// Check File Type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
};

console.log('Coucou');
console.log(__dirname);

app.post('/upload', upload.single('photo'), (req, res, next) => {
	console.log(req);
    if(req.file) {
        return json(req.file);
    }
    // else throw 'error';
	else{
		console.log('Il y a un problème quelque part');
	}
});
