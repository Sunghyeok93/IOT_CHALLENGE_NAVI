navi = require('./index');
cam = require('./cam');
var sys = require('sys');
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

function menuCheck(menu){
  if(menu.indexOf("길 찾")>-1){
     menu= "길 찾기";
  }
  if(menu.indexOf("사진"")>-1){
    menu= "사진 촬영"";
 }
  return menu;
}


function sleep(ms){
  var ts1 = new Date().getTime() + ms;
  do var ts2 = new Date().getTime(); while (ts2<ts1);
}

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

var Gpio = require('onoff').Gpio
var button = new Gpio(26, 'in', 'both')
button.watch(async function (error, value) {
  if(buttonPress===0){
    if (error) {
      console.error(error)
      return
    }

    if (value === 0) {
      console.log('pressed');
      buttonPress = 1;
      await main();
    }
  }
})

async function main(){
    //1. 메뉴 보기
   await ttsCommand("사용하실 메뉴를 말씀해주십시오.");
    menu = await sttCommand('2');
    menu = menuCheck(menu);
    navi.naviModule()
    //2. 사용자 메뉴 선택 받아들이기.
    switch(menu){
      case '길 찾기' : console.log(menu); await navi.naviModule(); buttonPress = 0; break;

      case '사진 촬영' : console.log(menu); cam.camModule(); break;





    }





}

