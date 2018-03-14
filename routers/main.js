const express = require('express');
const User = require('../models/user');
const Article = require('../models/article');
const Category = require('../models/category');
const marked = require('marked');
const hljs = require('highlight.js');
let router = express.Router();

// marked相关配置
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    highlight: function (code) {
        return hljs.highlightAuto(code).value;
    }
});


// 需要传递给前端的数据
let data = {};

// 中间件
router.use((req, res, next) => {
    // 置空
    data = {};

    data.userInfo = req.userInfo; // 用户信息

    Category.find().then((categories) => { // nav分类信息
        data.categories = categories;
        return User.findOne({
            _id: data.userInfo._id
        });
    }).then(userInfo => {
        if (userInfo && userInfo.head) {
            data.head = userInfo.head;
        }
        next();
    }).catch((err) => {
        console.log(err);
    });
});

/**
 * 用户访问首页或其他分类页时
 */
router.get('/', (req, res) => {

    // 将信息整合之后存储
    data.category = req.query.category || '';// 当前文章的分类
    data.articles = [];  // 文章数组
    data.page = 1; // 当前页
    data.maxPage = 1; // 最大页,
    data.url = '/';

    // 对查询文章的条件进行限制
    let where = {};
    if (data.category) { // 用户传过来了当前文章的分类
        where.category = data.category;
    }

    // 文章数量查询
    Article.where(where).count().then((count) => {

        let limit = 5; // 每页显示的条数

        // 接收传过来的page
        let query_page = Number(req.query.page) || 1;
        query_page = Math.min(Math.ceil(count / limit), query_page); // 限制最大值 count/limit向上取整
        query_page = Math.max(query_page, 1);  // 限制最小为1

        let cur_page = query_page;  // 当前页
        let skip = (cur_page - 1) * limit; //忽略的条数

        // 文章查询
        return Article.where(where).find().sort({addTime: -1}).limit(limit)
            .skip(skip).populate(['category', 'user']).then((articles) => {

                data.articles = articles;
                data.page = cur_page;
                data.maxPage = Math.ceil(count / limit);
            });
    }).then(() => {
        // 渲染页面
        res.render('main/index', {
            title: 'index',
            data: data
        });
    }).catch((err) => {
        console.log(err);
    });
});

/**
 * 用户访问某一篇文章
 */
router.get('/views', (req, res) => {
    // 获取当前文章的id
    let id = req.query.article_id || '';

    Article.findOne({
        _id: id
    }).populate(['category', 'user']).then(article => {

        // 如果该文章不存在
        if (!article) {
            res.render('main/views', {
                title: '文章详情',
                data: data
            });
            return;
        }

        // 阅读量加一
        article.views++;
        article.save();

        // 文章以及分类
        data.article = article;
        data.category = article.category._id.toString();

        // 对内容进行markdown语法转换
        data.article_content_html = marked(article.content);

        // 对文章评论做分页处理
        // let limit = 3;
        // let count = article.comments.length;
        //
        // // // 接收传过来的page
        // let query_page = Number(req.query.page) || 1;
        // query_page = Math.min(Math.ceil(count / limit), query_page);
        // query_page = Math.max(query_page, 1);
        //
        // let cur_page = query_page;  // 当前页
        // let skip = (cur_page - 1) * limit; //忽略的条数
        //
        // console.log("count ==== > " + count);
        //
        // // // 对这个数组切割
        // data.commentsArr = article.comments.slice(skip, Math.min((skip + limit), count));
        //
        // data.page = cur_page;
        // data.maxPage = Math.ceil(count / limit);

        res.render('main/views', {
            title: '文章详情',
            data: data
        });
    });
});

module.exports = router;
