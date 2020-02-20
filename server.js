
//引入websocket 的ws模块
var WebSocketServer = require('ws').Server,
 
//初始化websocket对象
wss = new WebSocketServer({ port: 8181 });
 
 
 
//初始数据对象
var stocks = {
    "AAPL": 95.0,
    "MSFT": 50.0,
    "AMZN": 300.0,
    "GOOG": 550.0,
    "YHOO": 35.0
}
 
//获取随机数据的函数
function randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
 
//定时器返回的句柄
var stockUpdater;
var randomStockUpdater=function(){
    for (var symbol in stocks) {  //遍历对象属性进行随机增加浮动数值
        if(stocks.hasOwnProperty(symbol)) {   //遍历对象非继承属性
            var randomizedChange = randomInterval(-150, 150);
            var floatChange = randomizedChange / 100;
            stocks[symbol] += floatChange;
        }
    }
 
	//随机时间间隔，获取一个数据区间中的随机数值
    var randomMSTime = randomInterval(500, 2500);  
 
    stockUpdater = setTimeout(function() {   //模拟股票数据变化，随机更改对象属性值
        randomStockUpdater();
    }, randomMSTime);
 
 
}
 
 
//执行模拟数据变化更新
randomStockUpdater();
 
//声明clientStocks接收客户端数据
var clientStocks = [];
 
//连接建立后
wss.on('connection', function (ws) {
 
	//定义数据更新函数
    var sendStockUpdates = function (ws) {
        if (ws.readyState == 1) {  //readyState为1表示已经建立连接
            var stocksObj = {};
            for (var i = 0; i < clientStocks.length; i++) {
              var symbol = clientStocks[i];
                stocksObj[symbol] = stocks[symbol];
            }
            if (stocksObj.length !== 0) {  //数据包内容不为空时将数据响应给客户端
                ws.send(JSON.stringify(stocksObj));//需要将对象转成字符串。WebSocket只支持文本和二进制数据
                console.log("更新", JSON.stringify(stocksObj));
            }
           
        }
    }
 
	//服务器端定时更新响应数据
    var clientStockUpdater = setInterval(function () {
        sendStockUpdates(ws);
    }, 1000);
 
	//服务器端接收到客户端发送过来的数据，根据请求的数据更新响应数据
    ws.on('message', function (message) {
        var stockRequest = JSON.parse(message);
        console.log("服务器收到的消息：", stockRequest);
        clientStocks = stockRequest['stocks'];
        sendStockUpdates(ws);
    });
 
});
