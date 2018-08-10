
module.exports = {
  naviModule : function(searchKeyword){
    require('dotenv').config();
    const fs = require('fs');
    const { URL } = require('url');
    const { TMAP_API_KEY } = process.env;
    const request = require('./request');
    const POI_URL = 'https://api2.sktelecom.com/tmap/pois';
    const NAVI_URL = 'https://api2.sktelecom.com/tmap/routes/pedestrian';
    const poiUrl = new URL(POI_URL);
    const naviUrl = new URL(NAVI_URL);
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'Super Agent/0.0.1'
    };
    // gps value reader
    function gpsReader(){
      const fileName = "/Users/sunghyeok/IOT_CHALLENGE_NAVI/gps.txt";
      const contents = fs.readFileSync(fileName, 'utf8');
      return JSON.parse(contents);
    }

    // 출발지, 도착지 위치 정보
    // Latitude = 위도 , Longitude = 경도
    // 도착지의 경우 TMAP의 POI 검색을 통해 RP FLAG 값을 받아와야 함.
    const startGps = gpsReader();
    const startLatitude = startGps['latitude'];
    const startLongitude = startGps['longitude'];
    // const startLatitude = 37.49427057802677;
    // const startLongitude = 126.9562342017889;


    // 점 사이 거리 구하는 함수
    function distance(lat1, lon1, lat2, lon2) {
      var radlat1 = Math.PI * lat1/180;
      var radlat2 = Math.PI * lat2/180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist * 1609.344;

      return dist;
    }

    function sleep(ms){
      ts1 = new Date().getTime() + ms;
      do ts2 = new Date().getTime(); while (ts2<ts1);
    }

    const getPath = async () => {
      // 목적지 정보 받기
      poiUrl.searchParams.set('version', 1);
      poiUrl.searchParams.set('searchKeyword', searchKeyword);
      poiUrl.searchParams.set('page', 1);
      poiUrl.searchParams.set('count', 1);
      poiUrl.searchParams.set('searchType', 'all'); // 명칭검색
      poiUrl.searchParams.set('resCoordType', 'WGS84GEO');
      poiUrl.searchParams.set('searchtypCd', 'A'); // R이면 거리순 검색(Radius 입력해줘야), A는 정확도순
      poiUrl.searchParams.set('appKey', TMAP_API_KEY);

    const poiOptions = {
      url: poiUrl.toString(),
        method: 'GET',
        headers
      };

      // 목적지 데이터 파싱
      const poiResult = await request(poiOptions);
      const poiJsonobj = JSON.parse(poiResult);
      const data = poiJsonobj['searchPoiInfo']['pois']['poi'];
      const endLatitude = data[0].frontLat;
      const endLongitude = data[0].frontLon;
      const endName = data[0].name;
      const endRpFlag = data[0].rpFlag;
      console.log('목적지 정보 수신 완료 : ' + endName);
      // console.log(poiResult);

      // 목적지 까지의 경로 정보 받기
      naviUrl.searchParams.set('version', 1);
      naviUrl.searchParams.set('startX', startLongitude);
      naviUrl.searchParams.set('startY', startLatitude);
      naviUrl.searchParams.set('endX', endLongitude);
      naviUrl.searchParams.set('endY', endLatitude);
      // naviUrl.searchParams.set('angle', 0 ~ 359); // 방향데이터 => 전송시 어떤 결과를 주는지 알아봐야할 듯
      // naviUrl.searchParams.set('speed', int값); // 진행속도(km/h)
      naviUrl.searchParams.set('endRpFlag', endRpFlag);
      // naviUrl.searchParams.set('endPoiId', String); // 목적지 POI ID
      naviUrl.searchParams.set('startName', '우리');
      naviUrl.searchParams.set('endName', endName);
      naviUrl.searchParams.set('sort', 'index'); // 인덱스순 정렬
      naviUrl.searchParams.set('resCoordType', 'WGS84GEO');
      naviUrl.searchParams.set('callback', 'WGS84GEO');
      naviUrl.searchParams.set('appKey', TMAP_API_KEY);

      const naviOptions = {
        url: naviUrl.toString(),
        method: 'POST',
        headers
      };

      // 경로 정보 파싱
      const naviResult = await request(naviOptions);
      const naviJsonObj = JSON.parse(naviResult);
      const naviProperties = naviJsonObj['features'][0]['properties'];
      const totalDistance = naviProperties['totalDistance'];
      const totalTime = naviProperties['totalTime'];
      console.log('경로 정보 수신 완료 : ' + totalDistance + '(m), ' + totalTime + '초 소요 예정');
      // console.log(naviResult);

      // 목적지까지의 포인트
      const featureNum = Object.keys(naviJsonObj['features']).length;
      var pointArray = new Array(featureNum);

      var pointNum = 0; // 목적지까지 도달해야할 포인트 개수.
      var currentPoint = 0; // 내가 현재 가고 있는 포인트 지점.
      var j = 0;
      for (var i = 0; i < featureNum; i++)
      {
        if(naviJsonObj['features'][i]['geometry']['type'] === 'Point'){
          pointNum = pointNum + 1;
          pointArray[j] = i;
          j = j + 1;
        }
      }
      // 목적지까지의 포인트들을 지나갈때마다 1이 증가하며 pointNum과 같아지면 목적지 도착.
      //
      console.log(pointArray);
      console.log(naviResult);
      // while (1)
      // {
      //   var currentGps = gpsReader();
      //   currentLat = currentGps['latitude'];
      //   currentLon = currentGps['longitude'];
      //
      //   if(currentPoint === pointNum) {
      //     console.log('목적지에 도착했습니다.');
      //     break;
      //   }
      //
      //   if(distance(currentLat, currentLon, naviJsonObj['features'][currentPoint]['geometry']['coordinates'][1], naviJsonObj['features'][currentPoint]['geometry']['coordinates'][0]) < 5.0){
      //     currentPoint = currentPoint + 1;
      //     console.log(naviJsonObj['features'][currentPoint]['properties']['description']);
      //   }
      //
      //   sleep(3000);
      //
      // };
    }
  getPath();
  }
};
