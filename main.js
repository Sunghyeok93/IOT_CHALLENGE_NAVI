video = require('./video');
navi = require('./index');
cam = require('./cam');
sendmail = require('./voicemail');
checkmail = require('./getmail');
var sys = require('sys');
var exec = require('child_process').exec;
var buttonPress;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }
kakao = require('./kakao');
const tokenFile = '/root/IOT_CHALLENGE_NAVI/token.txt'
var fs = require('fs');

const execPromise = str => {
  return new Promise ((resolve, reject) => {
    exec(str, (err, stdout, stderr) => {
      if(err) reject (err);
      else resolve(stdout);
  })
  })
};

function menuCheck(menu){
  if(menu.indexOf("길 찾")>-1){menu= "길 찾기";
  }else if(menu.indexOf("인식")>-1){menu= "물체 인식";
  }else if(menu.indexOf("저장")>-1){menu= "사진첩 저장";
  }else if(menu.indexOf("긴급")>-1){menu= "카카오";
  }else if(menu.indexOf("물건")>-1){menu= "물건 찾기";
  }else if(menu.indexOf("종료")>-1){menu = "종료";
  }else if(menu.indexOf("메시지")>-1){menu = "메시지 보내기";
  }else if(menu.indexOf("사서함")>-1){menu = "사서함 읽기";
  }else{console.log(menu); menu = "없음";}
  return menu;
}

async function sendKakaoMessage(){
  var tokenRead = fs.readFileSync(tokenFile, 'utf8');
  var tokenJson = JSON.parse(tokenRead);
  var accessToken = tokenJson['access_token'];
  var refreshToken = tokenJson['refresh_token'];
  if(await kakao.sendModule(accessToken)){
    console.log('카카오톡 메시지를 전송하였습니다.');
    return;
  }
  else{
    // 메세지 전송 실패시 토큰 갱신
    if(await kakao.refreshModule(refreshToken)){
      console.log('갱신 성공');
      //다시 카카오톡 보내기 기능 실행
      tokenRead = fs.readFileSync(tokenFile, 'utf8');
      tokenJson = JSON.parse(tokenRead);
      accessToken = tokenJson['access_token'];
      //fs.writeFileSync(tokenFile, accessToken, 'utf8');
      await kakao.sendModule(accessToken);
    }
    else{
      console.log('사용자 초기화 과정이 필요합니다.');
    }
  }
  return;
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

async function soundCommand(filename){
  var commandLine = 'mpg321 ~/sound/'+filename;
  await execPromise(commandLine);
}

var Gpio = require('onoff').Gpio
var buttonGreen = new Gpio(26, 'in', 'both')
buttonPress = 0;
buttonGreen.watch(async function (error, value) {
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
yellowPress = 0;
var buttonYellow = new Gpio(25, 'in','both')
buttonYellow.watch(async function (error, value){
  if(yellowPress===0){
    console.log('yellow');
    yellowPress=1;
    await sendKakaoMessage();
    yellowPress=0;
  }
})

var buttonBlack = new Gpio(41, 'in','both')
buttonBlack.watch(async function (eroor, value){
  console.log('black');
  process.exit(1);
})

video.videoModule();

async function main(){
   

 //1. 메뉴 보기
   await soundCommand("start.mp3");
    menu = await sttCommand('2');
    console.log(menu);
    menu = menuCheck(menu);
    //2. 사용자 메뉴 선택 받아들이기.
    switch(menu){
      case '길 찾기' : console.log(menu); await navi.naviModule(); break;

      case '물체 인식' : console.log(menu); await cam.camModule(); buttonPress = 0; break;

      case '사진첩 저장' : console.log(menu); await cam.photoBookModule(); buttonPress = 0; break;

      case '물건 찾기' : console.log(menu); await cam.objectCamModule(); buttonPress = 0; break;
      
      case '없음' : console.log(menu); await ttsCommand("잘못된 명령입니다."); main(); break;

// 추가해야할 부분

      case '사서함 읽기' : console.log(menu); await checkmail.getMailModule(); console.log("끝"); break;

      case '메시지 보내기' : console.log(menu); await sendmail.sendMailModule(); console.log("끝");break;

      case '종료' : console.log(menu); await ttsCommand("프로그램을 종료합니다."); buttonPress = 0; break;

    }





}

