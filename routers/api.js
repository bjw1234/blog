const express = require('express');
const crypto = require('crypto');
const identicon = require('identicon.js');
const router = express.Router();
const User = require('../models/user'); // 引入user模型
const Article = require('../models/article');

// 定义一个中间件，统一返回格式
var responseData;
router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: ''
    };
    next();
});

/**
 * 处理用户注册
 */
router.post('/register', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let repeat = req.body.repeat;

    // 用户名为空
    if (!username) {
        responseData.code = 1;
        responseData.message = "用户名为空";
        res.json(responseData);
        return;
    }

    // 密码为空
    if (!password) {
        responseData.code = 2;
        responseData.message = "密码为空";
        res.json(responseData);
        return;
    }

    // 两次输入的密码不一致
    if (password != repeat) {
        responseData.code = 3;
        responseData.message = "两次输入的密码不一致";
        res.json(responseData);
        return;
    }

    // 查询数据库中用户名是否已经被注册
    User.findOne({
        username: username
    }).then(function (userInfo) {
        if (userInfo) {
            // 数据库中有该条记录
            responseData.code = 4;
            responseData.message = "该用户名已经被注册";
            res.json(responseData);
            return Promise.reject("注册过啦");
        }

        // 根据用户名生成随机头像
        let hash = crypto.createHash('md5');
        hash.update(username);
        let imgData = new identicon(hash.digest('hex')).toString();
        let imgUrl = 'data:image/png;base64,' + imgData;

        // 给数据库中添加该条信息
        var user = new User({
            username: username,
            password: password,
            head: imgUrl
        });

        return user.save();  // 返回promise对象
    }).then(function (newUserInfo) {
        responseData.message = "注册成功";
        responseData.userInfo = {
            _id: newUserInfo._id,
            username: newUserInfo.username
        };
        // 设置cookies
        req.cookies.set("userInfo", JSON.stringify(responseData.userInfo));
        res.json(responseData);

    }).catch(function (err) {
        console.log(err);
    });
});

/**
 * 处理用户登录
 */
router.post('/login', (req, res) => {
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    // 用户名为空
    if (!username) {
        responseData.code = 1;
        responseData.message = "用户名为空";
        res.json(responseData);
        return;
    }

    // 密码为空
    if (!password) {
        responseData.code = 2;
        responseData.message = "密码为空";
        res.json(responseData);
        return;
    }

    // 查询数据库
    User.findOne({
        username: username
    }).then(function (result) {
        if (result) { // 有这个用户名
            if (result.password === password) { // 密码正确
                responseData.message = "登录成功";
                responseData.userInfo = {
                    _id: result._id,
                    username: result.username
                };
                // 设置cookies
                req.cookies.set("userInfo", JSON.stringify(responseData.userInfo));
                res.json(responseData);
            } else {
                responseData.code = 6;
                responseData.message = "密码错误";
                res.json(responseData);
            }
        } else {
            responseData.code = 5;
            responseData.message = "用户名不存在";
            res.json(responseData);
        }
    });
});

/**
 * 处理用户退出登录
 */
router.post('/logout', (req, res) => {
    req.cookies.set("userInfo", null);
    responseData.message = "退出登录成功";
    res.json(responseData);
});

/**
 * 处理用户提交评论
 */
router.post('/comment/post', (req, res) => {
    let userid = req.userInfo._id;
    let username = req.userInfo.username;
    let article_id = req.body.article_id;
    let comment_txt = req.body.comment_txt || '';
    let time = new Date();

    if (comment_txt === '') { //评论内容为空
        responseData.code = 8;
        responseData.message = "评论内容不能为空!";
        res.json(responseData);
        return;
    }

    // 评论封装为一个对象
    responseData.data = {
        userid: userid,
        username: username,
        comment_txt: comment_txt,
        time: time
    };

    // 查询数据库将评论信息写入
    Article.findOne({
        _id: article_id
    }).then(article => {
        article.comments.unshift(responseData.data);
        return article.save();
    }).then(newArticle => {

        // 将新的内容返回给客户端
        addUserHead(newArticle.comments, (commentArr) => {
            responseData.data = commentArr;
            responseData.message = "评论成功！";
            res.json(responseData);
        });
    });
});

/**
 * 给用户传递某篇文章的所有评论
 */
router.get('/comment', (req, res) => {
    let article_id = req.query.article_id;
    // 查询数据库将评论信息写入
    Article.findOne({
        _id: article_id
    }).then(article => {
        // 将新的内容返回给客户端
        addUserHead(article.comments, (commentArr) => {
            responseData.data = commentArr;
            res.json(responseData);
        });
    });
});


// 给所有的用户添加头像，然后将数据返回
function addUserHead(commentArr, callback) {
    User.find().then(users => {
        for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < commentArr.length; j++) {
                if (commentArr[j].userid) { // 评论id存在
                    if (commentArr[j].userid === users[i]._id.toString()) { // 找到了评论对应的用户
                        if (users[i].head) { // 用户头像存在
                            commentArr[j].head = users[i].head;
                        }
                    }
                }
            }
        }
        // 执行回调
        callback && callback(commentArr);

    });
}


module.exports = router;