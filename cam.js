var NodeWebcam = require('node-webcam')
const fs = require('fs');
const request = require('request');
const { URL } = require('url');

var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }

var Webcam = NodeWebcam.create();

async function ttsCommand(msg) {
  var commandLine = 'python3.6 /root/tts.py ' + msg;
  await execPromise(commandLine);
}
  async function sttCommand(second) {
    var ttsCmd = "python3 /root/python-docs-samples/speech/cloud-client/quickstart.py";
    var recordCmd = "rec -c 1 -r 16000 /tmp/speech.wav trim 0 " + second;
    await execPromise(recordCmd);
    const stdout = await execPromise(ttsCmd);
    return stdout;
  }


const execPromise = str => {
  return new Promise ((resolve, reject) => {
    exec(str, (err, stdout, stderr) => {
      if(err) reject (err);
      else resolve(stdout);
  })
  })
};

const captureImage = path => new Promise ((resolve, reject) => {
  Webcam.capture(path, (err, data) => {
      if (err) reject(err)
      else resolve(data);
  })
});

const fileSend = (url, key, filepath, filename) =>
 new Promise((resolve, reject) => {
   const r = request.post(url, (err, response, body) => {
     if (err) reject(err);
     else resolve(body);
   });
   const form = r.form();
   form.append(key, fs.createReadStream(filepath), {
     filename
   });
 });

module.exports = {
  camModule : async function(){
    await captureImage('/root/image');

    result = await fileSend(
      'http://ec2-54-180-8-155.ap-northeast-2.compute.amazonaws.com:5000/image',
      'abc',
      '/root/image.jpg',
      'image.jpg'
     )
    
     await ttsCommand(result);
  },

  photoBookModule :async function(){
      await captureImage('/root/photobook');
      try{
        await fileSend(
          'http://ec2-54-180-8-155.ap-northeast-2.compute.amazonaws.com:5000/photobook',
          'abc',
          '/root/image.jpg',
          'image.jpg'
         )
        await ttsCommand("사진첩에 업로드되었습니다.");
      } catch(error){
        print(error.message);
        await ttsCommand("사진첩 업로드를 실패하였습니다.");
      }

    },

  objectCamModule : async function(){
    await ttsCommand("찾으려는 물건을 말씀하세요.");
    searchKeyword = await sttCommand('2');
    const FIND_URL = 'http://ec2-54-180-8-155.ap-northeast-2.compute.amazonaws.com:5000/findobject';
    const findObjectUrl = new URL(FIND_URL);
    const findOptions = {
      url: findObjectUrl.toString(),
      method: "GET",
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      form: {'object' : searchKeyword}
    };
    const objectNameResult = await request(findOptions);

    while(1){
      await captureImage('/root/imgae');
      result = await fileSend(
        'http://ec2-54-180-8-155.ap-northeast-2.compute.amazonaws.com:5000/findobject',
        'abc',
        '/root/image.jpg',
        'image.jpg'
       )
       console.log("filesend");
       console.log(result);
       if(result==0){
        continue;
       }else{
        await ttsCommand(result);
        break;
       }
    }
  }
};

