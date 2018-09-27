var exec = require('child_process').exec;

const execPromise = str => {
    return new Promise ((resolve, reject) => {
      exec(str, (err, stdout, stderr) => {
        if(err) reject (err);
        else resolve(stdout);
    })
    })
  };


module.exports = {
    soundCommand : async function(filename){
        var commandLine = 'mpg321 ~/sound/'+filename;
        await execPromise(commandLine);
    },
    ttsCommand : async function(msg) {
        var commandLine = 'python3 /root/tts.py ' + msg;
        await execPromise(commandLine);
    },
    sttCommand : async function(second){
        var ttsCmd = "python3 /root/python-docs-samples/speech/cloud-client/quickstart.py";
        var recordCmd = "rec -c 1 -r 16000 /tmp/speech.wav trim 0 " + second;
        await execPromise(recordCmd);
        const stdout = await execPromise(ttsCmd);
        return stdout;
    }
};
  
