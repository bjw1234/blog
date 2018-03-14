var limit = 6;  // 限制条数
var cur_page = 1; // 当前page
var hashComments = []; // 对评论缓存

$(document).ready(function () {

    /**
     * 用户刷新
     */
    $.ajax({
        type: 'get',
        url: '/api/comment',
        data: {
            article_id: $('#article_id').val(),
        },
        success: function (response) {
            // 重新渲染评论列表
            renderCommentList(response.data);
        }
    });


    /**
     * 点击提交评论
     */
    $('.article-comment .comment-push').click(function () {
        let comment_input = $('.article-comment .comment-input');
        $.ajax({
            type: 'POST',
            url: '/api/comment/post',
            data: {
                article_id: $('#article_id').val(),
                comment_txt: comment_input.val()
            },
            success: function (response) {
                // 输入框置空
                comment_input.val('');

                console.log("评论成功");

                if (!response.code) {  // 评论成功
                    showDialog(response.message, 1, function () {
                        //window.location.reload();// 重新加载页面
                        // 重新渲染评论列表
                        console.log("重新渲染评论列表");
                        renderCommentList(response.data);
                    });
                } else {  // 评论失败
                    showDialog(response.message, 2);
                }
            }
        });
    });

    /**
     * 点击前一页
     */
    $('#comment-previous').click(function () {
        cur_page--;
        renderCommentList(hashComments);
    });
    /**
     * 点击后一页
     */
    $('#comment-next').click(function () {
        cur_page++;
        renderCommentList(hashComments);
    });
});

// 渲染评论列表
function renderCommentList(comments) {

    console.log(comments);

    // 对comments做一下缓存
    hashComments = comments;

    // 最大page
    var maxPage = Math.max(Math.ceil(comments.length / limit), 1);

    // 对页码做还原操作
    if (cur_page < 1) {
        cur_page++;
        return;
    }
    if (cur_page > maxPage) {
        cur_page--;
        return;
    }

    // 是否有前一页的判断
    if (cur_page === 1) {
        $('#comment-previous').html("没有前一页啦").css({
            "border": "none",
            "color": "#222",
            "background-color": "#fff"
        });
    } else {
        $('#comment-previous').html("<span aria-hidden=\"true\">&larr;</span>前一页").attr('style', '');
    }

    // 是否有后一页的判断
    if (cur_page === maxPage) {
        $('#comment-next').html("没有后一页啦").css({
            "border": "none",
            "color": "#222",
            "background-color": "#fff"
        });
    } else {
        $('#comment-next').html("后一页<span aria-hidden=\"true\">&rarr;</span>").attr('style', '');
    }

    // 对评论做分页处理
    var start = (cur_page - 1) * limit;
    var end = Math.min(start + limit, comments.length);

    var html = '';
    for (var i = start; i < end; i++) {
        html += '<div class="comment-item">';

        // 判断头像是否存在
        if (comments[i].head) {
            html += '<img class="comment-head" src="' + comments[i].head + '" alt="">';
        } else {
            html += '<img class="comment-head" src="/public/img/head.jpg" alt="">';
        }

        html += '<div class="item-top">' +
            '<span class="username">' + comments[i].username + '</span>' +
            '<span class="time">' + timeFormat(comments[i].time) + '</span>' +
            '</div>' +
            '<p class="comment-content">' + comments[i].comment_txt + '</p>' +
            '</div>';
    }
    // 插入评论
    $('.comment-list').html(html);

    // 对评论条数做处理
    $('#count').html(comments.length);
    $('#info-comments-count').html(comments.length);

    // 设置当前页和总页数'page-current'
    $('#page-count').text(maxPage);
    $('#page-current').text(cur_page);
}

// 对时间格式化
function timeFormat(d) {
    var date = new Date(d);
    return date.getFullYear() + '-' + formatNum(date.getMonth() + 1)
        + '-' + formatNum(date.getDate()) + ' ' + formatNum(date.getHours())
        + ':' + formatNum(date.getMinutes());
}

// 对不满十的加零处理
function formatNum(num) {
    if (num > 9) {
        return num;
    } else {
        return '0' + num;
    }
}

// 显示弹框
function showDialog(text, icon, callback) {
    layer.open({
        time: 1500,
        anim: 4,
        offset: 't',
        icon: icon,
        content: text,
        btn: false,
        title: false,
        closeBtn: 0,
        end: function () {
            callback && callback();
        }
    });
}