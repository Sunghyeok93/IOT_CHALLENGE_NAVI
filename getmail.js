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

        const MAIL_URL = 'ec2-54-180-8-155.ap-northeast-2.compute.amazonaws.com:5000/getmail';
        const mailUrl = new URL(MAIL_URL);
        const mailOptions = {
        url: mailUrl.toString(),
          method: 'GET',
          headers
        };
        const mailResult = await request(mailOptions);
        console.log(mailResult);
        
        ////////////////////
        ///결과 JSON 처리
        ////////////////////
        
        
    


      
    }
  };


  
