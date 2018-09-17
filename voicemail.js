var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }

const { URL } = require('url');
const request = require('./request');
const execPromise = str => {
  return new Promise ((resolve, reject) => {
    exec(str, (err, stdout, stderr) => {
      if(err) reject (err);
      else resolve(stdout);
  })
  })
};

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


module.exports = {
    sendMailModule : async function(){
        await ttsCommand("보내실 메시지를 말씀하세요.");
        mail = await sttCommand('4'); // 메시지 전송 시간 수정 요망됨
        const MAIL_URL = 'http://ec2-54-180-8-155.ap-northeast-2.compute.amazonaws.com:5000/voicemail';
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
            await ttsCommand("메시지가 정상 전달 되었습니다.");
        }
        else{
            await ttsCommand("메시지 전송 실패.");
        }     
    }
  };


  
