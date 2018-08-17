var fs = require('fs');
kakao = require('./kakao');
const tokenFile = '/root/token.txt'

async function main(){

  //한달에 한번 사용자 코드 초기화
  var returnValue = await kakao.accessModule();
  if(returnValue !== false) {
    var tokenString = JSON.stringify(returnValue);
    fs.writeFileSync(tokenFile, tokenString, 'utf8'); // 사용자 코드 값 수정
  }
  else {
    console.log('사용자 초기화 실패');
  }


  // 카카오톡 보내기 기능
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


  await kakao.refreshModule(refreshToken);


}

main();
