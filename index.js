var express = require('express');
var request = require("request");
var qs = require('querystring');
var session = require('express-session');
var uuidv4 = require('uuid/v4');
var app = express();

app.use(session({
    secret: "OAuthDemo",
}));
// app.use(express.static('public'));
app.set("json spaces", 2)

var client_id = "00257d0ff6c59880804c"; //注册github OAuth App时获得的client id
var client_secret = "ae5b85b761c26e16b43f70f1a7046299f6ee2537"; //注册github OAuth App时获得的client secret
var webRootUrl = "http://oauthtest.zenglong.top:8085"; //注册github OAuth App时填写的callback URL


var getCode_redirect_uri = '/oauthcode.do';
var app_UserAgent = "OAuthDemo"

app.get('/', function(req, res) {
    if (isLogin(req)) {
        return res.redirect("/user");
    }
    res.sendFile(__dirname + "/public/" + "index.html");
})

app.get('/user', function(req, res) {
    if (!isLogin(req)) {
        return res.redirect("/");
    }
    var loginInfo = getLoginInfo(req);
    res.write(loginInfo.user);
    res.write("<div><a href='/logout'>注销</a></div>");
    res.end();
})

app.get('/logout', function(req, res) {
    logout(req);
    res.redirect("/");
})

app.get('/githubLogin.do', function(req, res) {
    if (isLogin(req)) {
        return res.redirect("/user");
    }
    req.session.oauthState = uuidv4();
    var authUrl = 'https://github.com/login/oauth/authorize?';
    authUrl += "client_id=" + encodeURIComponent(client_id);
    authUrl += "&redirect_uri=" + encodeURIComponent(webRootUrl + getCode_redirect_uri);
    authUrl += "&state=" + encodeURIComponent(req.session.oauthState);
    res.redirect(authUrl);
});

//github重定向回redirect_uri，并回传code和state
app.get(getCode_redirect_uri, function(req, res) {
    if (isLogin(req)) {
        return res.redirect("/user");
    }
    if (req.session.oauthState !== req.query.state) {
        return res.redirect("/");
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
    }, function(err, r, tokenbody) {
        if (err) {
            console.error('failed:', err);
            res.redirect("/");
            return;
        }
        var tokenObj = qs.parse(tokenbody);
        if (tokenObj.error) {
            console.error('failed:', tokenObj);
            var result = {
                msg: "登录失败！！！",
                response: tokenObj
            }
            res.json(result);
            return;
        }
        //token获取成功，app内应保存token以在后续免登陆
        //获取user信息
        request.get({
            url: "https://api.github.com/user?access_token=" + tokenObj.access_token,
            headers: {
                'User-Agent': app_UserAgent
            }
        }, function(err, r, body) {
            if (err) {
                console.error('failed:', err);
                res.redirect("/");
                return;
            }
            var userObj = JSON.parse(body);
            if (userObj.login) {
                console.log(userObj);
                login(req, tokenObj, userObj);
                var result = {
                    msg: "已登录成功！！！",
                    user: userObj
                }
                res.json(result);

            } else {
                console.error('failed:', userObj);
                var result = {
                    msg: "登录失败！！！",
                    response: userObj
                }
                res.json(result);
            }
        });
    });
});

function isLogin(req) {
    return req.session.loginInfo;
}

function login(req, token, user) {
    req.session.loginInfo = {
        token: token,
        user: user
    }
}

function getLoginInfo(req) {
    return req.session.loginInfo;
}

function logout(req) {
    req.session.destroy();
}

var server = app.listen(8085, function() {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})