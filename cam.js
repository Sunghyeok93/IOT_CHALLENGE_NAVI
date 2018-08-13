var NodeWebcam = require('node-webcam')


//Creates webcam instance
var Webcam = NodeWebcam.create();

const captureImage = path => new Promise ((resolve, reject) => {
  Webcam.capture(path, (err, data) => {
      if (err) reject(err)
      else resolve(data);
  })
});

module.exports = captureImage;