const swig = require('swig'); // ģ���������
const express = require('express'); // �������
const mongoose = require('mongoose'); // ���ݿ����ģ��
const bodyParser = require('body-parser'); // post�������
const cookies = require('cookies'); // ���ڶ�дcookies
const User = require('./models/user');
const app = express();

// ֻҪ�ͻ��˷�������ͻ�ͨ������м��
app.use((req, res, next) => {
    req.cookies = new cookies(req, res);

    /**
     * �����û���cookies��Ϣ
     * ��ѯ���ݿ��ж��Ƿ�Ϊ����Ա isAdmin
     * ע�⣺��ѯ���ݿ����첽������nextӦ�÷��ڻص����
     */
    req.userInfo = {};
    if (req.cookies.get("userInfo")) {
        try {
            req.userInfo = JSON.parse(req.cookies.get("userInfo"));
            // ��ѯ���ݿ��ж��Ƿ�Ϊ����Ա
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

// Ϊreq���body����
app.use(bodyParser.urlencoded({extended: true}));

// ȡ��ģ�建�������
swig.setDefaults({
    cache: false
});

// ����ģ������
app.set('views', './views');
app.set('view cache', false);
app.set('view engine', 'html');
app.engine('html', swig.renderFile);

// ���þ�̬�ļ��й�
app.use('/public', express.static(__dirname + '/public'));

// ����ģ�� 
app.use('/', require('./routers/main'));// ǰ̨ģ��
app.use('/admin', require('./routers/admin'));// ��̨ģ��
app.use('/api', require('./routers/api'));//APIģ��

// �������ݿ�
mongoose.connect('mongodb://localhost:27017/blog', (err) => {
    if (err) {
        console.log("database connecting error");
    } else {
        console.log("database connecting successful");
        // �������ط������������˿�
        app.listen(8085, (req, res, next) => {
            console.log("app is running at port 8085");
        });
    }
});




