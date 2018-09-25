var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }

const { URL } = require('url');
const request = require('./request');

const {baseURL} = require('./baseURL');
const path = require('path');

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


module.exports = {
    getMailModule : async function(){
        const MAIL_URL = path.join(baseURL, "/voicemail");
        const mailUrl = new URL(MAIL_URL);
        const mailOptions = {
          url: mailUrl.toString(),
          method: 'GET'
        };
        const mailResult = await request(mailOptions);
        console.log(mailResult);
        
        await ttsCommand(mailResult);
    }
  };


