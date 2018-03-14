$(document).ready(function () {

    var index_login;
    var index_register;

    // 点击登录
    $(".login").click(function () {
        index_login = layer.open({
            type: 1,
            title: "登录",
            closeBtn: 1,
            shadeClose: true,
            skin: 'layui-layer-molv',
            area: ['400px', '300px'], //宽高
            content: $(".login-dialog")
        });
    });

    // 点击注册
    $(".register").click(function () {
        index_register = layer.open({
            type: 1,
            title: "注册",
            closeBtn: 1,
            shadeClose: true,
            skin: 'layui-layer-molv',
            area: ['400px', '350px'], //宽高
            content: $(".register-dialog")
        });
    });

    // 点击小眼睛查看密码
    $(".dialog .eye").click(function () {
        var node_input = $(this).siblings("input");
        if (node_input.attr("type") === "password") {
            node_input.attr("type", "text");
            $(this).removeClass("eye_show").addClass("eye_hidden");
        } else {
            node_input.attr("type", "password");
            $(this).removeClass("eye_hidden").addClass("eye_show");
        }
    });

    var $registerBox = $(".register-dialog");
    var $loginBox = $(".login-dialog");

    // 表单提交注册
    $registerBox.find(".submit").click(function () {
        $.ajax({
            type: 'POST',
            url: '/api/register',
            dataType: 'json',
            data: {
                username: $registerBox.find('[name="username"]').val(),
                password: $registerBox.find('[name="password"]').val(),
                repeat: $registerBox.find('[name="repeat"]').val()
            },
            success: function (result) {
                if (result.code) { // 有错误发生
                    dialog_err(result.message, 2);
                } else {
                    dialog_err(result.message, 1, function () {
                        layer.close(index_register);// 关闭注册框
                        window.location.reload();// 重新加载页面
                    });
                }
            }
        });
    });

    // 表单提交登录
    $loginBox.find(".submit").click(function () {
        $.ajax({
            type: 'POST',
            url: '/api/login',
            dataType: 'json',
            data: {
                username: $loginBox.find('[name="username"]').val(),
                password: $loginBox.find('[name="password"]').val()
            },
            success: function (result) {
                if (result.code) {
                    // 登录的错误处理
                    dialog_err(result.message, 2);
                } else {
                    // 登录成功
                    dialog_err(result.message, 1, function () {
                        layer.close(index_login); // 关闭登录框
                        window.location.reload();// 重新加载页面
                    });
                }
            }
        });
    });

    // 点击退出登录
    $(".userInfo .logout").click(function () {
        $.ajax({
            type: 'POST',
            url: '/api/logout',
            success: function (result) {
                dialog_err(result.message, 1, function () {
                    window.location.reload();// 重新加载页面
                });
            }
        });
    });

});

// 当登录错误显示弹框
function dialog_err(text, icon, callback) {
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








