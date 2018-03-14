const express = require('express');
const User = require('../models/user');
const Category = require('../models/category');
const Article = require('../models/article');
const router = express.Router();

router.use((req, res, next) => {
    if (!req.userInfo.isAdmin) {
        res.send("<h2>只有管理员才能进入后台管理！</h2>");
        return;
    }
    next();
});

/**
 * 访问后台管理页面
 */
router.get('/', (req, res) => {

    // 渲染页面
    res.render('admin/index', {
        userInfo: req.userInfo
    });

});

/**
 * 用户管理
 *  查询数据库找到所有数据
 *  limit(number) : 限制获取的数据条数
 *  skip(Number): 忽略数据的条数 前number条
 */
router.get('/user', (req, res) => {

    // 获取请求的page并做限制
    User.count().then((count) => {

        let limit = 10; // 每页显示的条数

        // 接收传过来的page
        let query_page = Number(req.query.page) || 1;
        query_page = Math.min(Math.ceil(count / limit), query_page); // 限制最大值 count/limit向上取整
        query_page = Math.max(query_page, 1);  // 限制最小为1

        let cur_page = query_page;  // 当前页
        let skip = (cur_page - 1) * limit; //忽略的条数

        User.find().limit(limit).skip(skip).then((users) => {
            // 渲染页面
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                page: cur_page,
                maxPage: Math.ceil(count / limit),
                url: '/admin/user'
            });
        });

    });
});


/**
 * 博文分类首页
 */
router.get('/category', (req, res) => {
    Category.count().then((count) => {

        let limit = 10; // 每页显示的条数

        // 接收传过来的page
        let query_page = Number(req.query.page) || 1;
        query_page = Math.min(Math.ceil(count / limit), query_page); // 限制最大值 count/limit向上取整
        query_page = Math.max(query_page, 1);  // 限制最小为1

        let cur_page = query_page;  // 当前页
        let skip = (cur_page - 1) * limit; //忽略的条数

        Category.find().sort({_id: -1}).limit(limit).skip(skip).then((categories) => {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                page: cur_page,
                maxPage: Math.ceil(count / limit),
                url: '/admin/category'
            });
        });
    }).catch((err) => {
        console.log(err);
    });
});

/**
 * 博文分类添加页面
 */
router.get('/category/add', (req, res) => {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    });
});

/**
 * 用户表单提交分类的名称
 */
router.post('/category/add', (req, res) => {
    let name = req.body.category_name || '';

    // 提交内容非空判断
    if (name == '') {
        res.render('admin/fail', {
            userInfo: req.userInfo,
            message: '分类内容不能为空!'
        });
        return;
    }

    // 提交内容是否存在判断
    Category.findOne({
        category_name: name
    }).then((result) => {
        if (result) {  // 说明已经存在
            res.render('admin/fail', {
                userInfo: req.userInfo,
                message: '您要添加的分类已经存在!'
            });
            return Promise.reject("分类已经存在");
        } else {  // 存储这个分类数据
            return new Category({category_name: name}).save();
        }
    }).then((newResult) => {
        console.log(newResult);
        // 提醒用户添加成功
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类添加成功!',
            url: '/admin/category'
        });

    }).catch((err) => {
        // 错误处理
        console.log(err);
    });
});

/**
 * 分类删除
 */
router.get('/category/delete', (req, res) => {
    let id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类删除成功!',
            url: '/admin/category'
        });
    });
});

/**
 * 分类编辑
 */

// 设置一个变量，存储用户想要编辑的这条信息
let category_edit = {};

router.get('/category/edit', (req, res) => {
    let id = req.query.id;
    Category.findOne({
        _id: id
    }).then((category) => {
        if (category) {
            // 打开编辑页面，编辑这条数据
            category_edit = category;
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category.category_name,
                url: '/admin/category'
            });
        } else {
            // 出错
            res.render('admin/fail', {
                userInfo: req.userInfo,
                message: '编辑出错！',
                url: '/admin/category'
            });
        }
    });
});

/**
 * 分类修改信息提交
 */
router.post('/category/edit', (req, res) => {
    // 拿到用户修改的内容
    let name = req.body.category_name || '';
    if (name === category_edit.category_name) { // 用户原封不动的提交
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类修改成功!',
            url: '/admin/category'
        });
        return;  // 无需往下执行
    }

    if (name === '') {  // 用户将空内容提交
        res.render('admin/fail', {
            userInfo: req.userInfo,
            message: '提交的内容为空!',
            url: '/admin/category'
        });
        return;  // 无需往下执行
    }

    Category.findOne({
        category_name: name
    }).then((result) => {
        if (result) {
            // 用户提交、编辑的名称已经存在
            res.render('admin/fail', {
                userInfo: req.userInfo,
                message: '该分类已经存在！',
                url: '/admin/category'
            });
        } else {
            // 更新这条信息
            Category.update({
                _id: category_edit._id
            }, {
                category_name: name
            }).then(() => {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '分类修改成功!',
                    url: '/admin/category'
                });
            });
        }
    });

});

/**
 * 文章管理首页
 */
router.get('/article', (req, res) => {
    Article.count().then((count) => {

        let limit = 5; // 每页显示的条数

        // 接收传过来的page
        let query_page = Number(req.query.page) || 1;
        query_page = Math.min(Math.ceil(count / limit), query_page); // 限制最大值 count/limit向上取整
        query_page = Math.max(query_page, 1);  // 限制最小为1

        let cur_page = query_page;  // 当前页
        let skip = (cur_page - 1) * limit; //忽略的条数

        Article.find().sort({_id: -1}).limit(limit)
            .skip(skip).populate(['category', 'user']).then((articles) => {

            res.render('admin/article_index', {
                userInfo: req.userInfo,
                articles: articles,
                page: cur_page,
                maxPage: Math.ceil(count / limit),
                url: '/admin/article'
            });
        });
    }).catch((err) => {
        console.log(err);
    });
});

/**
 * 文章添加页面
 */
router.get('/article/add', (req, res) => {

    // 数据库中查找分类
    Category.find().sort({_id: -1}).then(categories => {
        res.render('admin/article_add', {
            userInfo: req.userInfo,
            categories: categories
        });
    });
});

/**
 * 文章添加操作
 */
router.post('/article/add', (req, res) => {

    // 定义返回数据的格式
    let responseData = {
        code: 0,
        message: ''
    };

    // 非空判断
    let title = req.body.title || '';
    let category = req.body.category || '';
    let description = req.body.description || '';
    let content = req.body.content || '';

    if (title === '' || description === '' || content === '') {
        responseData.code = 22;
        responseData.message = "标题、简介或内容为空!";
        res.json(responseData);
        return;
    }
    // 标题不能重复
    Article.findOne({
        title: title
    }).then((article) => {
        if (article) {  // 该标题已经存在
            responseData.code = 33;
            responseData.message = "该文章标题已经存在!";
            res.json(responseData);
            return Promise.reject("标题存在");
        } else {
            // 将用户提交的数据加入数据库
            return new Article({
                title: title,
                user: req.userInfo._id.toString(),
                addTime: new Date(),
                category: category,
                description: description,
                // content: content
                content: new Buffer(content, 'base64').toString()
            }).save();
        }
    }).then(() => {

        // 添加成功
        // res.render('admin/success', {
        //     userInfo: req.userInfo,
        //     message: '文章添加成功!',
        //     url: '/admin/article'
        // });
        responseData.message = "文章添加成功！";
        res.json(responseData);
    }).catch(err => {
        console.log(err);
    });
});

/**
 * 文章的删除操作
 */
router.get('/article/delete', (req, res) => {
    let id = req.query.id || '';
    Article.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '文章删除成功!',
            url: '/admin/article'
        });
    });
});

/**
 * 文章的修改页面
 */
router.get('/article/edit', (req, res) => {
    let id = req.query.id;
    Article.findOne({
        _id: id
    }).populate('category').then(article => {  // 关联到这个字段
        if (!article) {   // 想要修改的内容不存在
            res.render('admin/fail', {
                userInfo: req.userInfo,
                message: '想要修改的内容不存在!'
            });
        } else {
            // 打开修改页面,渲染数据
            Category.find().then(categories => {  // 找到所有的分类
                if (categories) {
                    res.render('admin/article_edit', {
                        userInfo: req.userInfo,
                        categories: categories,
                        article: article,
                        url: '/admin/article'
                    });
                } else {
                    res.render('admin/fail', {
                        userInfo: req.userInfo,
                        message: '您还未添加分类!'
                    });
                }
            });
        }
    });
});

/**
 * 文章修改信息提交
 */
router.post('/article/edit', (req, res) => {

    // 定义返回数据的格式
    let responseData = {
        code: 0,
        message: ''
    };

    let id = req.body.id;

    // 非空判断
    let title = req.body.title || '';
    let category = req.body.category || '';
    let description = req.body.description || '';
    let content = req.body.content || '';

    if (title === '' || description === '' || content === '') {
        responseData.code = 66;
        responseData.message = '标题、简介或内容为空!';
        res.json(responseData);
        return;
    }

    Article.findOne({
        _id: id
    }).then(article => {
        if (!article) {
            // res.render('admin/fail', {
            //     userInfo: req.userInfo,
            //     message: '修改出错!',
            //     url: '/admin/article'
            // });
            responseData.code = 77;
            responseData.message = '修改出错!';
            res.json(responseData);
            return Promise.reject('修改出错');
        }

        // 修改这条数据
        return Article.update({_id: id}, {
            title: title,
            category: category,
            description: description,
            content: new Buffer(content, 'base64').toString()
        });
    }).then(() => {
        // 修改成功
        // res.render('admin/success', {
        //     userInfo: req.userInfo,
        //     message: '文章内容修改成功!',
        //     url: '/admin/article'
        // });
        responseData.message = '文章内容修改成功!';
        res.json(responseData);
    });
});

/**
 * 删除用户 以及该用户的留言
 */
router.get('/user/delete', (req, res) => {
    let id = req.query.id || '';

    // 删除该用户对文章的所有评论
    Article.find().then(articles => {
        for (let i = 0; i < articles.length; i++) {
            // 该文章对应的所有评论
            let commentArr = articles[i].comments;
            for (let j = 0; j < commentArr.length; j++) {
                if (commentArr[j].userid && commentArr[j].userid === id) {  // 找到了对应的评论

                    // 删除指定评论
                    commentArr.splice(commentArr.findIndex(item => {
                        return item.userid === id;
                    }), 1);

                    //  保存数据库
                    articles[i].save();
                }
            }
        }

        // 删除指定用户
        return User.remove({
            _id: id
        });

    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '用户删除成功!',
            url: '/admin/user'
        });
    });
});

module.exports = router;