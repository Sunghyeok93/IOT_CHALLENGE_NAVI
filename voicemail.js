command = require('./command');
const { baseURL } = require('./baseURL');
const url = require('url');
const { URL } = url;
const request = require('./request');

module.exports = {
  sendMailModule: async function () {
    await command.soundCommand("inputMessage.mp3");
    mail = await command.sttCommand('4'); // 메시지 전송 시간 수정 요망됨
    console.log(mail);
    const MAIL_URL = url.resolve(baseURL, '/voicemail');
    const mailUrl = new URL(MAIL_URL);
    const mailOptions = {
      url: mailUrl.toString(),
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      form: { 'content': mail, 'sender': 'ARTIK' }
    };
    const mailResult = await request(mailOptions);
    console.log(mailResult);
    if (mailResult == 200) {
      await command.soundCommand("messageSuccess.mp3");
    }
    else {
      await command.soundCommand("messageFail.mp3");
    }
  },
  getMailModule: async function () {
    const MAIL_URL = url.resolve(baseURL, "/voicemail");
    const mailUrl = new URL(MAIL_URL);
    const mailOptions = {
      url: mailUrl.toString(),
      method: 'GET'
    };
    while (1) {
      const mailResult = await request(mailOptions);
      console.log(mailResult);

      var count = mailResult.substring(0, 1);

      await command.ttsCommand(mailResult);
      if (count === "1" || count === "읽") {
        await command.soundCommand("endOfGetmail.mp3");
        break;
      }
      else {
        await command.soundCommand("askMoreResult.mp3");
        answer = await command.sttCommand('1');
        console.log(answer);
        if (answer.indexOf("예") > -1) {
          ///거절 시 프로그램 종료
        } else if (answer.indexOf("네") > -1) { }
        else {
          await command.soundCommand("endOfGetmail.mp3");
          break;
        }

      }

    }
  }
};



