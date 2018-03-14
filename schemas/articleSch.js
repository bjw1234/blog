const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    // 关联字段
    category: {
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用
        ref: 'Category'
    },
    // 作者
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // 添加事件
    addTime: {
        type: Date,
        default: new Date()
    },
    // 阅读量
    views: {
        type: Number,
        default: 0
    },
    // 标题
    title: String,
    // 简介
    description: {
        type: String,
        default: ''
    },
    // 内容
    content: {
        type: String,
        default: ''
    },

    // 评论
    comments: {
        type: Array,
        default: []
    }
});