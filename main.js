b = require('./index');
var exec = require('child_process').exec;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }

const execPromise = str => {
  return new Promise ((resolve, reject) => {
    exec(str, (err, stdout, stderr) => {
      if(err) reject (err);
      else resolve(stdout);
  })
  })
};


function ttsCommand(msg) {
  var commandLine = "python3.6 /root/tts.py " + msg;
  exec(commandLine, puts);
}

async function sttCommand(second) {
  var recordCmd = "rec -c 1 -r 16000 /tmp/speech.wav trim 0 " + second;
  var ttsCmd = "python3 /root/python-docs-samples/speech/cloud-client/quickstart.py";
  exec(recordCmd);
  const stdout = await execPromise(ttsCmd);
  return stdout;
}

var Gpio = require('onoff').Gpio
var button = new Gpio(26, 'in', 'both')
button.watch(function (error, value) {
  if (error) {
    console.error(error)
    return
  }

  if (value === 0) {
    console.log('pressed')
    main()
  }
})

async function main(){
  while(1){
    //1. 메뉴 보기
    ttsCommand("사용하실 메뉴를 말해주십시오.");
    menu = await sttCommand();

    //2. 사용자 메뉴 선택 받아들이기.
    switch(){

    }


    //3. Function

  }






  b.naviModule('숭실대학교');
}
