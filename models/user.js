const mongoose = require('mongoose');
const userSchema = require('../schemas/userSch');

module.exports = mongoose.model('User', userSchema);