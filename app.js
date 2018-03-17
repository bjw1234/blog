const swig = require('swig'); // 模板解析引擎
const express = require('express'); // 搭建服务器
const mongoose = require('mongoose'); // 数据库操作模块
const bodyParser = require('body-parser'); // post请求解析
const cookies = require('cookies'); // 用于读写cookies
const User = require('./models/user');
const app = express();

// 只要客户端发送请求就会通过这个中间件
app.use((req, res, next) => {
    req.cookies = new cookies(req, res);

    /**
     * 解析用户的cookies信息
     * 查询数据库判断是否为管理员 isAdmin
     * 注意：查询数据库是异步操作，next应该放在回调里边
     */
    req.userInfo = {};
    if (req.cookies.get("userInfo")) {
        try {
            req.userInfo = JSON.parse(req.cookies.get("userInfo"));
            // 查询数据库判断是否为管理员
            User.findById(req.userInfo._id).then(function (result) {
                req.userInfo.isAdmin = Boolean(result.isAdmin);
                next();
            });
        } catch (e) {
            next();
        }
    } else {
        next();
    }
});

// 为req添加body属性
app.use(bodyParser.urlencoded({extended: true}));

// 取消模板缓存的限制
swig.setDefaults({
    cache: false
});

// 配置模板引擎
app.set('views', './views');
app.set('view cache', false);
app.set('view engine', 'html');
app.engine('html', swig.renderFile);

// 设置静态文件托管
app.use('/public', express.static(__dirname + '/public'));

// 划分模块 
app.use('/', require('./routers/main'));// 前台模块
app.use('/admin', require('./routers/admin'));// 后台模块
app.use('/api', require('./routers/api'));//API模块

// 连接数据库
mongoose.connect('mongodb://localhost:27017/blog', (err) => {
    if (err) {
        console.log("database connecting error");
    } else {
        console.log("database connecting successful");
        // 启动本地服务器，监听端口
        app.listen(8085, (req, res, next) => {
            console.log("app is running at port 8085");
        });
    }
});




