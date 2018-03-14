const mongoose = require('mongoose');
const articleSch = require('../schemas/articleSch');

module.exports = mongoose.model('Article', articleSch);
