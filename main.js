// app.js

// Express 모듈 불러오기
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')

// Express 앱 생성
const app = express();
const port = 3000;

//필요함수 정의
function readHTML(name){ //html 읽기
    var html = fs.readFileSync('html/' + name + '.html', 'utf-8');
    return html
}

//replace
function replaceAll(str, searchStr, replaceStr){
    return str.split(searchStr).join(replaceStr); 
}

function changeElements(original, elist){
  var text = original
  for(var i = 0; i < elist.length; i++){
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
    contentsList = fs.readdirSync('contents/')
    console.log(contentsList)
    
    contentHTMLs = [`<div class="contentsName"><h2>오늘의 급식</h2></div>`, `<div class="contentsName"><h2>생일자 안내</h2></div>`, `<div class="contentsName"><h2>주간 베스트</h2></div>`]
    html = changeElements(html, [{'key': 'contentslist', 'value': JSON.stringify(contentHTMLs)}])
    res.send(html)
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

//image 라우팅
app.get('/image/:name', function(request, response) {
    response.send(fs.readFileSync('image/' + request.params.name))
  });

//css 라우팅
app.get('/css/:name', function(request, response) {
      response.send(fs.readFileSync('css/' + request.params.name))
    });

//css 라우팅
app.get('/font/:name', function(request, response) {
    response.send(fs.readFileSync('font/' + request.params.name))
    });

//js 라우팅
app.get('/js/:name', function(request, response) {
    response.send(fs.readFileSync('js/' + request.params.name))
    });