var fs = require('fs');
const { URL } = require('url');
const request = require('./request');
require('dotenv').config();
const tokenFile = '/root/IOT_CHALLENGE_NAVI/token.txt'
const KAKAO_OAUTH_URL = 'https://kauth.kakao.com/oauth/token';
const KAKAO_SEND_URL = 'https://kapi.kakao.com/v2/api/talk/memo/send';
const KAKAO_REFRESH_URL = 'https://kauth.kakao.com/oauth/token';

const oauthUrl = new URL(KAKAO_OAUTH_URL);
const sendUrl = new URL(KAKAO_SEND_URL);
const refreshUrl = new URL(KAKAO_REFRESH_URL);
const kakaoCode = 'TnOhxPWfXdyLOWVYfIShr8nIgCDDrw56-jsONj6XwRnSRYFzPDrpHqMy8h-yPo6w_j8luAo8BhkAAAFl7K9V8A';  // kakao 코드 수정해줘야 할 때 이곳 수정만 하면 됨


// 한달에 한번 브라우저에서 유저 초기화 해줘서 아래 accessModule()의 code에 값 넣어줄 것.
// 사용자 동의 : https://kauth.kakao.com/oauth/authorize?client_id=ed09e5952335dc94545041c3a532e490&redirect_uri=http://localhost:5000/oauth&response_type=code

module.exports = {

  // 유저 값을 한달에 한번씩 초기화해줘야함.
  accessModule: async function () {
    const getOauth = async () => {
      const oauthOptions = {
        url: oauthUrl.toString(),
        method: 'POST',
        headers : {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
          'grant_type' : 'authorization_code',
          'client_id' : 'ed09e5952335dc94545041c3a532e490',
          'redirect_uri' : 'http://localhost:5000/oauth',
          'code' : kakaoCode // user_token 값 넣을것
        }
      };

      const accessData = await request(oauthOptions);
      console.log('access result : ' + accessData);
      const jsonAccess = JSON.parse(accessData);

      if(jsonAccess.hasOwnProperty('access_token'))
        return { 'access_token' : jsonAccess['access_token'] , 'refresh_token' : jsonAccess['refresh_token']};
      else
        return false;
    }
    return await getOauth();
  },

  // 직접적으로 access_token을 통해 사용자에게 카카오톡을 보내는 모듈
  sendModule: async function (accessToken) {
    const postMessage = async () => {
      const sendOptions = {
        url: sendUrl.toString(),
        method: 'POST',
        headers : {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Super Agent/0.0.1',
          'Authorization' : 'Bearer ' + accessToken
        },
        form: {
          'template_id' : '11707'
        }
      };
      const postResult = await request(sendOptions);
      const jsonResult = JSON.parse(postResult);

      if(jsonResult['result_code']===0)
        return true;
      else{
        console.log('카카오톡 메시지 전송 실패');
        console.log(postResult);
        return false;
      }
    }
    return await postMessage();
  },

  // access 토큰 값 초기화.
  refreshModule: async function (refreshToken) {
    const postRefreshToken = async () => {
      const refreshOptions = {
        url: oauthUrl.toString(),
        method: 'POST',
        headers : {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
          'grant_type' : 'refresh_token',
          'client_id' : 'ed09e5952335dc94545041c3a532e490',
          'refresh_token' : refreshToken
        }
      };

      const refreshData = await request(refreshOptions);
      console.log('refresh result : ' + refreshData);
      const jsonData = JSON.parse(refreshData);

      if(jsonData.hasOwnProperty('access_token')) {
        var tokenRead = fs.readFileSync(tokenFile, 'utf8');
        var tokenJson = JSON.parse(tokenRead);
        tokenJson['access_token'] = jsonData['access_token'];
	
	tokenString = JSON.stringify(tokenJson);
	console.log('###');
	console.log(tokenJson.stringify);
	fs.writeFileSync(tokenFile, tokenString , 'utf8')
        return true;
      }
      else
        return false;
    }
    return await postRefreshToken();
  }
}


