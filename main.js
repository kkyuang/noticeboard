// app.js

// Express 모듈 불러오기
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')

// Express 앱 생성
const app = express();
const port = 3000;

//request 모듈
const request = require('request')

//특정시간 자동실행 모듈
const schedule = require('node-schedule');

//급식 HTML
//급식얻어오기
//년월일

let TodayMeal = {
  breakfast: '정보 없음',
  lunch: '정보 없음',
  dinner: '정보 없음'
}
let birthDay = {
  today: [],
  near:[
    {
      name: '',
      date: ''
    }
  ]
}

//급식 받아오기
function getMeal() {
  now = new Date()
  TodayDate = String(now.getFullYear()) + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0')
  console.log(TodayDate)

  const options = {
    uri: "https://open.neis.go.kr/hub/mealServiceDietInfo",
    qs: {
      "KEY": "7e2131be1e764f2ba264be98831be5b3", //neis에서 api키를 발급받아주세요 .
      "Type": "json",
      "ATPT_OFCDC_SC_CODE": "S10", //학교가 위치한 지역의 교육청 코드를 입력해주세요.
      "SD_SCHUL_CODE": "9010033", //학교 코드를 입력해주세요.
      "MLSV_YMD": TodayDate
    }
  }
  request(options, function (err, response, body) {
    mealInfo = JSON.parse(response.body).mealServiceDietInfo[1].row
    for (var i = 0; i < mealInfo.length; i++) {
      switch(mealInfo[i].MMEAL_SC_NM){
        case '조식':
          TodayMeal.breakfast = mealInfo[i].DDISH_NM
          break
        case '중식':
          TodayMeal.lunch = mealInfo[i].DDISH_NM
          break
        case '석식':
          TodayMeal.dinner = mealInfo[i].DDISH_NM
          break
      }
    }
  })
}

function isEQDate(left, right){
  if((new Date(left)).getMonth() == (new Date(right)).getMonth()){
    if((new Date(left)).getDate() == (new Date(right)).getDate()){
      return true
    }
  }
  return false
}
function compareDate(left, right){
  if((new Date(left)).getMonth() > (new Date(right)).getMonth()){
    return true
  }
  else if((new Date(left)).getMonth() < (new Date(right)).getMonth()){
    return false
  }
  else{
    if((new Date(left)).getDate() > (new Date(right)).getDate()){
      return true
    }
    else if((new Date(left)).getDate() < (new Date(right)).getDate()){
      return false
    }
    else{
      return false
    }
  }
}

//가까운 5명 생일자 받아오기
function getBirthDay(){
  now = new Date()
  TodayDate = String(now.getFullYear()) + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0')
  console.log(TodayDate)

  //생일자 명단 파일
  birthDayList = JSON.parse(fs.readFileSync('birth/birthdaylist.json'))

  //생일자 명단 -> 생일 순으로 정렬된
  birthDayListbyTime = []

  todaylist = []

  //오늘의 생일자 탐색
  for(var i = 0; i < birthDayList.length; i++){
    if(isEQDate(birthDayList[i].date, now)){
      todaylist.push(birthDayList[i])
    }

    if(birthDayListbyTime.length == 0){
      birthDayListbyTime[0] = birthDayList[i]
    }
    else if(birthDayListbyTime.length == 1){
      if(compareDate(birthDayList[i].date, birthDayListbyTime[0].date)){
        birthDayListbyTime[1] = birthDayList[i]
      }
      else{
        birthDayListbyTime.splice(0, 0, birthDayList[i])
      }
    }
    else{
      a = birthDayListbyTime.length - 1
  
      if(compareDate(birthDayList[i].date, birthDayListbyTime[birthDayListbyTime.length - 1].date)){
        birthDayListbyTime[birthDayListbyTime.length] = birthDayList[i]
      }
      else if(!compareDate(birthDayList[i].date, birthDayListbyTime[0].date)){
        birthDayListbyTime.splice(0, 0, birthDayList[i])
      }
      else{
        for(var j = 0; j < a; j++){
          if(compareDate(birthDayList[i].date, birthDayListbyTime[j].date) && !compareDate(birthDayList[i].date, birthDayListbyTime[j+1].date)){
            birthDayListbyTime.splice(j, 0, birthDayList[i])
            break
          }
        }
      }
    }
  }


  //가까운 생일자 5명 탐색
  var nearBirthPeople = []

  var count = 0
  for(var i = 0; i < birthDayListbyTime.length; i++){
    if(compareDate(birthDayListbyTime[i].date, now)){
      nearBirthPeople[count] = birthDayListbyTime[i]
      count++
      if(count == 5){
        break
      }
    }
  }

  for(var i = 0; i < todaylist.length; i++){
    birthDay.today[i] =todaylist[i].name
  }
  for(var i = 0; i < nearBirthPeople.length; i++){
    birthDay.near[i] = nearBirthPeople[i]
  }

  console.log(birthDay)
}

getMeal()
getBirthDay()
const refreshMeal = schedule.scheduleJob('10 0 0 * *', function () {
  getMeal()
  getBirthDay()
});


//필요함수 정의
function readHTML(name) { //html 읽기
  var html = fs.readFileSync('html/' + name + '.html', 'utf-8');
  return html
}

//replace
function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}

function changeElements(original, elist) {
  var text = original
  for (var i = 0; i < elist.length; i++) {
    text = replaceAll(text, '${' + elist[i]['key'] + '}', elist[i]['value'])
  }
  return text
}




// 메인 페이지
app.get('/', (req, res) => {
  html = readHTML('main')
  res.send(html)
});


// 전자게시판
app.get('/board', (req, res) => {
  html = readHTML('board')
  contentsList = JSON.parse(fs.readFileSync('contents/contentslist.json'))


  //콘텐츠 HTML 설정
  contentHTMLs = []
  nearBirthText = ''
  for(var i = 0; i < birthDay.near.length; i++){
    dateText = ((new Date(birthDay.near[i].date)).getMonth() + 1) + '월 ' + ((new Date(birthDay.near[i].date)).getDate()) + '일'
    nearBirthText += `${birthDay.near[i].name} : ${(dateText)} <br>`
  }
  for (var i = 0; i < contentsList.length; i++) {
    contentHTMLs[i] = `<div class="contentsName"><h2>${contentsList[i].name}</h2></div><div class="contentstext">${fs.readFileSync('contents/' + contentsList[i].path)}</div>`
    
    contentHTMLs[i] = changeElements(contentHTMLs[i],
      [{ 'key': 'breakfast', 'value': TodayMeal.breakfast },
      { 'key': 'lunch', 'value': TodayMeal.lunch },
      { 'key': 'dinner', 'value': TodayMeal.dinner },
      { 'key': 'todayBirth', 'value': birthDay.today.join(', ') },
      { 'key': 'nearBirth', 'value': nearBirthText }])
  }



  //디데이 HTML 설정
  DdayHTML = ""
  calinder = JSON.parse(fs.readFileSync('Calinder/calinder.json'))
  DdayList = []

  count = 0
  for (var i = 0; i < calinder.length; i++) {
    if (count > 4) {
      break
    }
    //디데이 구하기
    oldDate = new Date();
    newDate = new Date(calinder[i].date);
    let diff = Math.abs(newDate.getTime() - oldDate.getTime());
    diff = Math.ceil(diff / (1000 * 60 * 60 * 24));

    //디데이가 양수인 경우 제외
    if (diff < 0) {
      continue
    }

    count++
    DdayList[i] = {
      'dday': diff,
      'name': calinder[i].name
    }
  }

  for (var i = 0; i < DdayList.length; i++) {
    DdayHTML +=
      `
      <div class="calinderelement">
        <span class="D-Day">D-${DdayList[i].dday}</span>
        <span class="calinderText">${DdayList[i].name}</span>
      </div>
      `
  }


  html = changeElements(html, [{ 'key': 'contentslist', 'value': JSON.stringify(contentHTMLs) }, { 'key': 'D-day-list', 'value': DdayHTML }])
  res.send(html)
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

//image 라우팅
app.get('/image/:name', function (request, response) {
  response.send(fs.readFileSync('image/' + request.params.name))
});

//css 라우팅
app.get('/css/:name', function (request, response) {
  response.send(fs.readFileSync('css/' + request.params.name))
});

//css 라우팅
app.get('/font/:name', function (request, response) {
  response.send(fs.readFileSync('font/' + request.params.name))
});

//js 라우팅
app.get('/js/:name', function (request, response) {
  response.send(fs.readFileSync('js/' + request.params.name))
});