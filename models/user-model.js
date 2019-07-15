const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
const { Schema } = mongoose;

const userSchema = new Schema({
    pseudo: { type: String, required: true },
    email: { type: String, set: toLower },
    firstName: String,
    lastName : String,
    gender: String,
    race: String,
    password: String,
    thumbnail: String,
    role: String,
    githubId: String,
    twitterId: String,
    strategy: { type: String, required: true },
    creationDate: { type: Date, default: Date.now },
    LastVisit: { type: Date, default: Date.now }
});

const User = mongoose.model('users', userSchema);
// This "user" model will represent the "users" collection.

module.exports = User;