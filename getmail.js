command = require('./command');
var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }

const url = require('url');
const { URL } = url;
const request = require('./request');

const {baseURL} = require('./baseURL');

const execPromise = str => {
  return new Promise ((resolve, reject) => {
    exec(str, (err, stdout, stderr) => {
      if(err) reject (err);
      else resolve(stdout);
  })
  })
};
/*
async function soundCommand(filename){
  var commandLine = 'mpg321 ~/sound/'+filename;
  await execPromise(commandLine);
}


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

*/
module.exports = {
    getMailModule : async function(){
        const MAIL_URL = url.resolve(baseURL, "/voicemail");
        const mailUrl = new URL(MAIL_URL);
        const mailOptions = {
          url: mailUrl.toString(),
          method: 'GET'
        };
	while(1){
        const mailResult = await request(mailOptions);
        console.log(mailResult);
        
	var count = mailResult.substring(0,1);
	
        	await command.ttsCommand(mailResult);
		if(count==="1"||count==="읽"){
			await command.soundCommand("endOfGetmail.mp3");
			break;
		}
		else{
			await command.soundCommand("askMoreResult.mp3");	
			answer = await command.sttCommand('1');
		        console.log(answer);
   			if(answer.indexOf("예")>-1){
     			   	   ///거절 시 프로그램 종료
   			}else if(answer.indexOf("네")>-1){}
			else{
				await command.soundCommand("endOfGetmail.mp3");
				break;
			}

		}

	}
    }
  };


