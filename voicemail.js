var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }

const { URL } = require('url');
const request = require('./request');


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
    camModule : async function(){
        await ttsCommand("보내실 메시지를 말씀하세요.");
        mail = await sttCommand('2');
        console.log(mail);
        
        const MAIL_URL = 'http://ec2-52-79-239-17.ap-northeast-2.compute.amazonaws.com:5000/mail';
        const mailUrl = new URL(MAIL_URL);
        const mailOptions = {
        url: mailUrl.toString(),
          method: 'GET',
          headers
        };
        const mailResult = await request(mailOptions);
        console.log(mailResult);
        
        if(mailResult === 1){
            await ttsCommand("메시지가 정상 전달 되었습니다.");
        }
        else{
            await ttsCommand("메시지 전송 실패.");
        }
    


      
    }
  };


  
