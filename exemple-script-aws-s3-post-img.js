const config = require('../config');// importation config contenant les informations de connexion à aws s3
const AWS = require('aws-sdk');// importation aws pour accéder à new AWS.S3



function uploadToS3(file, imgName, mime) {// declaration fonction d'envoie img vers AWS S3 (execution fonction en bas)

    let s3bucket = new AWS.S3({ // instanciation objet aws s3 avec id et key de connexion
      accessKeyId: config[0], // config[0] = IAM_USER_KEY importer depuis le fichier config
      secretAccessKey: config[1],// config[1] = IAM_USER_SECRET importer depuis le fichier config
      Bucket: config[2] // config[2] = nom du bucket importer depuis le fichier config
    });
        var params = {
          Bucket: config[2], // parametre qui indique le nom du bucket
          Key: imgName, // parametre qui definie le key de l'img pour pouvoir la retrouver (nom apres renommage)
          Body: file.data, // parametre qui definie l'img
          ACL: 'public-read', // parametre qui autorise la lecture public permetant de lire l'url de l'img dans le front
          ContentType: mime // parametre qui definie le mimeType de l'img
        };
        s3bucket.upload(params, function (err, data) { // execution de l'envoie avec les paramettres definit
          if (err) {
            console.log('error in callback');//console.log erreur si erreur
            console.log(err);
          }
          console.log('success');//console.log success si succes
          console.log(data);
        }); 
  }


exports.createThing = (req,res,next)=>{ // middleweare node.js express pour créer un objet avec une img
    let mime = req.files.image.mimetype;
    let extension = req.files.image.mimetype.split('/');// capture de l'extension img en splitant le mimetype
    let imgName = req.files.image.name + Date.now() + '.' + extension[1];// definition d'un nom img unique

    uploadToS3(req.files.image, imgName, mime); // execution fonction d'envoie img vers AWS S3 (declaration fonction en ^haut^)

    const thingObject = JSON.parse(req.body.thing); //recuperation de l'objet passer en json
    delete thingObject._id; 
    const thing = new Thing({ //instanciation objet thing
        ...thingObject, //ajout des infos des inputs dans l'objet thing
        imageUrl: imgName //renommage img ( même non que celui envoyé à aws s3)
    });

     thing.save()  //envoie objet à bdd mango db
    .then(()=>res.status(201).json({thing})) //retour reponse si succes
    .catch(error => res.status(400).json({error}));//retour reponse si erreur
}