//일기예보 불러와서 기온, 강수량 그래프 그려주는 모듈


//시간 데이터
let xAxisTime = [];
//기온 데이터
let tempData = []; 
//강수량 데이터
let rainData = [];



// OpenWeatherMap API 키
const apiKey = '9f69513a8f6d3b902b620ed1343f24f1'; // 여기에 자신의 API 키를 입력하세요
// API 호출 URL
const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=Jinju&appid=${apiKey}&units=metric`;

// API로부터 날씨 정보를 가져오는 함수
function fetchForecast() {
    //데이터 초기화
    xAxisTime = [];
    tempData = []; 
    rainData = [];
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('날씨 정보를 가져오는 데 문제가 발생했습니다.');
            }
            return response.json();
        })
        .then(data => {
            // 날씨 정보를 처리하여 화면에 표시

            const forecasts = data.list.slice(0, 32);
            forecasts.forEach(forecast => {
                const date = new Date(forecast.dt * 1000); // Unix 타임스탬프를 JavaScript 날짜 객체로 변환
                const dateText = date.toLocaleDateString('ko-KR', { day: 'numeric', hour: 'numeric' })
                const temp = forecast.main.temp;
                xAxisTime.push(dateText)
                tempData.push(temp)
                if(forecast.rain != undefined){
                    rainData.push(forecast.rain["3h"])
                }
                else{
                    rainData.push(0)
                }
            });
            drawChart(rainData, "rainChart")
            drawChart(tempData, "tempChart")


        })
        .catch(error => {
            console.error('날씨 정보 가져오기 에러:', error);
        });

        
} 

//날씨 데이터 차트를 그리는 함수
function drawChart(Yaxis, DivId) {
    console.log(Yaxis)
    //요소 초기화
    //document.getElementById(DivId).innerHTML = ""
    var myChart = echarts.init(document.getElementById(DivId)); // echarts init 메소드로 id=chart인 DIV에 차트 초기화
    myChart.clear()
    option = { // 차트를 그리는데 활용 할 다양한 옵션 정의
      xAxis: {
        type: 'category',
        data: xAxisTime // 위에서 정의한 X축 데이터
      },
      yAxis: {
        type: 'value',
        min: function (value) {
          return value.min - 1;
        }
      },
      series: [
        {
          data: Yaxis, // 위에서 정의한 값 데이터
          type: 'line', // 버튼의 value 데이터 ('line' or 'bar')
          areaStyle: {}
        }
      ],
      grid: [
        {
            top: 10,
            bottom: 0,
            left: 30
        }
      ]
    };

    myChart.setOption(option); // 차트 디스플레이
  }
