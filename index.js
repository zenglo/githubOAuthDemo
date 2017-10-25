var express = require('express');
var bodyParser = require('body-parser');
var http = require("http");
var app = express();

app.use(express.static('public'));

var client_id = "00257d0ff6c59880804c";
var client_secret = "ae5b85b761c26e16b43f70f1a7046299f6ee2537";
var webRootUrl = "http://oauthtest.zenglong.top";
var getCode_redirect_uri = '/oauthcode.do';

app.get('/githubLogin.do', function (req, res) {
  var authUrl = 'https://github.com/login/oauth/authorize?';
  authUrl += "client_id=" + encodeURIComponent(client_id);
  authUrl += "&redirect_uri=" + encodeURIComponent(webRootUrl + getCode_redirect_uri);
  authUrl += "&state=" + "abcdefg";
  res.redirect(authUrl);
  // res.send(authUrl);
});

app.get(getCode_redirect_uri, function (req, res) {
  var response = {
    "code": req.query.code,
    "state": req.query.state
  };

  var data = {
    "client_id": client_id,
    "client_secret": client_secret,
    "code": req.query.code,
    "redirect_uri": webRootUrl + getCode_redirect_uri,
    "state": req.query.state
  };
  data = require('querystring').stringify(data);
  console.log(data);
  var opt = {
    method: "POST",
    host: "https://github.com/login/oauth/access_token",
    port: 8080,
    path: "/login/oauth/access_token",
    headers: {
      "Content-Type": 'application/x-www-form-urlencoded',
      "Content-Length": data.length
    }
  };
  // 向服务端发送请求  
  var req = http.request({
    host: "https://github.com",
    path: '/login/oauth/access_token',
    method: 'POST',
    headers: {
      "Accept": "application/json",
    }
  }, function (response) {
    response.on('data', function (data) {
      var tokenInfo = JSON.parse(data);
      //调用api获取用户信息
    });
  });

  // console.log(response);
  // res.end(JSON.stringify(response));
  // // res.send(a);
});


var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s", host, port)

})