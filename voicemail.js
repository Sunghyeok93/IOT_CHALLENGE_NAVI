command = require('./command');
var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }

const {baseURL} = require('./baseURL');

const url = require('url');
const { URL } = url;

const request = require('./request');
/*
const execPromise = str => {
  return new Promise ((resolve, reject) => {
    exec(str, (err, stdout, stderr) => {
      if(err) reject (err);
      else resolve(stdout);
  })
  })
};

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
*/
module.exports = {
    sendMailModule : async function(){
        await command.soundCommand("inputMessage.mp3");
        mail = await command.sttCommand('4'); // 메시지 전송 시간 수정 요망됨
        const MAIL_URL = url.resolve(baseURL, '/voicemail');
        const mailUrl = new URL(MAIL_URL);
        const mailOptions = {
          url: mailUrl.toString(),
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          form: {'content' : mail, 'sender':'ARTIK'}
        };
        const mailResult = await request(mailOptions);
        console.log(mailResult);
        if(mailResult == 200){
            await command.soundCommand("messageSuccess.mp3");
        }
        else{
            await command.soundCommand("messageFail.mp3");
        }     
    }
  };


  
