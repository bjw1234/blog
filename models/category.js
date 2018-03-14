const mongoose = require('mongoose');
const categorySch = require('../schemas/categorySch');

module.exports = mongoose.model('Category', categorySch);