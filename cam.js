var NodeWebcam = require('node-webcam')
const fs = require('fs');
const request = require('request');
const url = require('url');
const { URL } = url;

const {baseURL} = require('./baseURL');

var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }

 
var opts = {
    width: 800,
    height: 600,
    quality: 100,

    delay: 0,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location",
    verbose: false
};

var Webcam = NodeWebcam.create(opts);

async function ttsCommand(msg) {
  var commandLine = 'python3 /root/tts.py ' + msg;
  await execPromise(commandLine);
}
  async function sttCommand(second) {
    var ttsCmd = "python3 /root/python-docs-samples/speech/cloud-client/quickstart.py";
    var recordCmd = "rec -c 1 -r 16000 /tmp/speech.wav trim 0 " + second;
    await execPromise(recordCmd);
    const stdout = await execPromise(ttsCmd);
    return stdout;
  }
async function soundCommand(filename){
  var commandLine = 'mpg321 ~/sound/'+filename;
  await execPromise(commandLine);
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
      url.resolve(baseURL, '/image'),
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
          url.resolve(baseURL, '/photobook'),
          'abc',
          '/root/image.jpg',
          'image.jpg'
         )
        await soundCommand("photoSuccess.mp3");
      } catch(error){
        print(error.message);
        await soundCommand("photofail.mp3");
      }

    },

  objectCamModule : async function(){
    await soundCommand("sayObject.mp3");
    searchKeyword = await sttCommand('2');
    console.log(searchKeyword);
    searchKeyword = searchKeyword.replace('\n', '');
    await ttsCommand(searchKeyword + " 맞습니까?");
    destinationCheck = await sttCommand('2');
    console.log(destinationCheck);
    if(destinationCheck.indexOf("아니오")>-1||destinationCheck.indexOf("아니요")>-1){
      return; ///거절 시 프로그램 종료
    }
    console.log("searchKeyword : " + searchKeyword);
    const FIND_URL = url.resolve(baseURL, '/findobject' );
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
      console.log("fileSend 전");
      result = await fileSend(
        url.resolve(baseURL, '/findobject' ),
        'abc',
        '/root/image.jpg',
        'image.jpg'
     //   'image.jpg' : 실행 코드, 'dog.jpg' : 예제 파일
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

