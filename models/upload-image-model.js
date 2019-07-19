const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
const { Schema } = mongoose;

var imageSchema = new mongoose.Schema({
  fieldname: String,
  originalname: String,
  encoding: String,
  mimeptype: String,
  destination: String,
  filename: String,
  path: String,
  size: Number,
  created_at: Date,
  updated_at: Date
});

const Image = mongoose.model('Image', imageSchema);
// This "user" model will represent the "users" collection.
module.exports = Image;

// https://stackoverflow.com/questions/37898526/uploading-multer-files-nodejs-to-mongo-database