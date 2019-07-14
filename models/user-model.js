const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
const { Schema } = mongoose;

const userSchema = new Schema({
    username: String,
    googleId: String,
    twitterId: String,
    thumbnail: String,
    strategy: String
});

const User = mongoose.model('users', userSchema);
// This "user" model will represent the "users" collection.

module.exports = User;