const mongoose = require('mongoose');

const dataSchema = require('./data.js').dataSchema;

const cacheSchema = mongoose.Schema({
  id: Number,
  location: {
    lat: Number,
    lng: Number,
    imgSmall: String, // Should be 350x150px
    imgLarge: String, // Should be 1400x1000px
    description: String,
    name: String
  },
  data: [dataSchema]
});

module.exports = mongoose.model('Cache', cacheSchema);
