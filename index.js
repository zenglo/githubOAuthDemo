var express = require('express');
var request = require("request");
var qs = require('querystring')
var app = express();

app.use(express.static('public'));
app.set("json spaces", 2)

var client_id = "00257d0ff6c59880804c"; //注册github OAuth App时获得的client id
var client_secret = "ae5b85b761c26e16b43f70f1a7046299f6ee2537"; //注册github OAuth App时获得的client secret
var webRootUrl = "http://oauthtest.zenglong.top:8085"; //注册github OAuth App时填写的callback URL


var getCode_redirect_uri = '/oauthcode.do';
var app_UserAgent = "OAuth Demo"
app.get('/githubLogin.do', function(req, res) {
    var authUrl = 'https://github.com/login/oauth/authorize?';
    authUrl += "client_id=" + encodeURIComponent(client_id);
    authUrl += "&redirect_uri=" + encodeURIComponent(webRootUrl + getCode_redirect_uri);
    authUrl += "&state=" + "abcdefg";
    res.redirect(authUrl);
});

//github重定向到redirect_uri，并回传code
app.get(getCode_redirect_uri, function(req, res) {
    var response = {
        "code": req.query.code,
        "state": req.query.state
    };
    var tokenReq = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": req.query.code,
        "redirect_uri": webRootUrl + getCode_redirect_uri,
        "state": req.query.state
    };
    console.log(tokenReq);
    //获取token
    request.post({
        url: "https://github.com/login/oauth/access_token",
        headers: {
            'User-Agent': app_UserAgent
        },
        form: tokenReq
    }, function(e, r, tokenbody) {
        var tokenObj = qs.parse(tokenbody); //token
        //获取user信息
        request.get({
            url: "https://api.github.com/user?access_token=" + tokenObj.access_token,
            headers: {
                'User-Agent': app_UserAgent
            }
        }, function(e, r, body) {
            var userObj = JSON.parse(body);
            console.log(userObj);
            var result = {
                msg: "登录成功！！！",
                user: userObj
            }
            res.json(result);
        });
    });
});


var server = app.listen(8085, function() {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})