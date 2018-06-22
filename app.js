const swig = require('swig'); // Ä£°å½âÎöÒýÇæ
const express = require('express'); // ´î½¨·þÎñÆ÷
const mongoose = require('mongoose'); // Êý¾Ý¿â²Ù×÷Ä£¿é
const bodyParser = require('body-parser'); // postÇëÇó½âÎö
const cookies = require('cookies'); // ÓÃÓÚ¶ÁÐ´cookies
const User = require('./models/user');
const app = express(); 

// Ö»Òª¿Í»§¶Ë·¢ËÍÇëÇó¾Í»áÍ¨¹ýÕâ¸öÖÐ¼ä¼þ
app.use((req, res, next) => {
    req.cookies = new cookies(req, res);

    /**
     * ½âÎöÓÃ»§µÄcookiesÐÅÏ¢
     * ²éÑ¯Êý¾Ý¿âÅÐ¶ÏÊÇ·ñÎª¹ÜÀíÔ± isAdmin
     * ×¢Òâ£º²éÑ¯Êý¾Ý¿âÊÇÒì²½²Ù×÷£¬nextÓ¦¸Ã·ÅÔÚ»Øµ÷Àï±ß
     */
    req.userInfo = {};
    if (req.cookies.get("userInfo")) {
        try {
            req.userInfo = JSON.parse(req.cookies.get("userInfo"));
            // ²éÑ¯Êý¾Ý¿âÅÐ¶ÏÊÇ·ñÎª¹ÜÀíÔ±
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

// ÎªreqÌí¼ÓbodyÊôÐÔ
app.use(bodyParser.urlencoded({extended: true}));

// È¡ÏûÄ£°å»º´æµÄÏÞÖÆ
swig.setDefaults({
    cache: false
});

// ÅäÖÃÄ£°åÒýÇæ
app.set('views', './views');
app.set('view cache', false);
app.set('view engine', 'html');
app.engine('html', swig.renderFile);

// ÉèÖÃ¾²Ì¬ÎÄ¼þÍÐ¹Ü
app.use('/public', express.static(__dirname + '/public'));

// »®·ÖÄ£¿é 
app.use('/', require('./routers/main'));// Ç°Ì¨Ä£¿é
app.use('/admin', require('./routers/admin'));// ºóÌ¨Ä£¿é
app.use('/api', require('./routers/api'));//APIÄ£¿é

// Á¬½ÓÊý¾Ý¿â
mongoose.connect('mongodb://localhost:27017/blog', (err) => {
    if (err) {
        console.log("database connecting error");
    } else {
        console.log("database connecting successful");
        // Æô¶¯±¾µØ·þÎñÆ÷£¬¼àÌý¶Ë¿Ú
        app.listen(8085, (req, res, next) => {
            console.log("app is running at port 8085");
        });
    }
});




