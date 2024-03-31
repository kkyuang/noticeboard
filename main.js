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

// 메인 페이지
app.get('/', (req, res) => {
    html = readHTML('main') 
    res.send(html)
});


// 전자게시판
app.get('/board', (req, res) => {
    html = readHTML('board') 
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