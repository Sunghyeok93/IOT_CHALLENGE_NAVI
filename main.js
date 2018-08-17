navi = require('./index');
cam = require('./cam');
var sys = require('sys');
var exec = require('child_process').exec;
var buttonPress;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }
kakao = require('./kakao');
const tokenFile = '/root/token.txt'


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
     return menu;
  }
  if(menu.indexOf("사진")>-1){
    menu= "사진 촬영";
    return menu;
 }
 if(menu.indexOf("긴급")>-1){
  menu= "카카오";
  return menu;
}
if(menu.indexOf("카카오")>-1){
  menu= "카카오";
  return menu;
}
  if(menu.indexOf("종료")>-1){
    menu = "종료";
    return menu;
}
  menu = "없음";
  return menu;
}

async functhin sendKakaoMessage(){
  var tokenRead = fs.readFileSync(tokenFile, 'utf8');
  var tokenJson = JSON.parse(tokenRead);
  var accessToken = tokenJson['access_token'];
  var refreshToken = tokenJson['refresh_token'];
  if(await kakao.sendModule(accessToken)){
    console.log('카카오톡 메시지를 전송하였습니다.');
  }
  else{
    // 메세지 전송 실패시 토큰 갱신
    if(await kakao.refreshModule(refreshToken)){
      console.log('갱신 성공');
      //다시 카카오톡 보내기 기능 실행

    
    }
    else{
      console.log('사용자 초기화 과정이 필요합니다.');
    }
  }

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
buttonPress = 0;
button.watch(async function (error, value) {
  if(buttonPress===0){
    if (error) {
      console.error(error)
      return
    }

    if (value === 0) {
      console.log('pressed');
      buttonPress = 1;
      main();
    }
  }
})

async function main(){
    //1. 메뉴 보기
   await ttsCommand("사용하실 메뉴를 말씀해주십시오.");
    menu = await sttCommand('2');
    console.log(menu);
    menu = menuCheck(menu);
    //2. 사용자 메뉴 선택 받아들이기.
    switch(menu){
      case '길 찾기' : console.log(menu); await navi.naviModule(); break;

      case '사진 촬영' : console.log(menu); await cam.camModule(); buttonPress = 0; break;

      case '카카오' : console.log(menu); await sendKakaoMessage(); buttonPress = 0; break;

      case '없음' : console.log(menu); await ttsCommand("잘못된 명령입니다."); main(); break;

      case '종료' : console.log(menu); await ttsCommand("프로그램을 종료합니다."); buttonPress = 0; break;

    }





}

