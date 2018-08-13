var NodeWebcam = require('node-webcam')
const fs = require('fs');
const request = require('request');

var Webcam = NodeWebcam.create();

const captureImage = path => new Promise ((resolve, reject) => {
  Webcam.capture(path, (err, data) => {
      if (err) reject(err)
      else resolve(data);
  })
});

module.exports = {
  camModule : async function(){
    await captureImage('/root/image');

    
    const r = request.post('http://ec2-52-79-239-17.ap-northeast-2.compute.amazonaws.com:5000/test',(err, response, body) => {
      if (err) throw new Error(err);
      console.log(body);
    });
    const form = r.form();
    form.append('abc', fs.createReadStream('/root/image.jpg'), { filename: 'image.jpg' });
  
    
  }
};

