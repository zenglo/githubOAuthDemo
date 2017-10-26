var express = require('express');
var request = require("request");
var qs = require('querystring')
var app = express();

app.use(express.static('public'));

var client_id = "00257d0ff6c59880804c"; //注册github OAuth App时获得的client id
var client_secret = "ae5b85b761c26e16b43f70f1a7046299f6ee2537"; //注册github OAuth App时获得的client secret
var webRootUrl = "http://oauthtest.zenglong.top:8085"; //注册github OAuth App时填写的callback URL


var getCode_redirect_uri = '/oauthcode.do';
app.get('/githubLogin.do', function(req, res) {
    var authUrl = 'https://github.com/login/oauth/authorize?';
    authUrl += "client_id=" + encodeURIComponent(client_id);
    authUrl += "&redirect_uri=" + encodeURIComponent(webRootUrl + getCode_redirect_uri);
    authUrl += "&state=" + "abcdefg";
    res.redirect(authUrl);
});

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
    request.post({ url: "https://github.com/login/oauth/access_token", form: tokenReq }, function(e, r, tokenbody) {
        var tokenObj = qs.parse(tokenbody); //token
        request.get("https://api.github.com/user?access_token=" + tokenObj.access_token, function(e, r, body) {
            var tokenObj = JSON.parse(body);
            console.log(tokenObj);
            res.send(tokenObj);
        });
    });
});


var server = app.listen(8085, function() {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})